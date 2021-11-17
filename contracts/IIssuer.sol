pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

interface IIssuer {
    
    event DeviceRequestEvent(uint indexed requestId);
    event DeviceRequestApprovedEvent(uint indexed requestId, address orgContract, address plantContract, address deviceAccount, bool approve);
    event CertificateRequestEvent(uint indexed requestId);
    event CertificateRequestApprovedEvent(uint indexed requestId, bool approve);
    event PowerReqCertEvent(address indexed plantId, uint indexed powerId, uint value);
    
    struct DeviceRequest {
        uint id;
        address orgContract;
        address plantContract;
        address deviceAccount;
        string deviceLocation;
    }
    
    struct CertificateRequest {
        uint id;
        uint number;
        address orgId;
        address plantId;
        uint[][] powerIds;
        uint[][] values;
        address[][] txHashes;
        string metadataUri;
    }
    
    // only org contract can call this
    // return requestId
    function requestApproveDevice(address plantId, address deviceId, string memory deviceLocation) external returns (uint);
    
    function getAllDeviceRequest() external view returns (DeviceRequest[] memory);
    
    // only issuer can call this
    function approveDeviceRequest(uint requestId, bool approve) external;
    
    function requestCertificate(uint number, address plantId, uint[][] memory powerIds, uint[][] memory values, address[][] memory txHashes, string memory metadataUri) external returns (uint);

    function getCertificateRequest(uint requestId) external view returns (CertificateRequest memory);
    
    function getAllCertificateRequest() external view returns (CertificateRequest[] memory);
    
    function getNFTContract() external view returns (address);
    
    // After Issuer validate, will call this
    function approveCertificateRequest(uint requestId, bool approve) external;
}