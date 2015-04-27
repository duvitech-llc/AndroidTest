if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function (require, exports) {

	'use strict';
	
	/* -------- IMPORTS -------- */
	var DeviceList = require('com.emmoco.core/DeviceList');
	var SchemaWrapper = require('com.emmoco.core/SchemaWrapper');
	var SerialPacket = require('com.emmoco.core/SerialPacket');
	var Utils = require('com.emmoco.core/Utils');
	
	var Mailbox = undefined;
	
	var FILE_NONE = -1;
	var FILE_PREP = -2;
	
	var CLOSE_TIMEOUT = 10000;
	var OPEN_TIMEOUT = 20000;
	var RDWR_TIMEOUT = 20000;
	
    var SYS_MCM_NAME = -11;
    var SYS_SCHEMA_HASH = -6;

    var Kind = SerialPacket.PktKind;
	var Op = Utils.EnumT(
		'NONE',
		'CLOSE',
		'OPEN',
		'READ',
		'SCAN',
		'WRITE'
	);
	
	var OP_METHOD = {
		CLOSE:	"closeDevice",	
		OPEN:	"openDevice",	
		READ:	"readResource",	
		SCAN:	"scanDevices",	
		WRITE:	"writeResource",	
	};
	
	var sCurDev = null;
	var sCurFileIdx = FILE_NONE;
	var sCurOp = Op.NONE;
	var sCurOpCB = null;
	var sCurVal = null;
	var sDevTab = {};
	var sDisconnectResId = undefined;
	var sFileIdxResId = undefined;
	var sIsConnected = false;
	var sOnConnectFxn = null;
	var sOnDisconnectFxn = null;
	var sOnErrorFxn = null;
	var sOnFetchFxn = null;
	var sOnIndicatorFxn = null;
	var sOnStoreFxn = null;
	var sProvider = null;
	var sReqPkt = SerialPacket.create();
	var sTimeout = null;
	
	/* -------- PUBLICS -------- */

	function addSchema(jsonObj) {
		var sw = SchemaWrapper.addSchema(jsonObj);
		if (!sDisconnectResId) {
			sDisconnectResId = sw.mkResourceValue('$mcmDisconnect').resourceId;
			sFileIdxResId = sw.mkResourceValue('$fileIndexReset').resourceId;
		}
		return sw.schemaId;
	}
	
	function closeDevice() {
		var resId = sCurOp == Op.NONE ? 0 : 1; 
		sReqPkt.rewind();
		sReqPkt.addHdr(Kind.DISCONNECT, resId);
		prepareTimeout(CLOSE_TIMEOUT, CLOSE_TIMEOUT);
		Mailbox.send(sReqPkt);
	}
	
	function indicator(resourceName) {
		if (sProvider && sIsConnected && sOnFetchFxn) {
			var rv = sProvider.sw.mkResourceValue(resourceName);
			rv.value = sOnFetchFxn(resourceName);
			sReqPkt.rewind();
			sReqPkt.addHdr(Kind.INDICATOR, rv.resourceId);
			rv.addData(sReqPkt);
			Mailbox.send(sReqPkt);
		}
	}
	
	function onConnect(fxn) {
		sOnConnectFxn = fxn;
	}
	
	function onDisconnect(fxn) {
		sOnDisconnectFxn = fxn;
	}
	
	function onError(fxn) {
		sOnErrorFxn = fxn;
	}
	
	function onFetch(fxn) {
		sOnFetchFxn = fxn;
	}
	
	function onIndicator(fxn) {
		sOnIndicatorFxn = fxn;
	}
	
	function onStore(fxn) {
		sOnStoreFxn = fxn;
	}
	
	function openDevice(deviceDesc, callback, timeout) {
		if (!deviceDesc) {
			reportError(Op.OPEN, callback, "no device specified");
			return;
		}
		if (!validate(Op.OPEN, callback)) return;
		sCurDev = sDevTab[deviceDesc.deviceId];
		if (!sCurDev.sw) {
			reportError(Op.OPEN, callback, "no schema for this device");
			return;
		}
		sReqPkt.rewind();
		sReqPkt.addHdr(Kind.CONNECT);
		for (var i = 0; i < sCurDev.addr.length; i++) {
			sReqPkt.addInt8(sCurDev.addr[i]);
		}
		prepareTimeout(timeout, OPEN_TIMEOUT);
		Mailbox.send(sReqPkt);
	}
	
	function readResource(resourceName, callback, timeout) {
		if (!validate(Op.READ, callback, resourceName)) return;
		sCurVal = sCurDev.sw.mkResourceValue(resourceName);
		sReqPkt.rewind();
		prepareTimeout(timeout, RDWR_TIMEOUT);
		if (sCurVal.isFile) {
			filePrepare();
		}
		else {
			sReqPkt.addHdr(Kind.FETCH, sCurVal.resourceId);
			Mailbox.send(sReqPkt);
		}
}
	
	function setProvider(schemaId, devName) {
		schemaId ? sProvider = new Provider(schemaId, devName) : null;
		Mailbox.restart(function () {});
	}
	
	function scanDevices(duration, callback) {
		if (!validate(Op.SCAN, callback)) return;
		DeviceList.beginCycle();
		sReqPkt.rewind();
		sReqPkt.addHdr(Kind.SCAN, 1);
		sReqPkt.addInt32(~0);
		sReqPkt.addInt16(duration);
		Mailbox.send(sReqPkt);
	}
	
	function writeResource(resourceName, value, callback, timeout) {
		if (!validate(Op.WRITE, callback, resourceName)) return;
		sCurVal = sCurDev.sw.mkResourceValue(resourceName);
		sCurVal.value = value;
		sReqPkt.rewind();
		prepareTimeout(timeout, RDWR_TIMEOUT);
		if (sCurVal.isFile) {
			filePrepare();
		}
		else {
			sReqPkt.addHdr(Kind.STORE, sCurVal.resourceId);
			sCurVal.addData(sReqPkt);
			Mailbox.send(sReqPkt);
		}
	}
	
	function _start(Mbx, callback) {
		Mailbox = Mbx;
		Mailbox.onRecv(dispatch);
		Mailbox.open(function () {
			callback && callback();
		});
	}
	
	/* -------- DeviceDesc -------- */

	function DeviceDesc() {}
	
	DeviceDesc.prototype.toString = function() {
		return Utils.sprintf("<DeviceDesc %s>", this.deviceId, this.rssi);
	};

	/* -------- Provider -------- */

	function Provider(schId, devName) {
		var hash = schId.split('-')[1];
		this.sw = SchemaWrapper.find(hash);
		this.devName = devName;
	}

	Provider.prototype.addSchemaHash = function (pkt) { 
		this.sw.hashBytes.forEach(function (b) {
			pkt.addInt8(b);
		});
	};
	
	/* -------- PRIVATES -------- */

	function dispatch(pkt) {
		pkt.rewind();
		var hdr = pkt.scanHdr();
		switch (hdr.kind) {
		case Kind.CONNECT:
			clearTimeout(sTimeout);
			onConnectPkt();
			break;
		case Kind.DISCONNECT:
			clearTimeout(sTimeout);
			onDisconnectPkt();
			break;
		case Kind.FETCH:
			onFetchPkt(hdr, pkt);
			break;
		case Kind.FETCH_DONE:
			clearTimeout(sTimeout);
			if (sCurFileIdx == FILE_NONE) {
				onFetchDonePkt(pkt);
			}
			else if (sCurOp == Op.READ) {
				fileRead(pkt);
			}
			else {
				fileWrite(pkt);
			}
			break;
		case Kind.INDICATOR:
			onIndicatorPkt(hdr, pkt);
			break;
		case Kind.SCAN_DONE:
			onScanDonePkt(pkt);
			break;
		case Kind.STORE:
			onStorePkt(hdr, pkt);
			break;
		case Kind.STORE_DONE:
			clearTimeout(sTimeout);
			if (sCurFileIdx == FILE_NONE) {
				onStoreDonePkt();
			}
			else if (sCurOp == Op.READ) {
				fileRead(pkt);
			}
			else {
				fileWrite(pkt);
			}
			break;
		}
	}
	
	function filePrepare() {
		sReqPkt.addHdr(Kind.STORE, sFileIdxResId);
		sReqPkt.addInt16(0);
		sCurFileIdx = FILE_PREP;
		if (sCurOp == Op.READ) {
			sCurVal.value = [];
			sCurVal.fileStore();
		}
		else {
			sCurVal.fileFetch();
		}
		Mailbox.send(sReqPkt);
	}
	
	function fileRead(pkt) {
		if (sCurFileIdx == FILE_PREP) {
			sCurFileIdx = 0;
		}
		else {
			var sz = pkt.getHdr().size - SerialPacket.HDR_SIZE;
			sCurVal.scanData(pkt);
			if (sz < SerialPacket.DATA_SIZE) {
				sCurFileIdx = FILE_NONE;
				opDone(null, sCurVal.value);
				return;
			}
			sCurFileIdx += SerialPacket.DATA_SIZE;
		}
		sReqPkt.rewind();
		sReqPkt.addHdr(Kind.FETCH, sCurVal.resourceId, 1);
		Mailbox.send(sReqPkt);
	}
	
	function fileWrite() {
		if (sCurVal.fileEof) {
			sCurFileIdx = FILE_NONE;
			opDone(null, sCurVal.value);
			return;
		}
		sCurFileIdx = (sCurFileIdx == FILE_PREP) ? 0 : (sCurFileIdx + SerialPacket.DATA_SIZE);
		sReqPkt.rewind();
		sReqPkt.addHdr(Kind.STORE, sCurVal.resourceId);
		sCurVal.addData(sReqPkt);
		Mailbox.send(sReqPkt);
	}
	
	function initDevDesc(dev) {
		var sw = dev.sw;
		this.deviceId = dev.id;
		this.deviceName = dev.name;
		this.rssi = dev.rssi;
		this.schemaHash = dev.hash;
		this.schemaId = sw ? sw.schemaId : null;
		this.schemaName = sw ? sw.name : null;
		this.broadcast = undefined;
		if (!sw) return;
		var rv = sw.mkBroadcastValue();
		if (!rv) return;
		if (dev.extra.length == 0) {
			this.broadcast = null;
			return;
		}
		var pkt = SerialPacket.create(dev.extra);
		pkt.rewind();
		rv.scanData(pkt);
		this.broadcast = rv.value;
	}
	
	function onConnectPkt() {
		if (sProvider) {
			sOnConnectFxn && sOnConnectFxn();
			sIsConnected = true;
		}
		else {
			opDone(null);
		}
	}
	
	function onDisconnectPkt() {
		reset(null);
		sOnDisconnectFxn && sOnDisconnectFxn();
		sIsConnected = false;
	}
	
	function onFetchPkt(hdr, pkt) {
		pkt.rewind();
		pkt.addHdr(Kind.FETCH_DONE, hdr.resId);
		if (hdr.resId < 0) {
			switch (hdr.resId) {
			case SYS_SCHEMA_HASH:
				sProvider && sProvider.addSchemaHash(pkt);
				break;
			case SYS_MCM_NAME:
				break;
			}
		}
		else if (sProvider && sOnFetchFxn) {
			if (sCurVal == null) {
				sCurVal = sProvider.sw.mkResourceValue(hdr.resId);
				sCurVal.value = sOnFetchFxn(sCurVal.name);
			}
			sCurVal.addData(pkt);
			if (!sCurVal.isFile || (pkt.getHdr().size - SerialPacket.HDR_SIZE) < SerialPacket.DATA_SIZE) {
				sCurVal = null;
			}
		}
		Mailbox.send(pkt);
	}
	
	function onFetchDonePkt(pkt) {
		sCurVal.scanData(pkt);
		opDone(null, sCurVal.value);
	}
	
	function onIndicatorPkt(hdr, pkt) {
		if (!sCurDev) return;
		var rv = sCurDev.sw.mkResourceValue(hdr.resId);
		rv.scanData(pkt);
		sOnIndicatorFxn && sOnIndicatorFxn(rv.name, rv.value);
	}
	
	function onScanDonePkt(pkt) {
		DeviceList.add(pkt.getData());
		sDevTab = DeviceList.endCycle();
		var dnArr = [];
		var devDescArr = [];
		for (var dn in sDevTab) {
			dnArr.push(dn);
		}
		dnArr.sort().forEach(function (dn) {
			var desc = new DeviceDesc();
			initDevDesc.call(desc, sDevTab[dn]);
			devDescArr.push(desc);
			devDescArr[dn] = desc;
			
		});
		opDone(null, devDescArr);
	}
	
	function onStorePkt(hdr, pkt) {
		if (sProvider && sOnStoreFxn && hdr.resId > 0) {
			if (sCurVal == null) {
				sCurVal = sProvider.sw.mkResourceValue(hdr.resId);
			}
			sCurVal.scanData(pkt);
			if (!sCurVal.isFile || (pkt.getHdr().size - SerialPacket.HDR_SIZE) < SerialPacket.DATA_SIZE) {
				sOnStoreFxn(sCurVal.name, sCurVal.value);
				sCurVal = null;
			}
		}
		pkt.rewind();
		pkt.addHdr(Kind.STORE_DONE, hdr.resId);
		Mailbox.send(pkt);
	}
	
	function onStoreDonePkt() {
		opDone(null);
	}
	
	function opDone(err, arg) {
		var cb = sCurOpCB;
		reset(sCurDev);
		if (cb) cb(err, arg);
	}
	
	function prepareTimeout(timeout, defaultTimeout) {
		if (timeout < 0) return;
		sTimeout = setTimeout(function () {
			sReqPkt.rewind();
			sReqPkt.addHdr(Kind.DISCONNECT, 1);
			Mailbox.send(sReqPkt);
		}, timeout > 0 ? timeout : defaultTimeout);
	}
	
	function reportError(op, cb, msg) {
		var err = Utils.sprintf("ConnectionMgr.%s: %s", OP_METHOD[Op[op]], msg);
		if (sOnErrorFxn) {
			sOnErrorFxn(err);
		}
		else {
			cb(err);
		}
	}
	
	function reset(dev) {
		sCurDev = dev;
		sCurFileIdx = FILE_NONE;
		sCurOp = Op.NONE;
		sCurOpCB = null;
		sCurVal = null;
	}

	function validate(op, cb, rn) {
		var msg = null;
		switch (op) {
		case Op.CLOSE:
			return true;
		case Op.OPEN:
		case Op.SCAN:
			(msg = validateDevice(false)) || (msg = validateIdle());
			break;
		case Op.READ:
		case Op.WRITE:
			(msg = validateDevice(true)) || (msg = validateIdle()) || (msg = validateResource(op, rn));
			break;
		}
		if (msg) {
			reportError(op, cb, msg);
			return false;
		}
		sCurOp = op;
		sCurOpCB = cb;
		return true;
	}
	
	function validateDevice(isCurrent) {
		if (isCurrent) {
			return sCurDev == null ? "no opened device" : null;
		}
		else {
			return sCurDev != null ? "opened device in use" : null;
		}
	}
	
	function validateIdle() {
		return sCurOp != Op.NONE ? "another operation in progress" : null;
	} 
	
	function validateResource(op, rn) {
		var rv = sCurDev.sw.getResources()[rn];
		if (!rv) return Utils.sprintf("no resource named '%s'", rn);
		switch (op) {
		case Op.READ:
			if (!rv.isReadable) return Utils.sprintf("resource '%s' not readable", rn);
			break;
		case Op.WRITE:
			if (!rv.isWriteable) return Utils.sprintf("resource '%s' not writeable", rn);
			break;
		}
		return null;
	}
	
	/* -------- EXPORTS -------- */

	exports._start = _start;
	exports.addSchema = addSchema;
	exports.closeDevice = closeDevice;
	exports.indicator = indicator;
	exports.onConnect = onConnect;
	exports.onDisconnect = onDisconnect;
	exports.onError = onError;
	exports.onFetch = onFetch;
	exports.onIndicator = onIndicator;
	exports.onStore = onStore;
	exports.openDevice = openDevice;
	exports.readResource = readResource;
	exports.setProvider = setProvider;
	exports.scanDevices = scanDevices;
	exports.writeResource = writeResource;
});
