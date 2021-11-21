pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Lib.sol";

interface IPlant {
    
    event RecordEvent(uint indexed powerId, address indexed deviceId, uint date, uint value);
    event RecordTxHashEvent(uint indexed powerId, bytes32 txHash);
    
    struct Power {
        uint id;
        address deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    	bytes32 txHash; // record tx hash
    }
    
    struct DeviceInfo {
        address device;
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	Lib.State state;
    	string location;
    	string image;
    	uint index;
    }
    
    function addDevice(address device, uint date, uint capacity, string memory location, string memory image) external;
    
    function setDevicePending(address deviceId) external;
    
    function updateDeviceState(address deviceId, bool approve) external;
    
    function getDevice(address deviceId) external view returns (DeviceInfo memory);
    
    function getAllDevice() external view returns (DeviceInfo[] memory);
    
    function record(uint date, uint value) external returns (uint);
    
    function bindPowerAndTxHash(uint powerId, bytes32 txHash) external;
    
    function getAllPower() external view returns (Power[] memory);
    
    function getValues(uint[][] memory powerIds) external view returns (uint[][] memory);
    
    function contains(address deviceId) external view returns (bool);
    
    // safe math??
    function reducePower(uint[][] memory powerIds, uint[][] memory values) external;

}