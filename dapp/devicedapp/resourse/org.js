const orgAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "userContract",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "date",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "addAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
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
        "name": "approveDeviceRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
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
        "name": "createPlant",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllDeviceRegisterRequest",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "plantId",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "deviceId",
                        "type": "address"
                    }
                ],
                "internalType": "struct Org.DeviceRegisterRequest[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllPlant",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllUser",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOrgInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "date",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    }
                ],
                "internalType": "struct Org.OrgInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "getUserInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum Org.Role",
                        "name": "role",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userIndex",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Org.UserInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "plantContract",
                "type": "address"
            }
        ],
        "name": "registerDevice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "removeAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "number",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "plantId",
                "type": "address"
            },
            {
                "internalType": "uint256[][]",
                "name": "powerIds",
                "type": "uint256[][]"
            },
            {
                "internalType": "uint256[][]",
                "name": "values",
                "type": "uint256[][]"
            },
            {
                "internalType": "string[]",
                "name": "metadataUriList",
                "type": "string[]"
            }
        ],
        "name": "requestCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "setDescription",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "caller",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "disable",
                "type": "bool"
            }
        ],
        "name": "setDisable",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "issuerContract",
                "type": "address"
            }
        ],
        "name": "setIssuerContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

module.exports = {
    orgAbi
}