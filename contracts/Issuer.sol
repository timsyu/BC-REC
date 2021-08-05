pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./OrgManager.sol";
import "./Plant.sol";
import "./NFT721Demo.sol";

contract Issuer {
    
    address _issuerAccount;
    address _orgManager;
    NFT721Demo _nft;
    
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
    
    constructor(address orgManager, address nft) {
        _orgManager = orgManager;
        _nft = NFT721Demo(nft);
        // test
        _issuerAccount = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    }
    
    modifier onlyOrg(uint orgId) {
        require( msg.sender == OrgManager(_orgManager).getOrg(orgId), "only org contract can call this");
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
    
    event ReqCertEvent(uint indexed tokenId, uint orgId ,uint plantId, uint[] powerIds, uint sdate, uint edate);
    
    // After calculating, will call this
    function requestCertificate(uint orgId,uint plantId, uint number) external {
        Org org = Org(OrgManager(_orgManager).getOrg(orgId));
        require(org.getUserRole(msg.sender) == Org.Role.Admin, "only Org.Role Device can call this");
        Plant plant = Plant(org.getPlant(plantId));
        
        // 1. calculate in plant contract
        (uint[] memory numbers, uint[] memory powerIds, Plant.DateRange[] memory dateRanges) = plant.calculate(number);
        
        address receiver = org.getPlantAccount();
        uint start = 0;
        for (uint i = 0;i < number;i++) {
            uint[] memory oneTokenPowerIds = new uint[](numbers[i]);
            for (uint j = start;j < start + numbers[i];j++) {
                oneTokenPowerIds[j - start] = powerIds[j];
                start = numbers[i];
            }
            
            // 2. mint
            uint tokenId = _nft.mintNft(receiver, "");
            tokenId++;
            // 3. emit one token
            emit ReqCertEvent(tokenId, orgId , plantId, oneTokenPowerIds, dateRanges[i].sdate, dateRanges[i].edate);
        }
        // emit this requestCertificate which tokenIds?
    }
    
}