pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Plant.sol";
import "./Issuer.sol";
import "./User.sol";

contract Org {
    
    enum Role { Admin, Device}
    enum State { Pending, Approve, DisApprove}
    struct OrgInfo {
        uint id; // org id
        address owner; // who creates this Org
        uint date; // timestamp
        string description;
    }
    
    address _user;
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
    
    // only admins can call this
    function setDisable(address caller) external onlyOrgManager onlyOwner(caller) onlyAble{
        _disable = true;
    }
    
    constructor(address user, uint id, address owner, uint date, string memory description) {
        _user = user;
        _orgManager = msg.sender; // orgManager contract will call this
        _orgInfo = OrgInfo(id, owner, date, description);
        _userNum = 0;
        _plantNum = 0;
        _disable = false;
        _userRole[owner] = Role.Admin;
        _userAddress[_userNum++] = owner;
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
    
    // only admins can call this
    function addAdmin(address account) external onlyAdmin onlyAble returns (uint){
        _userRole[account] = Role.Admin;
        _userAddress[_userNum++] = account;
        // add org id to the target user storing in the user contract
        User(_user).addOrgIdToUser(account, _orgInfo.id);
        return _userNum;
    }
    
    // only admins can call this
    function removeAdmin(uint userId, address account) external onlyAdmin onlyAble {
        delete _userRole[account];
        delete _userAddress[userId];
        // remove org id from the target user storing in the user contract
        User(_user).removeOrgIdToUser(account, _orgInfo.id);
        _userNum --;
    }
    
    // only admins can call this
    function createPlant(string memory plantName, string memory plantLocation) external onlyAdmin onlyAble returns (uint, Plant) {
       Plant plant = new Plant(_orgInfo.id, plantName, plantLocation);
       _plants[_plantNum++] = address(plant);
       return (_plantNum, plant);
    }
    
    // // only admins can call this
    // function removePlant(uint plantId) external onlyAdmin onlyAble {
    //     if (Plant(_plants[plantId]).getDeviceNum() == 0) {
    //         delete _plants[plantId];
    //         _plantNum --;
    //     }
    // }
    
    // only admins can call this
    function addDevice(
        uint plantId,
        uint date,
        uint capacity,
        uint state,
        string memory location,
        string memory image
        ) external onlyAdmin onlyAble returns (uint) {
        return Plant(_plants[plantId]).addDevice(date, capacity, state, location, image);
    }
    
    // only admins can call this
    function requestDevice(
        address issuer, 
        uint plantId,
        uint deviceId,
        string memory deviceLocation
        ) external onlyAdmin onlyAble {
        _issuer = issuer;
        Issuer(issuer).requestDevice(_orgInfo.id, plantId, deviceId,deviceLocation);
    }
    
    function changeDeviceState(uint plantId, uint deviceId, uint state) external onlyAdmin onlyAble {
        Plant(_plants[plantId]).changeDeviceState(deviceId, state);
    }
}