pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";

contract OrgManager {
    
    uint _orgNum;
    // org id => Org contract address
    mapping(uint => address) _orgs; 
    
    constructor() {
        _orgNum = 0;
    }
    
    modifier onlyOwner(uint orgId) {
        require( Org(_orgs[orgId]).getOwner() == msg.sender, "only org owner can call this");
        _;
    }
    
    // new a contract to owner
    function createOrg (uint date, string memory description) external returns (uint, Org) {
        Org org = new Org(_orgNum, msg.sender, date, description);
        _orgs[_orgNum] = address(org);
        uint orgId = _orgNum;
        _orgNum ++;
        return (orgId, org);
    }
    
    function getOrg (uint orgId) external view returns (address) {
        return _orgs[orgId];
    }
    
    function getOrgInfo (uint orgId) private view returns (Org.OrgInfo memory) {
        return Org(_orgs[orgId]).getOrgInfo();
    }
    
    function getAllOrgInfo () external view returns (Org.OrgInfo[] memory) {
        Org.OrgInfo[] memory result = new Org.OrgInfo[](_orgNum);
        
        for(uint i = 0; i < _orgNum; i++) {
            Org.OrgInfo memory orgInfo = getOrgInfo(i);
            result[i] = orgInfo;
        }
        
        return result;
    }
    
    function deleteOrg (uint orgId) external onlyOwner(orgId) {
        Org(_orgs[orgId]).setDisable(msg.sender);
        _orgNum --;
    }
    
    function transferOwner (uint orgId, address newOwner) external onlyOwner(orgId) {
        Org(_orgs[orgId]).setOwner(newOwner);
    }
}