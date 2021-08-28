export const IssuerAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "orgManagerContract",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "nft",
                "type": "address"
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
                "name": "requestId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "orgContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "plantContract",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "deviceAccount",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "approve",
                "type": "bool"
            }
        ],
        "name": "DeviceRequestEvent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "orgId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "plantId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "powerIds",
                "type": "uint256[]"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "sdate",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "edate",
                "type": "uint256"
            }
        ],
        "name": "ReqCertEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "approve",
                "type": "bool"
            }
        ],
        "name": "approveDeviceRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllDeviceRequest",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "orgContract",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "plantContract",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "deviceAccount",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "deviceLocation",
                        "type": "string"
                    }
                ],
                "internalType": "struct Issuer.DeviceRequest[]",
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
                "name": "plantId",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "deviceId",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "deviceLocation",
                "type": "string"
            }
        ],
        "name": "requestApproveDevice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]