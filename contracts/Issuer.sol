pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./OrgManager.sol";
import "./Plant.sol";

contract Issuer {
    
    address _issuerAccount;
    address _orgManager;
    
    struct DeviceRequest {
        uint orgId;
        uint deviceRequestId;
        string deviceLocation;
    }
    
    
    DeviceRequest[] _deviceRequests;
    
    constructor(address orgManager) {
        _orgManager = orgManager;
        
        // test
        _issuerAccount = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    }
    
    modifier onlyOrgContract(uint orgId) {
        require( msg.sender == OrgManager(_orgManager).getOrg(orgId), "only org contract can call this");
        _;
    }
    
    modifier onlyPlantContract(uint orgId, uint plantId) {
        require( msg.sender == Org(OrgManager(_orgManager).getOrg(orgId)).getPlant(plantId), "only plant contract can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(msg.sender == _issuerAccount, "only issuer can call this");
        _;
    }
    
    function addDeviceRequest(
        uint orgId,
        uint deviceRequestId,
        string memory deviceLocation
        ) external onlyOrgContract(orgId) {
        _deviceRequests.push(DeviceRequest(orgId, deviceRequestId, deviceLocation));
    }
    
    // only issuer can call this
    function approveAddDeviceRequest(uint deviceRequestId, bool approve) external onlyIssuer{
        Org(OrgManager(_orgManager).getOrg(_deviceRequests[deviceRequestId].orgId))
            .setDeviceRequest(_deviceRequests[deviceRequestId].deviceRequestId, approve);
    }
    
    function getAllDeviceRequest() external view returns (DeviceRequest[] memory) {
        return _deviceRequests;
    }
    
    function requestCertificate(uint orgId,uint plantId, uint number) external onlyPlantContract(orgId, plantId) {
        
    }
    
}