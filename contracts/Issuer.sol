pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./IIssuer.sol";
import "./NFT1155Demo.sol";
import "./IOrgManager.sol";
import "./IPlant.sol";

contract Issuer is IIssuer{
    
    address _issuerAccount;
    address _orgManager;
    NFT1155Demo _nft;
    
    uint _deviceRequestCount;
    // device request id => _deviceRequests index
    mapping(uint => uint) _deviceRequestIndexes;
    DeviceRequest[] _deviceRequests;
    uint _certificateRequestCount;
    // certificate request id => _certificateRequests index
    mapping(uint => uint) _certificateRequestIndexes;
    CertificateRequest[] _certificateRequests;
    
    constructor(address orgManagerContract) {
        _orgManager = orgManagerContract;
        _nft = new NFT1155Demo(orgManagerContract);
        _deviceRequestCount = 0;
        _certificateRequestCount = 0;
        // test
        _issuerAccount = msg.sender;
    }
    
    modifier onlyOrg() {
        require(IOrgManager(_orgManager).contains(msg.sender), "only org contract can call this");
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
        ) external override onlyOrg returns (uint) {
        // check device request exist
        for(uint i = 0; i < _deviceRequests.length; i++) {
            require(_deviceRequests[i].deviceAccount != deviceId);
        }
        _deviceRequestCount++;
        _deviceRequests.push(DeviceRequest(_deviceRequestCount, msg.sender, plantId, deviceId, deviceLocation));
        _deviceRequestIndexes[_deviceRequestCount] = _deviceRequests.length - 1;
        emit DeviceRequestEvent(_deviceRequestCount); 
        return _deviceRequestCount;
    }
    
    function getAllDeviceRequest() external override view returns (DeviceRequest[] memory) {
        return _deviceRequests;
    }
    
    // only issuer can call this
    function approveDeviceRequest(uint requestId, bool approve) external override onlyIssuer {
        uint index = _deviceRequestIndexes[requestId];
        DeviceRequest memory request = _deviceRequests[index];
        emit DeviceRequestApprovedEvent(requestId, request.orgContract, request.plantContract, request.deviceAccount, approve);
        // update device state
        IPlant(request.plantContract).updateDeviceState(request.deviceAccount, approve);
        // remove request
        DeviceRequest memory last = _deviceRequests[_deviceRequests.length - 1];
        _deviceRequestIndexes[last.id] = index;
        _deviceRequests[index] = last;
        _deviceRequests.pop();
        delete _deviceRequestIndexes[requestId];
    }
    
    function requestCertificate(
        uint number,
        address plantId,
        uint[][] memory powerIds,
        uint[][] memory values,
        address[][] memory txHashes,
        string memory metadataUri
    ) external override onlyOrg returns (uint) {
        // check cert request input valid
        require(number > 0);
        require(plantId!=address(0));
        require(powerIds.length == values.length);
        for(uint i = 0; i < powerIds.length; i++) {
            require(powerIds[i].length == values[i].length);
        }
        _certificateRequestCount++;
        _certificateRequests.push(CertificateRequest(_certificateRequestCount, number, msg.sender, plantId, powerIds, values, txHashes, metadataUri));
        _certificateRequestIndexes[_certificateRequestCount] = _certificateRequests.length - 1;
        emit CertificateRequestEvent(_certificateRequestCount);
        return _certificateRequestCount;
    }

    function getCertificateRequest(uint requestId) external override view returns (CertificateRequest memory) {
        uint index = _certificateRequestIndexes[requestId];
        require(_certificateRequests[index].number > 0);
        return _certificateRequests[index];
    }
    
    function getAllCertificateRequest() external override view returns (CertificateRequest[] memory) {
        return _certificateRequests;
    }
    
    function getNFTContract() external override view returns (address) {
        return address(_nft);
    }
    
    // After Issuer validate, will call this
    function approveCertificateRequest(
        uint requestId,
        bool approve
        ) external override onlyIssuer {
        // 1. emit CertificateRequestApprovedEvent
        emit CertificateRequestApprovedEvent(requestId, approve);
        uint index = _certificateRequestIndexes[requestId];
        CertificateRequest memory certReq = _certificateRequests[index];
        require(certReq.number > 0);
        if(approve) {
            // 2. emit PowerReqCertEvents
            uint number = certReq.number;
            uint[][] memory powerIds = certReq.powerIds;
            uint[][] memory values = certReq.values;
            for(uint i = 0; i < number; i++) {
                uint[] memory pIds = powerIds[i];
                uint[] memory vs = values[i];
                for(uint j = 0; j < vs.length; j++) {
                    emit PowerReqCertEvent(certReq.plantId, pIds[j], vs[j]);
                }
            }
            
            // 3. mint
            address orgId = certReq.orgId;
            address plantId = certReq.plantId;
            address[][] memory txHashes = certReq.txHashes;
            string memory metadataUri = certReq.metadataUri;
            _nft.mintBatchNft(requestId, orgId, plantId, number, powerIds, values, txHashes, metadataUri);
        }
        
        // 5. remove request
        CertificateRequest memory last = _certificateRequests[_certificateRequests.length - 1];
        _certificateRequestIndexes[last.id] = index;
        _certificateRequests[index] = last;
        _certificateRequests.pop();
        delete _certificateRequestIndexes[requestId];
    }
}