pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./Issuer.sol";

contract Plant {
    
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
    
    struct SimplifiedPower {
        uint powerId;
    	uint value;
    }
    
    struct DeviceInfo {
        address device;
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	Org.State state;
    	string location;
    	string image;
    	uint index;
    }
    
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
    
    uint _powerCount;
    // power id => _powers index
    mapping(uint => uint) _powerIndexes;
    Power[] _powers;
    
    
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
        ) external onlyOrg {
        _devices.push(device);
        _deviceInfoMap[device] = DeviceInfo(device, date, capacity, Org.State.Idle, location, image, _devices.length - 1);
    }
    
    function setDevicePending(address deviceId) external onlyOrg {
        _deviceInfoMap[deviceId].state = Org.State.Pending;
    }
    
    function updateDeviceState(
        address deviceId,
        bool approve
        ) external onlyIssuer {
        _deviceInfoMap[deviceId].state = approve ? Org.State.Approve : Org.State.DisApprove;
    }
    
    function getAllDevice() external view returns (DeviceInfo[] memory) {
        DeviceInfo[] memory result = new DeviceInfo[](_devices.length);
        for(uint i = 0; i < _devices.length; i++) {
            result[i] = _deviceInfoMap[_devices[i]];
        }
        return result;
    }
    
    function record(
        uint date,
        uint value
        ) external onlyDevice returns (uint){
        require(_deviceInfoMap[msg.sender].state == Org.State.Approve, "this device must be approved by issuer");
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
        ) external onlyDevice {
        require(_deviceInfoMap[msg.sender].state == Org.State.Approve, "this device must be approved by issuer");
        _powers[_powerIndexes[powerId]].txHash = txHash;
        emit RecordTxHashEvent(powerId, txHash);
    }
    
    // function getAllDeviceByState(State state) external view returns (DeviceInfo[] memory) {
    //     DeviceInfo[] memory result = new DeviceInfo[](_deviceInfoNum);
    //     uint num = 0;
    //     for(uint i = 0; i< _deviceInfoNum; i++) {
    //         if(_deviceInfo[i].state == state) {
    //             result[num++] = _deviceInfo[i];
    //         }
    //     }
    //     return result;
    // }
    
    function getAllPower() external view returns (Power[] memory) {
        return _powers;
    }
    
    function contains(address deviceId) external view returns (bool) {
        return _deviceInfoMap[deviceId].date > 0 ;
    }
    
    // safe math??
    function reducePower(
        uint[][] memory powerIds,
        uint[][] memory values
        ) external onlyOrg {
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
            }
            // remove power which remainValue == 0
            if(_powers[j].remainValue == 0) {
                uint id = _powers[j].id;
                uint index = _powerIndexes[id];
                Power memory last = _powers[_powers.length - 1];
                _powerIndexes[last.id] = index;
                _powers[index] = last;
                _powers.pop();
                delete _powerIndexes[id];
            }
        }
    }

}