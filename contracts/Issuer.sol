pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./OrgManager.sol";
import "./Plant.sol";

contract Issuer {
    
    address _issuerAccount;
    address _orgManager;
    
    enum State { Pending, Approve, DisApprove}
    struct DeviceRequest {
        uint orgId;
        uint plantId;
        uint deviceId;
        string deviceLocation;
        State state;
    }
    
    struct CertificateRequest {
        State state;
    }
    
    DeviceRequest[] _deviceRequests;
    
    constructor(address orgManager) {
        _orgManager = orgManager;
        
        // test
        _issuerAccount = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    }
    
    modifier onlyOrg(uint orgId) {
        require( msg.sender == OrgManager(_orgManager).getOrg(orgId), "only org contract can call this");
        _;
    }
    
    modifier onlyPlant(uint orgId, uint plantId) {
        require( msg.sender == Org(OrgManager(_orgManager).getOrg(orgId)).getPlant(plantId), "only plant contract can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(msg.sender == _issuerAccount, "only issuer can call this");
        _;
    }
    
    // only org contract can call this
    function requestDevice(
        uint orgId,
        uint plantId,
        uint deviceId,
        string memory deviceLocation
        ) external onlyOrg(orgId) {
        _deviceRequests.push(DeviceRequest(orgId, plantId, deviceId, deviceLocation, State.Pending));
    }
    
    // only issuer can call this
    function approveDeviceRequest(uint id, bool approve) external onlyIssuer{
        _deviceRequests[id].state = approve ? State.Approve: State.DisApprove;
    }
    
    function getAllDeviceRequest() external view returns (DeviceRequest[] memory) {
        return _deviceRequests;
    }
    
    function requestCertificate(uint orgId,uint plantId, uint number) external onlyPlant(orgId, plantId) {
        
    }
    
}