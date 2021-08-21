pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";

// https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity
contract OrgManager {
    
    // org contract address => _orgs index
    mapping(address => uint) _orgIndexes;
    address[] _orgs;
    address _userContract;
    
    event CreateOrgEvent(address indexed owner, address orgContract);
    event JoinOrgEvent(address indexed member, address orgContract);
    
    constructor(address userContract) {
        _userContract = userContract;
    }
    
    // modifier onlyOwner(address orgContract) {
    //     require( _orgs[orgContract] == true, "this orgContract is not exist");
    //     require( Org(orgContract).getOwner() == msg.sender, "only org owner can call this");
    //     _;
    // }
    
    // new a contract to owner
    function createOrg (string memory name, uint date, string memory description) external {
        address owner = msg.sender;
        Org org = new Org(_userContract, owner, name, date, description);
        address orgAddress = address(org);
        _orgs.push(orgAddress);
        _orgIndexes[orgAddress] = _orgs.length - 1;
        emit CreateOrgEvent(owner, orgAddress);
    }
    
    function getOrgInfo (address orgContract) private view returns (Org.OrgInfo memory) {
        return Org(orgContract).getOrgInfo();
    }
    
    function getAllOrgInfo () external view returns (Org.OrgInfo[] memory) {
        Org.OrgInfo[] memory result = new Org.OrgInfo[](_orgs.length);
        for(uint i = 0; i < _orgs.length; i++) {
            result[i] = getOrgInfo(_orgs[i]);
        }
        return result;
    }
    
    function contains (address orgContract) external view returns (bool) {
        return (_orgs[_orgIndexes[orgContract]] == orgContract);
    }
    
    // function deleteOrg (uint orgId) external onlyOwner(orgId) {
    //     Org(_orgs[orgId]).setDisable(msg.sender);
    //     _orgNum --;
    // }
    
    // function transferOwner (uint orgId, address newOwner) external onlyOwner(orgId) {
    //     Org(_orgs[orgId]).setOwner(newOwner);
    // }
}