pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Plant.sol";
import "./Issuer.sol";
// import "./User.sol";

contract Org {
    
    enum Role { Admin, Device} // Role.Device not used...
    enum State { Idle, Pending, Approve, DisApprove}
    struct OrgInfo {
        address owner; // who creates this Org
        string name;
        uint date; // timestamp
        string description;
    }
    
    struct UserInfo {
        Role role;
        uint userIndex;
    }
    
    struct DeviceRegisterRequest {
        address plantId;
        address deviceId;
    }
    
    address _userContract;
    address _issuerContract;
    address _orgManagerContract;
    
    OrgInfo _orgInfo;
    bool _disable;
    
    // user account address => userInfo
    mapping(address => UserInfo) _userInfoMap;
    address[] _users;
    // plant contract address => _plants index
    mapping(address => uint) _plantIndexes;
    address[] _plants;
    // device register requests
    DeviceRegisterRequest[] _deviceRegisterRequests;
    
    event CreatePlantEvent(address indexed creator, address plantContract);
     
    modifier onlyAdmin() {
        require(_userInfoMap[msg.sender].role == Role.Admin, "only admin can call this");
        _;
    }
    
    modifier onlyOrgManager() {
        require(_orgManagerContract == msg.sender, "only orgManager contract can call this");
        _;
    }
    
    modifier onlyOwner(address caller) {
        require(_orgInfo.owner == caller, "only org owner can call this");
        _;
    }
    
    modifier onlyAble() {
        require(_disable == false, "only contract useable can call this");
        _;
    }
    
    // only admins can call this
    function setDisable(address caller, bool disable) external onlyOrgManager onlyOwner(caller) {
        _disable = disable;
    }
    
    constructor(address userContract, address owner, string memory name, uint date, string memory description) {
        // init contract address
        _userContract = userContract;
        _orgManagerContract = msg.sender; // orgManager contract will call this
        // set org info
        _orgInfo = OrgInfo(owner, name, date, description);
        // set org contract is useable
        _disable = false;
        // set org owner to org admin
        addUser(owner, Role.Admin);
    }
    
    // only admins can call this
    function setDescription(string memory description) external onlyAdmin onlyAble {
        _orgInfo.description = description;
    }
    
    // only admins can call this
    function setIssuerContract(address issuerContract) external onlyAdmin onlyAble {
        _issuerContract = issuerContract;
    }
    
    // function setOwner(address newOwner) external onlyOrgManager onlyAble{
    //     _orgInfo.owner = newOwner;
    // }
    
    // function getOwner() external view returns (address) {
    //     return _orgInfo.owner;
    // }
    
    function getUserInfo(address account) external view returns (UserInfo memory) {
        return _userInfoMap[account];
    }
    
    function getAllUser() external view returns (address[] memory) {
        return _users;
    }
    
    function getOrgInfo() external view returns (OrgInfo memory) {
        return _orgInfo;
    }
    
    function addUser(address account, Role role) private {
        _users.push(account);
        _userInfoMap[account] = UserInfo(role, _users.length - 1);
    }
    
    // only admins can call this
    function addAdmin(address account) external onlyAdmin onlyAble {
        addUser(account, Role.Admin);
    }
    
    // only admins can call this
    function removeAdmin(address account) external onlyAdmin onlyAble {
        uint index = _userInfoMap[account].userIndex;
        delete _users[index];
        delete _userInfoMap[account];
        // remove org id from the target user storing in the user contract
        // User(_user).removeOrgIdToUser(account, _orgInfo.id);
    }
    
    // only admins can call this
    function createPlant(string memory plantName, string memory plantLocation) external onlyAdmin onlyAble {
        // create plant contract
        Plant plant = new Plant(_issuerContract, plantName, plantLocation);
        address plantAddress = address(plant);
        _plants.push(plantAddress);
        _plantIndexes[plantAddress] = _plants.length - 1;
        emit CreatePlantEvent(msg.sender, plantAddress);
    }
    
    // // only admins can call this
    // function removePlant(uint plantId) external onlyAdmin onlyAble {
    //     if (Plant(_plants[plantId]).getDeviceNum() == 0) {
    //         delete _plants[plantId];
    //         _plantNum --;
    //     }
    // }
    
    function getAllPlant() external view returns (address[] memory) {
        return _plants;
    }
    
    // each smart meter has its wallet
    // smart meter dapp will call this
    function registerDevice(address plantContract) external onlyAble {
        address deviceAccount = msg.sender;
        _deviceRegisterRequests.push(DeviceRegisterRequest(plantContract, deviceAccount));
    }
    
    function getAllDeviceRegisterRequest() external view returns (DeviceRegisterRequest[] memory) {
        return _deviceRegisterRequests;
    }
    
    // only admins can call this
    // admin will fill some infoes and press approve button
    function approveDeviceRequest(
        uint requestId,
        uint date,
        uint capacity,
        string memory location,
        string memory image
        ) external onlyAdmin onlyAble{
        DeviceRegisterRequest memory request = _deviceRegisterRequests[requestId];
        Plant(request.plantId).addDevice(request.deviceId, date, capacity, location, image);
        // remove request from storage
        delete _deviceRegisterRequests[requestId];
    }
    
    // only admins can call this
    function requestApproveDevice(
        address plantId,
        address deviceId,
        string memory deviceLocation
        ) external onlyAdmin onlyAble {
        // Issuer(_issuerContract).requestApproveDevice(plantId, deviceId, deviceLocation);
    }
    
    // only admins can call this
    // function changeDeviceState(uint plantId, uint deviceId, uint state) external onlyAdmin onlyAble {
    //     Plant(_plants[plantId]).changeDeviceState(deviceId, state);
    // }
    
    // only admins can call this
    // CompilerError: Stack too deep when compiling inline assembly: Variable headStart is 1 slot(s) too deep inside the stack.
    // Plant.SimplifiedPower[][] -> uint[][], uintp[][]
    function requestCertificate(
        uint number,
        address plantId,
        uint[][] memory powerIds,
        uint[][] memory values,
        string[] memory metadataUriList
        ) external onlyAdmin onlyAble {
        // Issuer(_issuerContract).requestCertificate(number, plantContract, powerIds, values, metadataUriList);
    }
    
    
}