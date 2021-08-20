pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./OrgManager.sol";
import "./Plant.sol";
import "./NFT721Demo.sol";

contract Issuer {
    
    address _issuerAccount;
    OrgManager _orgManager;
    NFT721Demo _nft;
    
    event DeviceRequestEvent(uint indexed requestId, address orgContract, address plantContract, address deviceAccount, bool approve);
    event ReqCertEvent(uint indexed tokenId, uint orgId ,uint plantId, uint[] powerIds, uint sdate, uint edate);
    
    struct DeviceRequest {
        address orgContract;
        address plantContract;
        address deviceAccount;
        string deviceLocation;
    }
    
    struct CertificateRequest {
        uint number;
        address orgId;
        address plantId;
        Plant.SimplifiedPower[][] simplifiedPowers;
        string[] metadatauri;
    }
    
    uint _deviceRequestCount;
    // device request id => _deviceRequests index
    mapping(uint => uint) _deviceRequestIndexes;
    DeviceRequest[] _deviceRequests;
    uint _certificateRequestCount;
    // certificate request id => _certificateRequests index
    mapping(uint => uint) _certificateRequestIndexes;
    CertificateRequest[] _certificateRequests;
    
    constructor(address orgManagerContract, address nft) {
        _orgManager = OrgManager(orgManagerContract);
        _nft = NFT721Demo(nft);
        _deviceRequestCount = 0;
        _certificateRequestCount = 0;
        // test
        _issuerAccount = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    }
    
    modifier onlyOrg() {
        require(_orgManager.contains(msg.sender), "only org contract can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(msg.sender == _issuerAccount, "only issuer can call this");
        _;
    }
    
    // only org contract can call this
    // return requestId
    function requestApproveDevice(
        address plantId,
        address deviceId,
        string memory deviceLocation
        ) external onlyOrg returns (uint){
        _deviceRequests.push(DeviceRequest(msg.sender, plantId, deviceId, deviceLocation));
        _deviceRequestIndexes[_deviceRequestCount++] = _deviceRequests.length - 1;
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
        // remove request from storage
        delete _deviceRequests[index];
        delete _deviceRequestIndexes[requestId];
    }
    
    // Admin After calculating, will call this
    // function requestCertificate(uint number, address plantId, Plant.SimplifiedPower[][] memory simplifiedPowers, string[] memory metadataUriList) external {
        // address orgAddress = OrgManager(_orgManager).getOrg(orgId);
        // Org org = Org(orgAddress);
        // require(msg.sender == orgAddress, "only Org can call this");
        // Plant plant = Plant(org.getPlant(plantId));
        
        // // 1. calculate in plant contract
        // bool valid = plant.validate(number, powerIds, values);
        
        // address receiver = org.getPlantAccount();
        // uint start = 0;
        // for (uint i = 0;i < number;i++) {
        //     uint[] memory oneTokenPowerIds = new uint[](numbers[i]);
        //     for (uint j = start;j < start + numbers[i];j++) {
        //         oneTokenPowerIds[j - start] = powerIds[j];
        //         start = numbers[i];
        //     }
            
           
        //     tokenId++;
        //     // 3. emit one token
        //     emit ReqCertEvent(tokenId, orgId , plantId, oneTokenPowerIds, oneTokenValues, dateRanges[i].sdate, dateRanges[i].edate);
        // }
        //  // 2. mint
        // uint tokenId = _nft.mintNft(receiver, "");
        // // emit this requestCertificate which tokenIds?
    // }
}