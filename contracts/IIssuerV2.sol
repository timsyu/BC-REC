pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

interface IIssuerV2 {
    
    event DeviceRequestEvent(uint indexed requestId);
    event DeviceRequestApprovedEvent(uint indexed requestId, address orgContract, address plantContract, address deviceAccount, bool approve);
    event CertificateRequestApprovedEvent(uint indexed requestId);
    event PowerReqCertEvent(address indexed plantId, uint indexed powerId, uint value);
    
    struct DeviceRequest {
        uint id;
        address orgContract;
        address plantContract;
        address deviceAccount;
        string deviceLocation;
    }
    
    // only org contract can call this
    // return requestId
    function requestApproveDevice(address plantId, address deviceId, string memory deviceLocation) external returns (uint);
    
    function getAllDeviceRequest() external view returns (DeviceRequest[] memory);
    
    // only issuer can call this
    function approveDeviceRequest(uint requestId, bool approve) external;
    
    function requestCertificate(uint number, address plantId, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external returns (uint, uint[] memory);

    function getNFTContract() external view returns (address);
    
}