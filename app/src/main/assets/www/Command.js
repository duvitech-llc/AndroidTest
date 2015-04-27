if (typeof define !== 'function') { var define = require('amdefine')(module); }

define (function (require) {

    'use strict';
    
    var actionFxns = {}

    /* -------- IMPORTS -------- */
    var Em = require('com.emmoco.web/Em');
	var SerialPacket = require('com.emmoco.core/SerialPacket');
    var Utils = require('com.emmoco.core/Utils'); 

    function dispatch(cobj) {
    	console.log("dispatch: " + cobj.command);
    	actionFxns[cobj.command](cobj);
    }
    
    function fail(err) {
    	console.log("*** Command error: " + err);
    }

    function finish() {
    	cordova.exec(dispatch, fail, "Command", "finish", Array.prototype.slice.call(arguments));
    }
    
    function handleDisconnect() {
    	cordova.exec(dispatch, fail, "Command", "onDisconnect", []);
    }
    
    function handleIndicator(name, val) {
    	cordova.exec(dispatch, fail, "Command", "onIndicator", [name, val]);
    }
    
    function init() {
        console.log("init");
		Mailbox.init(SerialPacket)
		Em.ConnectionMgr.onDisconnect(handleDisconnect);
		Em.ConnectionMgr.onIndicator(handleIndicator);
		Em.ConnectionMgr._start(Mailbox, function () {
	    	finish();
		});
    }
    
    /* -------- ACTIONS -------- */

    actionFxns.addSchema = function (cobj) {
        require([sprintf("../schemas/%s.js", cobj.name)], function (jobj) {
			Em.ConnectionMgr.addSchema(jobj);
			finish(null);
        });
    };
    
    actionFxns.closeDevice = function (cobj) {
    	Em.ConnectionMgr.closeDevice();
    }
    
    actionFxns.openDevice = function (cobj) {
    	var desc = {deviceId: cobj.deviceId};
    	Em.ConnectionMgr.openDevice(desc, function (err) {
    		finish(err);
    	});
    }
    
    actionFxns.readResource = function (cobj) {
    	Em.ConnectionMgr.readResource(cobj.name, function (err, val) {
    		finish(err, val);
    	});
    }
    
    actionFxns.scanDevices = function (cobj) {
    	Em.ConnectionMgr.scanDevices(cobj.duration, function (err, devList) {
    		finish(err, devList);
    	});
    }
    
    actionFxns.writeResource = function (cobj) {
    	Em.ConnectionMgr.writeResource(cobj.name, cobj.value, function (err) {
    		finish(err);
    	});
    }
    
    /* -------- EXPORTS -------- */

    var App = {};

    App.init = init;

    return App;
});
