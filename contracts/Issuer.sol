pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./OrgManager.sol";
import "./Plant.sol";
import "./NFT1155Demo.sol";

contract Issuer {
    
    address _issuerAccount;
    OrgManager _orgManager;
    NFT1155Demo _nft;
    
    event DeviceRequestEvent(uint indexed requestId, address orgContract, address plantContract, address deviceAccount, bool approve);
    event CertificateRequestEvent(uint indexed requestId);
    event CertificateRequestApprovedEvent(uint indexed tokenId, address orgId ,address plantId, uint[] powerIds);
    event CertificateRequestDisApprovedEvent(uint indexed requestId);
    event PowerReqCertEvent(uint powerId, uint value);
    
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
        string metadataUri;
    }
    
    uint _deviceRequestCount;
    // device request id => _deviceRequests index
    mapping(uint => uint) _deviceRequestIndexes;
    DeviceRequest[] _deviceRequests;
    uint _certificateRequestCount;
    // certificate request id => _certificateRequests index
    mapping(uint => uint) _certificateRequestIndexes;
    CertificateRequest[] _certificateRequests;
    
    constructor(address orgManagerContract) {
        _orgManager = OrgManager(orgManagerContract);
        _nft = new NFT1155Demo();
        _deviceRequestCount = 0;
        _certificateRequestCount = 0;
        // test
        _issuerAccount = msg.sender;
    }
    
    modifier onlyOrg() {
        require(_orgManager.contains(msg.sender), "only org contract can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(msg.sender == _issuerAccount, "only issuer can call this");
        _;
    }
    
    // function setIssuerAccount(address issuerAccount) external {
    //     _issuerAccount = issuerAccount;
    // }
    
    // only org contract can call this
    // return requestId
    function requestApproveDevice(
        address plantId,
        address deviceId,
        string memory deviceLocation
        ) external onlyOrg returns (uint) {
        for(uint i = 0; i < _deviceRequests.length; i++) {
            require(_deviceRequests[i].deviceAccount != deviceId);
        }
        _deviceRequestCount++;
        _deviceRequests.push(DeviceRequest(_deviceRequestCount, msg.sender, plantId, deviceId, deviceLocation));
        _deviceRequestIndexes[_deviceRequestCount] = _deviceRequests.length - 1;
        return _deviceRequestCount;
    }
    
    function getAllDeviceRequest() external view returns (DeviceRequest[] memory) {
        return _deviceRequests;
    }
    
    // only issuer can call this
    function approveDeviceRequest(uint requestId, bool approve) external onlyIssuer {
        uint index = _deviceRequestIndexes[requestId];
        DeviceRequest memory request = _deviceRequests[index];
        emit DeviceRequestEvent(requestId, request.orgContract, request.plantContract, request.deviceAccount, approve);
        // update device state
        Plant(request.plantContract).updateDeviceState(request.deviceAccount, approve);
        // remove request
        _deviceRequestIndexes[_deviceRequests.length - 1] = index;
        _deviceRequests[index] = _deviceRequests[_deviceRequests.length - 1];
        _deviceRequests.pop();
        delete _deviceRequestIndexes[requestId];
    }
    
    function requestCertificate(
        uint number,
        address plantId,
        uint[][] memory powerIds,
        uint[][] memory values,
        string memory metadataUri
    ) external onlyOrg returns (uint) {
        _certificateRequestCount++;
        _certificateRequests.push(CertificateRequest(_certificateRequestCount, number, msg.sender, plantId, powerIds, values, metadataUri));
        _certificateRequestIndexes[_certificateRequestCount] = _certificateRequests.length - 1;
        emit CertificateRequestEvent(_certificateRequestCount);
        return _certificateRequestCount;
    }

    function getCertificateRequest(uint requestId) external view returns (CertificateRequest memory) {
        uint index = _certificateRequestIndexes[requestId];
        return _certificateRequests[index];
    }
    
    // After Issuer validate, will call this
    function approveCertificateRequest(
        uint requestId,
        bool approve
        ) external onlyIssuer {
        
        if(approve == false) {
            emit CertificateRequestDisApprovedEvent(requestId);
        } else {
            uint index = _certificateRequestIndexes[requestId];
            CertificateRequest memory certReq = _certificateRequests[index];
            // 1. emit PowerReqCertEvents
            uint number = certReq.number;
            uint[][] memory powerIds = certReq.powerIds;
            uint[][] memory values = certReq.values;
            for(uint i = 0; i < number; i++) {
                uint[] memory pIds = powerIds[i];
                uint[] memory vs = values[i];
                for(uint j = 0; j < vs.length; j++) {
                    emit PowerReqCertEvent(pIds[j], vs[j]);
                }
            }
            
            // 2. mint
            address orgId = certReq.orgId;
            address plantId = certReq.plantId;
            string memory metadataUri = certReq.metadataUri;
            uint[] memory tokenIds = _nft.mintBatchNft(orgId, number, powerIds, metadataUri);
            // 3. emit CertificateRequestApprovedEvent
            for(uint i = 0; i < number; i++) {
                emit CertificateRequestApprovedEvent(tokenIds[i], orgId , plantId, powerIds[i]);
            }
            
            // 4. remove request
            _certificateRequestIndexes[_certificateRequests.length - 1] = index;
            _certificateRequests[index] = _certificateRequests[_deviceRequests.length - 1];
            _certificateRequests.pop();
            delete _certificateRequestIndexes[requestId];
        }
    }
}