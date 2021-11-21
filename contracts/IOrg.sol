pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT
import "./Lib.sol";

interface IOrg {
    
    event CreatePlantEvent(address indexed creator, address plantContract);
    
    struct UserInfo {
        Lib.Role role;
        uint userIndex;
    }
    
    struct OrgInfo {
        address owner; // who creates this Org
        string name;
        uint date; // timestamp
        string description;
    }
    
    struct DeviceRegisterRequest {
        uint index;
        uint id;
        address plantId;
        address deviceId;
    }
    
    struct CertificateRequest {
        uint index;
        uint id;
        uint number;
        address plantId;
        uint[][] powerIds;
        uint[][] values;
        // string metadatauri;
    }
    
    // only admins can call this
    function setDisable(address caller, bool disable) external;
    
    // only admins can call this
    function setDescription(string memory description) external;
    
    // only admins can call this
    function setIssuerContract(address issuerContract) external;
    
    function getUserInfo(address account) external view returns (UserInfo memory);
    
    function getAllUser() external view returns (address[] memory);
    
    function getOrgInfo() external view returns (OrgInfo memory);
    
    // only admins can call this
    function addAdmin(address account) external;
    
    // only admins can call this
    function removeAdmin(address account) external;
    
    // only admins can call this
    function createPlant(string memory plantName, string memory plantLocation) external returns (address);
    
    function getAllPlant() external view returns (address[] memory);
    
    // each smart meter has its wallet
    // smart meter dapp will call this
    function registerDevice(address plantContract) external;
    
    function getAllDeviceRegisterRequest() external view returns (DeviceRegisterRequest[] memory);
    
    // only admins can call this
    // admin will fill some infoes and press approve button
    function approveDeviceRequest(uint requestId, uint date, uint capacity, string memory location, string memory image) external;
    
    // only admins can call this
    function requestApproveDevice(address plantId, address deviceId, string memory deviceLocation) external returns (uint);
    
    // only admins can call this
    // CompilerError: Stack too deep when compiling inline assembly: Variable headStart is 1 slot(s) too deep inside the stack.
    // Plant.SimplifiedPower[][] -> uint[][], uintp[][]
    function requestCertificate(uint number, address plantId, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external returns (uint, uint[] memory);
    
    // function deleteRequestCertificate(uint requestId) external;
    
    // function getAllCertificateRequest() external view returns (CertificateRequest[] memory);
    
    // function reducePower(uint requestId) external;
    
    function transferToken(address to, uint256[] memory ids, uint256[] memory amounts) external;
    
    function claimCertificate(uint256 id) external;
}