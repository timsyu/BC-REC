pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";

contract OrgManager {
    
    uint orgNum;
    // org id => Org
    mapping(uint => Org) orgs;
    
    constructor() {
        orgNum = 0;
    }
    
    modifier onlyOwner(uint orgId) {
        Org org = orgs[orgId];
        require( org.getOwner() == msg.sender, "only org owner can call this");
        _;
    }
    
    // new a contract to owner
    function createOrg (uint date, string memory description) public {
        Org org = new Org(orgNum, msg.sender, date, description);
        orgs[orgNum] = org;
        orgNum ++;
    }
    
    function getOrg (uint orgId) public view returns (Org) {
        return orgs[orgId];
    }
    
    function getOrgInfo (uint orgId) public view returns (Org.OrgInfo memory) {
        return orgs[orgId].getOrgInfo();
    }
    
    function getAllOrgInfo () public view returns (uint[] memory, address[] memory, uint[] memory, string[] memory) {
        uint[] memory ids = new uint[](orgNum);
        address[] memory owners = new address[](orgNum);
        uint[] memory dates = new uint[](orgNum);
        string[] memory descriptions = new string[](orgNum);

        
        for(uint i = 0; i < orgNum; i++) {
            Org org = orgs[i];
            Org.OrgInfo memory orgInfo = org.getOrgInfo();
            ids[i] = orgInfo.id;
            owners[i] = orgInfo.owner;
            dates[i] = orgInfo.date;
            descriptions[i] = orgInfo.description;
        }
        
        return (ids, owners, dates, descriptions);
    }
    
    function deleteOrg (uint orgId) public onlyOwner(orgId) {
        Org org = orgs[orgId];
        org.setDisable(msg.sender);
        orgNum --;
    }
    
    function transferOwner (uint orgId, address newOwner) public onlyOwner(orgId) {
        Org org = orgs[orgId];
        org.setOwner(newOwner);
    }
}