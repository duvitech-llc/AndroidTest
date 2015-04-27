if (typeof define !== 'function') { var define = require('amdefine')(module); }

define({
    "resources": {
        "$eapProtocolLevel": {
            "id": -3,
            "align": 2,
            "attributes": {"readonly": true},
            "type": "u2",
            "access": "r",
            "size": 2
        },
        "count": {
            "id": 2,
            "align": 2,
            "attributes": {"readwrite": true},
            "type": "i2",
            "access": "rw",
            "size": 2
        },
        "$activeGroup": {
            "id": -10,
            "align": 1,
            "pack": 1,
            "attributes": {"readwrite": true},
            "type": "E:system@emmoco.com.System/ParameterGroup",
            "access": "rw",
            "size": 1
        },
        "$mcmDisconnect": {
            "id": -9,
            "align": 1,
            "attributes": {"writeonly": true},
            "type": "u1",
            "access": "w",
            "size": 1
        },
        "$eapBuildDate": {
            "dim": 8,
            "id": -4,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "A8:u1",
            "access": "r",
            "size": 8
        },
        "ledState": {
            "id": 4,
            "align": 1,
            "pack": 1,
            "attributes": {"indicator": true},
            "type": "E:@emmoco.com.Blinker/LedState",
            "access": "ir",
            "size": 1
        },
        "$resourceCount": {
            "id": -7,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "S:system@emmoco.com.System/ResourceCount",
            "access": "r",
            "size": 2
        },
        "$schemaHash": {
            "dim": 20,
            "id": -6,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "A20:u1",
            "access": "r",
            "size": 20
        },
        "cmd": {
            "id": 1,
            "align": 1,
            "pack": 1,
            "attributes": {"writeonly": true},
            "type": "E:@emmoco.com.Blinker/Cmd",
            "access": "w",
            "size": 1
        },
        "$mcmProtocolLevel": {
            "id": -2,
            "align": 2,
            "attributes": {"readonly": true},
            "type": "u2",
            "access": "r",
            "size": 2
        },
        "$mobileRssi": {
            "id": -8,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "i1",
            "access": "r",
            "size": 1
        },
        "delay": {
            "id": 3,
            "align": 2,
            "pack": 4,
            "attributes": {"readwrite": true},
            "type": "N:0.500000,2.000000,0.100000,3/u2/15",
            "access": "rw",
            "size": 2
        },
        "$fileIndexReset": {
            "id": -5,
            "align": 2,
            "attributes": {"writeonly": true},
            "type": "i2",
            "access": "w",
            "size": 2
        }
    },
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
    "manifest": {
        "protocolLevel": 13,
        "hash": [
            100,
            133,
            204,
            118,
            171,
            105,
            196,
            176,
            165,
            61,
            177,
            160,
            190,
            191,
            194,
            241
        ],
        "toolVersion": "13.4.1.201311121838",
        "name": "Blinker",
        "$$md5": "6485cc76ab69c4b0a53db1a0bebfc2f1",
        "build": [
            165,
            140,
            197,
            164,
            66,
            1,
            0,
            0
        ],
        "date": "2013-11-29T08:51:19",
        "maxAlign": 2,
        "maxSize": 20,
        "version": "1.0.0"
    },
    "resourceNames": [
        "cmd",
        "count",
        "delay",
        "ledState",
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
    "attributes": {
        "description": "Blinker, the hello world program for mobile control",
        "version": "1.0.0"
    },
    "resourceNamesApp": [
        "cmd",
        "count",
        "delay",
        "ledState"
    ],
    "types": {
        "@emmoco.com.Blinker/LedState": {
            "values": [
                "LED_OFF",
                "LED_ON"
            ],
            "align": 1,
            "pack": 1,
            "type": "E:@emmoco.com.Blinker/LedState",
            "size": 1
        },
        "system@emmoco.com.System/ResourceCount": {
            "packed": false,
            "align": 1,
            "type": "S:system@emmoco.com.System/ResourceCount",
            "size": 2,
            "fields": [
                {
                    "pad": 0,
                    "align": 1,
                    "name": "app",
                    "type": "u1",
                    "size": 1
                },
                {
                    "pad": 0,
                    "align": 1,
                    "name": "sys",
                    "type": "u1",
                    "size": 1
                }
            ]
        },
        "std:i2": {
            "align": 2,
            "size": 2
        },
        "std:i1": {
            "align": 1,
            "size": 1
        },
        "std:u1": {
            "align": 1,
            "size": 1
        },
        "system@emmoco.com.System/ParameterGroup": {
            "values": [
                "GROUP_A",
                "GROUP_B"
            ],
            "align": 1,
            "pack": 1,
            "type": "E:system@emmoco.com.System/ParameterGroup",
            "size": 1
        },
        "@emmoco.com.Blinker/Cmd": {
            "values": [
                "START_CMD",
                "STOP_CMD"
            ],
            "align": 1,
            "pack": 1,
            "type": "E:@emmoco.com.Blinker/Cmd",
            "size": 1
        },
        "std:u2": {
            "align": 2,
            "size": 2
        }
    },
    "imports": {"@emmoco.com.Blinker": true}
});