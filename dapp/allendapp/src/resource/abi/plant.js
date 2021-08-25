export const PlantAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "issuerContract",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "plantName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "plantLocation",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "powerId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "deviceId",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "date",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "RecordEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "powerId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "name": "RecordTxHashEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "device",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "date",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "capacity",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "image",
                "type": "string"
            }
        ],
        "name": "addDevice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "deviceId",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "powerId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "name": "bindPowerAndTxHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllDevice",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "device",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "date",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "capacity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum Org.State",
                        "name": "state",
                        "type": "uint8"
                    },
                    {
                        "internalType": "string",
                        "name": "location",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "index",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Plant.DeviceInfo[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllPower",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "deviceId",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "date",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "remainValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "txHash",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct Plant.Power[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "deviceId",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "date",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "record",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "deviceId",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "approve",
                "type": "bool"
            }
        ],
        "name": "updateDeviceState",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]