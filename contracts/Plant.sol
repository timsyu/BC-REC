pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Lib.sol";
import "./IPlant.sol";

contract Plant is IPlant {
    
    uint _powerCount;
    // power id => _powers index
    mapping(uint => uint) _powerIndexes;
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
        _powerCount = 0;
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
        // store record value to the storage
        _powerCount++;
        _powers.push(Power(_powerCount, msg.sender, date, value, value, bytes32(0x0)));
        _powerIndexes[_powerCount] = _powers.length - 1;
        // emit record event to the chain
        emit RecordEvent(_powerCount, msg.sender, date, value);
        return _powerCount;
    }
    
    function bindPowerAndTxHash(
        uint powerId,
        bytes32 txHash
        ) external override onlyDevice {
        require(_deviceInfoMap[msg.sender].state == Lib.State.Approve, "this device must be approved by issuer");
        _powers[_powerIndexes[powerId]].txHash = txHash;
        emit RecordTxHashEvent(powerId, txHash);
    }
    
    function getAllPower() external override view returns (Power[] memory) {
        return _powers;
    }
    
    function contains(address deviceId) external override view returns (bool) {
        return _deviceInfoMap[deviceId].date > 0 ;
    }
    
    // safe math??
    function reducePower(
        uint[][] memory powerIds,
        uint[][] memory values
        ) external override onlyOrg {
        uint length = powerIds.length;
        require(length == values.length);
        for(uint i = 0; i < length; i++) {
            uint[] memory pIds = powerIds[i];
            uint powerLength = pIds.length;
            require(powerLength == values[i].length);
            uint[] memory vs = values[i];
            uint j;
            for(j = 0; j < powerLength; j++) {
                uint index = _powerIndexes[pIds[j]];
                // reduce power from storage
                _powers[index].remainValue -= vs[j];
                // remove power which remainValue == 0
                if(_powers[index].remainValue == 0) {
                    uint id = _powers[index].id;
                    Power memory last = _powers[_powers.length - 1];
                    _powerIndexes[last.id] = index;
                    _powers[index] = last;
                    _powers.pop();
                    delete _powerIndexes[id];
                }
            }
        }
    }

}