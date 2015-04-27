if (typeof define !== 'function') { var define = require('amdefine')(module); }

define({
    "resourceNamesSys": [
        "$activeGroup",
        "$eapBuildDate",
        "$eapProtocolLevel",
        "$fileIndexReset",
        "$mcmDisconnect",
        "$mcmProtocolLevel",
        "$mobileRssi",
        "$resourceCount",
        "$schemaHash"
    ],
    "resourceNames": [
        "drawingStream",
        "softwareID",
        "softwareVersion",
        "deviceID",
        "deviceVersion",
        "serialNumber",
        "displayResolution",
        "tileResolution",
        "tileCounts",
        "systemState",
        "batteryLevel",
        "trackerState",
        "trackerRate",
        "trackerData",
        "trackerAvailable",
        "$mcmProtocolLevel",
        "$eapProtocolLevel",
        "$eapBuildDate",
        "$fileIndexReset",
        "$schemaHash",
        "$resourceCount",
        "$mobileRssi",
        "$mcmDisconnect",
        "$activeGroup"
    ],
    "types": {
        "system@emmoco.com.System/ResourceCount": {
            "size": 2,
            "packed": false,
            "fields": [
                {
                    "pad": 0,
                    "size": 1,
                    "name": "app",
                    "type": "u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 1,
                    "name": "sys",
                    "type": "u1",
                    "align": 1
                }
            ],
            "align": 1,
            "type": "S:system@emmoco.com.System/ResourceCount"
        },
        "std:i1": {
            "size": 1,
            "align": 1
        },
        "@emmoco.com.Six15ARDrawing/TrackerData": {
            "size": 18,
            "packed": false,
            "fields": [
                {
                    "pad": 0,
                    "size": 4,
                    "name": "W",
                    "dim": 4,
                    "type": "A4:u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 4,
                    "name": "X",
                    "dim": 4,
                    "type": "A4:u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 4,
                    "name": "Y",
                    "dim": 4,
                    "type": "A4:u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 4,
                    "name": "Z",
                    "dim": 4,
                    "type": "A4:u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 2,
                    "name": "sequence",
                    "type": "u2",
                    "align": 2
                }
            ],
            "align": 2,
            "type": "S:@emmoco.com.Six15ARDrawing/TrackerData"
        },
        "system@emmoco.com.System/ParameterGroup": {
            "size": 1,
            "values": [
                "GROUP_A",
                "GROUP_B"
            ],
            "type": "E:system@emmoco.com.System/ParameterGroup",
            "align": 1,
            "pack": 1
        },
        "@emmoco.com.Six15ARDrawing/Version": {
            "size": 2,
            "packed": false,
            "fields": [
                {
                    "pad": 0,
                    "size": 1,
                    "name": "major",
                    "type": "u1",
                    "align": 1
                },
                {
                    "pad": 0,
                    "size": 1,
                    "name": "minor",
                    "type": "u1",
                    "align": 1
                }
            ],
            "align": 1,
            "type": "S:@emmoco.com.Six15ARDrawing/Version"
        },
        "std:u2": {
            "size": 2,
            "align": 2
        },
        "@emmoco.com.Six15ARDrawing/State": {
            "size": 1,
            "values": [
                "STATE_OFF",
                "STATE_ON"
            ],
            "type": "E:@emmoco.com.Six15ARDrawing/State",
            "align": 1,
            "pack": 1
        },
        "@emmoco.com.Six15ARDrawing/Size": {
            "size": 4,
            "packed": false,
            "fields": [
                {
                    "pad": 0,
                    "size": 2,
                    "name": "x",
                    "type": "u2",
                    "align": 2
                },
                {
                    "pad": 0,
                    "size": 2,
                    "name": "y",
                    "type": "u2",
                    "align": 2
                }
            ],
            "align": 2,
            "type": "S:@emmoco.com.Six15ARDrawing/Size"
        },
        "std:u1": {
            "size": 1,
            "align": 1
        },
        "std:i2": {
            "size": 2,
            "align": 2
        }
    },
    "imports": {"@emmoco.com.Six15ARDrawing": true},
    "resourceNamesApp": [
        "drawingStream",
        "softwareID",
        "softwareVersion",
        "deviceID",
        "deviceVersion",
        "serialNumber",
        "displayResolution",
        "tileResolution",
        "tileCounts",
        "systemState",
        "batteryLevel",
        "trackerState",
        "trackerRate",
        "trackerData",
        "trackerAvailable"
    ],
    "manifest": {
        "date": "2014-11-04T08:02:53",
        "protocolLevel": 14,
        "toolVersion": "14.3.3.201407312305",
        "$$md5": "104b4ad4214fa07f7cb23a11b5f64084",
        "build": [
            240,
            152,
            230,
            122,
            73,
            1,
            0,
            0
        ],
        "name": "Six15ARDrawing",
        "maxAlign": 2,
        "maxSize": 201,
        "version": "0.8.0",
        "hash": [
            16,
            75,
            74,
            212,
            33,
            79,
            160,
            127,
            124,
            178,
            58,
            17,
            181,
            246,
            64,
            132
        ]
    },
    "resources": {
        "$mobileRssi": {
            "access": "r",
            "size": 1,
            "attributes": {"readonly": true},
            "id": -8,
            "type": "i1",
            "align": 1
        },
        "trackerRate": {
            "access": "rw",
            "size": 1,
            "attributes": {},
            "id": 13,
            "type": "N:1.000000,100.000000,1.000000,0/u1/99",
            "align": 1,
            "pack": 7
        },
        "$fileIndexReset": {
            "access": "w",
            "size": 2,
            "attributes": {"writeonly": true},
            "id": -5,
            "type": "i2",
            "align": 2
        },
        "serialNumber": {
            "access": "r",
            "size": 7,
            "attributes": {"readonly": true},
            "id": 6,
            "type": "C:7",
            "align": 1
        },
        "tileResolution": {
            "access": "r",
            "size": 4,
            "attributes": {"readonly": true},
            "id": 8,
            "type": "S:@emmoco.com.Six15ARDrawing/Size",
            "align": 2
        },
        "tileCounts": {
            "access": "r",
            "size": 4,
            "attributes": {"readonly": true},
            "id": 9,
            "type": "S:@emmoco.com.Six15ARDrawing/Size",
            "align": 2
        },
        "displayResolution": {
            "access": "r",
            "size": 4,
            "attributes": {"readonly": true},
            "id": 7,
            "type": "S:@emmoco.com.Six15ARDrawing/Size",
            "align": 2
        },
        "deviceVersion": {
            "access": "r",
            "size": 2,
            "attributes": {"readonly": true},
            "id": 5,
            "type": "S:@emmoco.com.Six15ARDrawing/Version",
            "align": 1
        },
        "$eapProtocolLevel": {
            "access": "r",
            "size": 2,
            "attributes": {"readonly": true},
            "id": -3,
            "type": "u2",
            "align": 2
        },
        "$activeGroup": {
            "access": "rw",
            "size": 1,
            "attributes": {"readwrite": true},
            "id": -10,
            "type": "E:system@emmoco.com.System/ParameterGroup",
            "align": 1,
            "pack": 1
        },
        "deviceID": {
            "access": "r",
            "size": 10,
            "attributes": {"readonly": true},
            "id": 4,
            "type": "C:10",
            "align": 1
        },
        "trackerData": {
            "access": "r",
            "size": 18,
            "attributes": {"readonly": true},
            "id": 14,
            "type": "S:@emmoco.com.Six15ARDrawing/TrackerData",
            "align": 2
        },
        "softwareID": {
            "access": "r",
            "size": 10,
            "attributes": {"readonly": true},
            "id": 2,
            "type": "C:10",
            "align": 1
        },
        "$mcmDisconnect": {
            "access": "w",
            "size": 1,
            "attributes": {"writeonly": true},
            "id": -9,
            "type": "u1",
            "align": 1
        },
        "systemState": {
            "access": "rw",
            "size": 1,
            "attributes": {},
            "id": 10,
            "type": "E:@emmoco.com.Six15ARDrawing/State",
            "align": 1,
            "pack": 1
        },
        "trackerAvailable": {
            "access": "ir",
            "size": 2,
            "attributes": {"indicator": true},
            "id": 15,
            "type": "u2",
            "align": 2
        },
        "$schemaHash": {
            "access": "r",
            "size": 20,
            "dim": 20,
            "attributes": {"readonly": true},
            "id": -6,
            "type": "A20:u1",
            "align": 1
        },
        "$eapBuildDate": {
            "access": "r",
            "size": 8,
            "dim": 8,
            "attributes": {"readonly": true},
            "id": -4,
            "type": "A8:u1",
            "align": 1
        },
        "drawingStream": {
            "access": "w",
            "size": 201,
            "attributes": {"writeonly": true},
            "id": 1,
            "type": "C:201",
            "align": 1
        },
        "$resourceCount": {
            "access": "r",
            "size": 2,
            "attributes": {"readonly": true},
            "id": -7,
            "type": "S:system@emmoco.com.System/ResourceCount",
            "align": 1
        },
        "trackerState": {
            "access": "rw",
            "size": 1,
            "attributes": {},
            "id": 12,
            "type": "E:@emmoco.com.Six15ARDrawing/State",
            "align": 1,
            "pack": 1
        },
        "$mcmProtocolLevel": {
            "access": "r",
            "size": 2,
            "attributes": {"readonly": true},
            "id": -2,
            "type": "u2",
            "align": 2
        },
        "softwareVersion": {
            "access": "r",
            "size": 2,
            "attributes": {"readonly": true},
            "id": 3,
            "type": "S:@emmoco.com.Six15ARDrawing/Version",
            "align": 1
        },
        "batteryLevel": {
            "access": "r",
            "size": 1,
            "attributes": {"readonly": true},
            "id": 11,
            "type": "N:0.000000,100.000000,1.000000,0/u1/100",
            "align": 1,
            "pack": 7
        }
    },
    "attributes": {
        "description": "538-They Live",
        "version": "0.8.0"
    }
});