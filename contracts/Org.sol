pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Lib.sol";
import "./IOrg.sol";
import "./PlantV2.sol";
import "./IPlant.sol";
import "./IIssuerV2.sol";
import "./INFT1155Demo.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Org is IOrg, ERC1155Holder {
    
    address _issuerContract;
    address _tokenContract;
    address _orgManagerContract;
    
    OrgInfo _orgInfo;
    bool _disable;
    
    // user account address => userInfo
    mapping(address => UserInfo) _userInfoMap;
    address[] _users;
    // plant contract address => _plants index
    mapping(address => uint) _plantIndexes;
    address[] _plants;
    
    // device register request
    uint _deviceRegisterRequestCount;
    // request id => DeviceRegisterRequest
    mapping(uint => DeviceRegisterRequest) _deviceRegisterRequestMap;
    uint[] _deviceRegisterRequests;

    // certificate request
    // uint _certificateRequestCount;
    // request id => CertificateRequest
    // mapping(uint => CertificateRequest) _certificateRequestMap;
    // uint[] _certificateRequests;
     
    modifier onlyAdmin() {
        require(_userInfoMap[msg.sender].role == Lib.Role.Admin, "only admin can call this");
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
    function setDisable(address caller, bool disable) external override onlyOrgManager onlyOwner(caller) {
        _disable = disable;
    }
    
    constructor(address issuerContract, address tokenContract, address owner, string memory name, uint date, string memory description) {
        // init contract address
        _issuerContract = issuerContract;
        _tokenContract = tokenContract;
        _orgManagerContract = msg.sender; // orgManager contract will call this
        // set org info
        _orgInfo = OrgInfo(owner, name, date, description);
        // set org contract is useable
        _disable = false;
        // set org owner to org admin
        addUser(owner, Lib.Role.Admin);
        _deviceRegisterRequestCount = 0;
        // _certificateRequestCount = 0;
    }
    
    // only admins can call this
    function setDescription(string memory description) external override onlyAdmin onlyAble {
        _orgInfo.description = description;
    }
    
    // only admins can call this
    function setIssuerContract(address issuerContract) external override onlyAdmin onlyAble {
        _issuerContract = issuerContract;
    }
    
    // function setOwner(address newOwner) external onlyOrgManager onlyAble{
    //     _orgInfo.owner = newOwner;
    // }
    
    // function getOwner() external view returns (address) {
    //     return _orgInfo.owner;
    // }
    
    function getUserInfo(address account) external override view returns (UserInfo memory) {
        return _userInfoMap[account];
    }
    
    function getAllUser() external override view returns (address[] memory) {
        return _users;
    }
    
    function getOrgInfo() external override view returns (OrgInfo memory) {
        return _orgInfo;
    }
    
    // only admins can call this
    function addUser(address account, Lib.Role role) private {
        _users.push(account);
        _userInfoMap[account] = UserInfo(role, _users.length - 1);
    }
    
    // only admins can call this
    function addAdmin(address account) external override onlyAdmin onlyAble {
        addUser(account, Lib.Role.Admin);
    }
    
    // only admins can call this
    function removeAdmin(address account) external override onlyAdmin onlyAble {
        uint index = _userInfoMap[account].userIndex;
        address last = _users[_users.length - 1];
        _users[index] = last;
        _userInfoMap[last].userIndex = index;
        _users.pop();
        delete _userInfoMap[account];
        // remove org id from the target user storing in the user contract
        // User(_user).removeOrgIdToUser(account, _orgInfo.id);
    }
    
    // only admins can call this
    function createPlant(string memory plantName, string memory plantLocation) external override onlyAdmin onlyAble returns (address) {
        // create plant contract
        PlantV2 plant = new PlantV2(_issuerContract, plantName, plantLocation);
        address plantAddress = address(plant);
        _plants.push(plantAddress);
        _plantIndexes[plantAddress] = _plants.length - 1;
        emit CreatePlantEvent(msg.sender, plantAddress);
        return plantAddress;
    }
    
    // // only admins can call this
    // function removePlant(uint plantId) external onlyAdmin onlyAble {
    //     if (Plant(_plants[plantId]).getDeviceNum() == 0) {
    //         delete _plants[plantId];
    //         _plantNum --;
    //     }
    // }
    
    function getAllPlant() external override view returns (address[] memory) {
        return _plants;
    }
    
    // each smart meter has its wallet
    // smart meter dapp will call this
    function registerDevice(address plantContract) external override onlyAble {
        // check request exist
        for(uint i = 0; i < _deviceRegisterRequests.length; i++) {
            require((_deviceRegisterRequestMap[_deviceRegisterRequests[i]].deviceId == msg.sender) == false);
        }
        // check plant exist && check device exist in plants
        bool exist;
        for(uint i = 0; i < _plants.length; i++) {
            // check plant exist
            if(_plants[i] == plantContract) {
                exist = true;
            }
            // check device exist in plants
            require(IPlant(_plants[i]).contains(msg.sender) == false);
        }
        require(exist);
        _deviceRegisterRequests.push(_deviceRegisterRequestCount);
        _deviceRegisterRequestMap[_deviceRegisterRequestCount] = DeviceRegisterRequest(_deviceRegisterRequests.length - 1, _deviceRegisterRequestCount, plantContract, msg.sender);
        _deviceRegisterRequestCount++;
    }
    
    function getAllDeviceRegisterRequest() external override view returns (DeviceRegisterRequest[] memory) {
        uint length = _deviceRegisterRequests.length;
        DeviceRegisterRequest[] memory result = new DeviceRegisterRequest[](length);
        for(uint i = 0; i < length; i++) {
            uint id = _deviceRegisterRequests[i];
            result[i] = _deviceRegisterRequestMap[id];
        }
        return result;
    }
    
    // only admins can call this
    // admin will fill some infoes and press approve button
    function approveDeviceRequest(
        uint requestId,
        uint date,
        uint capacity,
        string memory location,
        string memory image
        ) external override onlyAdmin onlyAble{
        require(date > 0);
        DeviceRegisterRequest memory request = _deviceRegisterRequestMap[requestId];
        IPlant(request.plantId).addDevice(request.deviceId, date, capacity, location, image);
        // remove request
        uint index = request.index;
        uint last = _deviceRegisterRequests[_deviceRegisterRequests.length - 1];
        _deviceRegisterRequests[index] = last;
        _deviceRegisterRequestMap[last].index = index;
        _deviceRegisterRequests.pop();
        delete _deviceRegisterRequestMap[requestId];
    }
    
    // only admins can call this
    function requestApproveDevice(
        address plantId,
        address deviceId,
        string memory deviceLocation
        ) external override onlyAdmin onlyAble returns (uint) {
        require(IPlant(plantId).getDevice(deviceId).state == Lib.State.Idle);
        uint id = IIssuerV2(_issuerContract).requestApproveDevice(plantId, deviceId, deviceLocation);
        IPlant(plantId).setDevicePending(deviceId);
        return id;
    }
    
    // only admins can call this
    // function changeDeviceState(uint plantId, uint deviceId, uint state) external onlyAdmin onlyAble {
    //     Plant(_plants[plantId]).changeDeviceState(deviceId, state);
    // }
    
    function requestCertificate(
        uint number,
        address plantId,
        uint[][] memory powerIds,
        uint[][] memory values,
        string memory metadataUri
        ) external override onlyAdmin onlyAble returns (uint, uint[] memory) {
        require(number > 0);
        require(powerIds.length == number);
        require(values.length == number);
        (uint requestId, uint[] memory tokenIds) = IIssuerV2(_issuerContract).requestCertificate(number, plantId, powerIds, values, metadataUri);
        // emit CertificateRequestEvent(id, number, plantId, powerIds, values, metadataUri);
        // _certificateRequests.push(requestId);
        // _certificateRequestMap[id] = CertificateRequest(_certificateRequests.length - 1, id, number, plantId, powerIds, values);
        return (requestId, tokenIds);
    }
    
    // function deleteRequestCertificate(uint requestId) external override onlyAdmin onlyAble {
    //     CertificateRequest memory request = _certificateRequestMap[requestId];
    //     require(request.number > 0);
    //     // remove request
    //     uint index = request.index;
    //     uint last = _certificateRequests[_certificateRequests.length - 1];
    //     _certificateRequests[index] = last;
    //     _certificateRequestMap[last].index = index;
    //     _certificateRequests.pop();
    //     delete _certificateRequestMap[requestId];
    // }
    
    // function getAllCertificateRequest() external override view returns (CertificateRequest[] memory) {
    //     uint length = _certificateRequests.length;
    //     CertificateRequest[] memory result = new CertificateRequest[](length);
    //     for(uint i = 0; i < length; i++) {
    //         uint id = _certificateRequests[i];
    //         result[i] = _certificateRequestMap[id];
    //     }
    //     return result;
    // }
    
    // function reducePower(uint requestId) external override onlyAdmin onlyAble {
    //     CertificateRequest memory request = _certificateRequestMap[requestId];
    //     IPlant(request.plantId).reducePower(request.powerIds, request.values);
    //     // remove request
    //     uint index = request.index;
    //     uint last = _certificateRequests[_certificateRequests.length - 1];
    //     _certificateRequests[index] = last;
    //     _certificateRequestMap[last].index = index;
    //     _certificateRequests.pop();
    //     delete _certificateRequestMap[requestId];
    // }
    
    function transferToken(address to, uint256[] memory ids, uint256[] memory amounts) external override onlyAdmin onlyAble {
        INFT1155Demo(_tokenContract).transferToken(to, ids, amounts);
    }
    
    function claimCertificate(uint256 id) external override onlyAdmin onlyAble {
        INFT1155Demo(_tokenContract).claimCertificate(id);
    }
}