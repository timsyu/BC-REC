pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./Issuer.sol";

contract Plant {
    enum State { Pending, Approve, DisApprove}
    
    struct Power {
        uint deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    	string certificateId;
    }
    
    struct DeviceInfo {
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	State state;
    	string location;
    	string image;
    }

    uint _orgId;
    address _org;
    string _plantName;
    uint _plantId;
    string _plantLocation;
    uint _deviceInfoNum;
    mapping(uint => DeviceInfo) _deviceInfos;
    Power[] _powers;
    
    modifier onlyDevice() {
        require(Org(_org).getUserRole(msg.sender) == Org.Role.Device, "only Device can call this");
        _;
    }
    
    modifier onlyOrg() {
        require(_org == msg.sender, "only Device can call this");
        _;
    }
    
    constructor(uint orgId, string memory plantName, string memory plantLocation) {
        _orgId = orgId;
        _org = msg.sender;
        _plantName = plantName;
        _plantLocation = plantLocation;
        _deviceInfoNum = 0;
    }
    
    function addDevice(
        uint date,
        uint capacity,
        uint state,
        string memory location,
        string memory image
        ) external onlyOrg returns (uint) {
        require(uint(State.DisApprove) >= state);
        _deviceInfos[_deviceInfoNum++] = DeviceInfo(date, capacity, State(state), location, image);
        return _deviceInfoNum;
    }
    
    function changeDeviceState(
        uint deviceId,
        uint state
        ) external onlyOrg {
        require(uint(State.DisApprove) >= state);
        _deviceInfos[deviceId].state = State(state);
    }
    
    function record(
        uint deviceId,
        uint date,
        uint value
        ) external onlyDevice {
        require(_deviceInfos[deviceId].state == State.Approve);
        _powers.push(Power(deviceId, date, value, value, ""));
    }
    
    function getAllDeviceByState(State state) external view returns (DeviceInfo[] memory result) {
        result = new DeviceInfo[](_deviceInfoNum);
        uint num = 0;
        for(uint i = 0; i< _deviceInfoNum; i++) {
            if(_deviceInfos[i].state == state) {
                result[num++] = _deviceInfos[i];
            }
        }
    }
    
    function getAllPower() external view returns (Power[] memory) {
        return _powers;
    }
    
    function getDeviceNum() external view returns (uint) {
        return _deviceInfoNum;
    }
    
    function requestCertificate(
        address issuerContract, 
        uint number
        ) external onlyDevice {
        Issuer(issuerContract).requestCertificate(_orgId, _plantId, number);
    }
}