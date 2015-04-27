cordova.define("com.emmoco.emgap.Mailbox", function(require, exports, module) {

'use strict';

var SerialPacket;

var sOnRecvFxn = null;
var sSocket = null;
var sTraceFlag = false;

var sOpts = {}

function bindOptions(opts) {
	sOpts = opts;
	sTraceFlag = sOpts.debug;
}

function close() {
	sOpts.broker && sSocket && sSocket.close();
	sSocket = null;
}

function fail(err) {
	console.log("*** Mailbox error: " + err);
}

function init(SerPktMod) {
	SerialPacket = SerPktMod;
}

function onRecv(fxn) {
	sOnRecvFxn = fxn;
}

function open(cb) {
	if (sOpts.broker) {
		openSocket(cb);
		return;
	}
	cordova.exec(function () {
		cb();
		readNext();
	}, fail, "Mailbox", "open", []);
}

function openSocket(cb) {
	sSocket = new WebSocket(sprintf("ws://%s/C/%s", sOpts.broker, sOpts.name));
	sSocket.onclose = function () {
		console.log("em-broker connection terminated");
		sSocket = null
	};
	sSocket.onmessage = function(event) {
		var reader = new FileReader();
		reader.addEventListener("loadend", function() {
			var pkt = SerialPacket.create(new Uint8Array(reader.result));
			sTraceFlag && console.log(sprintf("recv: %s", pkt.getHdr()));
			pkt.rewind();
			sOnRecvFxn(pkt);
		});
		reader.readAsArrayBuffer(event.data);
	};
	sSocket.onopen = function () {
		console.log(sprintf("using em-broker on '%s'...", sOpts.broker));
		cb();
	};
}

function readNext() {
	cordova.exec(function (buf) {
		var pkt = SerialPacket.create(new Uint8Array(buf));
		sTraceFlag && console.log(sprintf("recv: %s", pkt.getHdr()));
		pkt.rewind();
		sOnRecvFxn(pkt);
		readNext();
	}, fail, "Mailbox", "read", []);
}

function send(pkt) {
	sTraceFlag && console.log(sprintf("send: %s", pkt.getHdr()));
	if (sOpts.broker) {
		sendSocket(pkt);
		return;
	}
	var buf = Array.prototype.slice.call(pkt.buffer.subarray(0, pkt.length));
	cordova.exec(function () {}, fail, "Mailbox", "write", buf);
}

function sendSocket(pkt) {
	if (sSocket == null) {
		openSocket(function () {
			sendSocket(pkt);
		});
	}
	else {
		sSocket.send(pkt.buffer.subarray(0, pkt.length));
	}
	
}

exports.bindOptions = bindOptions;
exports.close = close;
exports.init = init;
exports.onRecv = onRecv;
exports.open = open;
exports.send = send;

});
