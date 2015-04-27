if (typeof define !== 'function') { var define = require('amdefine')(module); }

define({
    "resources": {
        "$schemaHash": {
            "dim": 20,
            "id": -6,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "A20:u1",
            "access": "r",
            "size": 20
        },
        "$eapProtocolLevel": {
            "id": -3,
            "align": 2,
            "attributes": {"readonly": true},
            "type": "u2",
            "access": "r",
            "size": 2
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
        "data": {
            "id": 1,
            "align": 2,
            "attributes": {},
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
        "$resourceCount": {
            "id": -7,
            "align": 1,
            "attributes": {"readonly": true},
            "type": "S:system@emmoco.com.System/ResourceCount",
            "access": "r",
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
        "protocolLevel": 14,
        "hash": [
            124,
            222,
            24,
            201,
            135,
            244,
            35,
            197,
            14,
            170,
            21,
            17,
            84,
            224,
            220,
            189
        ],
        "toolVersion": "14.3.1.201406291821",
        "name": "FirstApp",
        "$$md5": "7cde18c987f423c50eaa151154e0dcbd",
        "build": [
            115,
            217,
            239,
            232,
            70,
            1,
            0,
            0
        ],
        "date": "2014-06-29T11:42:51",
        "maxAlign": 2,
        "maxSize": 20,
        "version": "1.0.0"
    },
    "resourceNames": [
        "data",
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
        "description": "My first app",
        "version": "1.0.0"
    },
    "resourceNamesApp": ["data"],
    "types": {
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
        "std:u2": {
            "align": 2,
            "size": 2
        }
    },
    "imports": {"@emmoco.com.FirstApp": true}
});