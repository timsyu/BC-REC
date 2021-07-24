pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Plant.sol";
import "./Issuer.sol";

contract Org {
    
    enum Role { Admin, Device}
    
    struct OrgInfo {
        uint id; // org id
        address owner; // who creates this Org
        uint date; // timestamp
        string description;
    }
    
    address _issuer;
    address _orgManager;
    OrgInfo _orgInfo;
    bool _disable;
    uint _userNum;
    // account address => role
    mapping(address => Role) _userRole;
    mapping(uint => address) _userAddress;
    
    uint _plantNum;
    // plant id => Plant contract address
    mapping(uint => address) _plants;
    
    enum State { Pending, Approve, DisApprove}
    struct DeviceRequest {
        State state;
    }
    
    uint _deviceRequestNum;
    // device request id => DeviceRequest
    mapping(uint => DeviceRequest) _deviceRequests;
    
    modifier onlyAdmin() {
        require(_userRole[msg.sender] == Role.Admin, "only admin can call this");
        _;
    }
    
    modifier onlyOrgManager() {
        require(_orgManager == msg.sender, "only orgManager contract can call this");
        _;
    }
    
    modifier onlyOwner(address caller) {
        require(_orgInfo.owner == caller, "only owner can call this");
        _;
    }
    
    modifier onlyAble() {
        require(_disable == false, "only contract able can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require( _issuer == msg.sender, "only issuer contract can call this");
        _;
    }
    
    modifier onlyIssuerApprove(uint deviceRequestId) {
        require(_deviceRequests[deviceRequestId].state == State.Approve, "only request has been approved by Issuer can call this");
        _;
    }
    
    // only admins can call this
    function setDisable(address caller) external onlyOrgManager onlyOwner(caller) onlyAble{
        _disable = true;
    }
    
    constructor(uint id, address owner, uint date, string memory description) {
        _orgManager = msg.sender; // orgManager contract will call this
        _orgInfo = OrgInfo(id, owner, date, description);
        _userNum = 0;
        _plantNum = 0;
        _deviceRequestNum = 0;
        _disable = false;
        _userRole[owner] = Role.Admin;
        _userAddress[_userNum] = owner;
        
        // for test
        _userRole[0xdF8F0e43F20f3c2079cb57Bc868fC169EEC196C1] = Role.Admin;
        _userAddress[0] = 0xdF8F0e43F20f3c2079cb57Bc868fC169EEC196C1;
        _userRole[0x5B38Da6a701c568545dCfcB03FcB875f56beddC4] = Role.Admin;
        _userAddress[1] = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        _userRole[0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB] = Role.Device;
        _userAddress[2] = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;
        _userNum = 3;
    }
    
    // only admins can call this
    function setDescription(string memory description) external onlyAdmin onlyAble {
        _orgInfo.description = description;
    }
    
    function setOwner(address newOwner) external onlyOrgManager onlyAble{
        _orgInfo.owner = newOwner;
    }
    
    function getOwner() external view onlyAble returns (address) {
        return _orgInfo.owner;
    }
    
    function getUserRole(address account) external view onlyAble returns (Role) {
        return _userRole[account];
    }
    
    function getAllUser() external view onlyAble returns (address[] memory) {
        
        address[] memory result = new address[](_userNum);
        
        for(uint i = 0; i < _userNum; i++) {
            result[i] = _userAddress[i];
        }
        
        return result;
    }
    
    function getOrgInfo() external view onlyAble returns (OrgInfo memory) {
        return _orgInfo;
    }
    
    function getPlant(uint plantId) external view onlyAble returns (address) {
        return _plants[plantId];
    }
    
    function getAllPlant() external view onlyAble returns (address[] memory) {
        
        address[] memory result = new address[](_plantNum);
        
        for(uint i = 0; i < _plantNum; i++) {
            result[i] = _plants[i];
        }
        
        return result;
    }
    
    function getAllDeviceRequest() external view onlyAble returns (DeviceRequest[] memory) {
        
        DeviceRequest[] memory result = new DeviceRequest[](_deviceRequestNum);
        
        for(uint i = 0; i < _deviceRequestNum; i++) {
            result[i] = _deviceRequests[i];
        }
        
        return result;
    }
    
    // only admins can call this
    function addAdmin(address account) external onlyAdmin onlyAble returns (uint){
        _userRole[account] = Role.Admin;
        _userAddress[_userNum] = account;
        uint id = _userNum;
        _userNum ++;
        return id;
    }
    
    // only admins can call this
    function removeAdmin(uint userId, address owner) external onlyAdmin onlyAble {
        delete _userRole[owner];
        delete _userAddress[userId];
        _userNum --;
    }
    
    // only admins can call this
    function createPlant(string memory plantName, string memory plantLocation) external onlyAdmin onlyAble returns (uint, Plant) {
       Plant plant = new Plant(_orgInfo.id, plantName, plantLocation);
       _plants[_plantNum] = address(plant);
       uint id = _plantNum;
       _plantNum ++;
       return (id, plant);
    }
    
    // only admins can call this
    function removePlant(uint plantId) external onlyAdmin onlyAble {
        if (_deviceRequestNum == 0 && Plant(_plants[plantId]).getDeviceNum() == 0) {
            delete _plants[plantId];
            _plantNum --;
        }
    }
    
    // only admins can call this
    function addDeviceRequest(
        address issuer, 
        string memory deviceLocation
        ) external onlyAdmin onlyAble returns (uint){
        _issuer = issuer;
        Issuer(issuer).addDeviceRequest(_orgInfo.id, _deviceRequestNum, deviceLocation);
        _deviceRequests[_deviceRequestNum] = DeviceRequest(State.Pending);
        uint id = _deviceRequestNum;
        _deviceRequestNum ++;
        return id;
    }
    
    // only issuer contract can call this
    function setDeviceRequest(
        uint deviceRequestId,
        bool approve
        ) external onlyIssuer onlyAble {
        if (approve) {
            _deviceRequests[deviceRequestId].state = State.Approve;
        } else {
            _deviceRequests[deviceRequestId].state = State.DisApprove;
        }
    }
    
    // only admins can call this
    function addDevice(
        uint deviceRequestId,
        uint plantId,
        uint date,
        uint capacity,
        string memory state,
        string memory location,
        string memory image
        ) external onlyAdmin onlyIssuerApprove(deviceRequestId) onlyAble returns (uint) {
        uint id = Plant(_plants[plantId]).addDevice(date, capacity, state, location, image);
        delete _deviceRequests[deviceRequestId];
        _deviceRequestNum --;
        return id;
    }
}