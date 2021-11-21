pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Lib.sol";
import "./IPlant.sol";

contract PlantV2 is IPlant {
    
    Power[] _powers;
    
    struct PlantInfo {
        string _plantName;
        string _plantLocation;
    }
    
    address _orgContract;
    address _issuerContract;
    PlantInfo _plantInfo;
    
    // device account address => DeviceInfo
    mapping(address => DeviceInfo) _deviceInfoMap;
    address[] _devices;
    
    modifier onlyDevice() { // need test
        require(_deviceInfoMap[msg.sender].date > 0, "only Device can call this");
        _;
    }
    
    modifier onlyOrg() {
        require(_orgContract == msg.sender, "only Org can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(_issuerContract == msg.sender, "only Issuer can call this");
        _;
    }
    
    constructor(address issuerContract, string memory plantName, string memory plantLocation) {
        // init contract
        _orgContract = msg.sender; // org contract will new plant
        _issuerContract = issuerContract;
        // init plant info
        _plantInfo = PlantInfo(plantName, plantLocation);
    }
    
    function addDevice(
        address device,
        uint date,
        uint capacity,
        string memory location,
        string memory image
        ) external override onlyOrg {
        require(_deviceInfoMap[device].date == 0);
        _devices.push(device);
        _deviceInfoMap[device] = DeviceInfo(device, date, capacity, Lib.State.Idle, location, image, _devices.length - 1);
    }
    
    function setDevicePending(address deviceId) external override onlyOrg {
        _deviceInfoMap[deviceId].state = Lib.State.Pending;
    }
    
    function updateDeviceState(
        address deviceId,
        bool approve
        ) external override onlyIssuer {
        _deviceInfoMap[deviceId].state = approve ? Lib.State.Approve : Lib.State.DisApprove;
    }
    
    function getDevice(address deviceId) external override view returns (DeviceInfo memory) {
        return _deviceInfoMap[deviceId];
    }
    
    function getAllDevice() external override view returns (DeviceInfo[] memory) {
        DeviceInfo[] memory result = new DeviceInfo[](_devices.length);
        for(uint i = 0; i < _devices.length; i++) {
            result[i] = _deviceInfoMap[_devices[i]];
        }
        return result;
    }
    
    function record(
        uint date,
        uint value
        ) external override onlyDevice returns (uint){
        // check device exist and approve by issuer
        require(_deviceInfoMap[msg.sender].state == Lib.State.Approve);
        uint powerId = _powers.length;
        _powers.push(Power(powerId, msg.sender, date, value, value, bytes32(0x0)));
        // emit record event to the chain
        emit RecordEvent(powerId, msg.sender, date, value);
        return powerId;
    }
    
    function bindPowerAndTxHash(
        uint powerId,
        bytes32 txHash
        ) external override onlyDevice {
        require(_deviceInfoMap[msg.sender].state == Lib.State.Approve);
        _powers[powerId].txHash = txHash;
        emit RecordTxHashEvent(powerId, txHash);
    }
    
    function getAllPower() external override view returns (Power[] memory) {
        return _powers;
    }
    
    function getValues(uint[][] memory powerIds) external override view returns (uint[][] memory) {
        uint[][] memory result = new uint[][](powerIds.length);
        for(uint i = 0; i < powerIds.length; i++) {
            uint[] memory pids = powerIds[i];
            result[i] = new uint[](pids.length);
            for(uint j = 0; j < pids.length; j++) {
                result[i][j] = _powers[pids[j]].remainValue;
            }
        }
        return result;
    }
    
    function contains(address deviceId) external override view returns (bool) {
        return _deviceInfoMap[deviceId].date > 0 ;
    }
    
    // safe math??
    function reducePower(
        uint[][] memory powerIds,
        uint[][] memory values
        ) external override onlyIssuer {
        uint length = powerIds.length;
        require(length == values.length);
        for(uint i = 0; i < length; i++) {
            uint[] memory pIds = powerIds[i];
            uint powerLength = pIds.length;
            require(powerLength == values[i].length);
            uint[] memory vs = values[i];
            for(uint j = 0; j < powerLength; j++) {
                // reduce power from storage
                Power storage p = _powers[pIds[j]];
                require(p.remainValue >= vs[j], "rrr");
                p.remainValue -= vs[j];
            }
        }
    }

}