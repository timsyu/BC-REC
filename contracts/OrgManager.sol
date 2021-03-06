pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./INFT1155Demo.sol";
import "./IOrgManager.sol";

// https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity
contract OrgManager is IOrgManager {
    
    // org contract address => _orgs index
    mapping(address => uint) _orgIndexes;
    address[] _orgs;
    
    constructor() {
    }
    
    // modifier onlyOwner(address orgContract) {
    //     require( _orgs[orgContract] == true, "this orgContract is not exist");
    //     require( Org(orgContract).getOwner() == msg.sender, "only org owner can call this");
    //     _;
    // }
    
    // new a contract to owner
    function createOrg (string memory name, uint date, string memory description, address issuerContract, address tokenContract) external override returns (address) {
        require(date > 0);
        address owner = msg.sender;
        Org org = new Org(issuerContract, tokenContract, owner, name, date, description);
        address orgAddress = address(org);
        // let org can transfer token
        INFT1155Demo(tokenContract).setApprovalForOrg(orgAddress);
        _orgs.push(orgAddress);
        _orgIndexes[orgAddress] = _orgs.length - 1;
        emit CreateOrgEvent(owner, orgAddress);
        return orgAddress;
    }
    
    function getAllOrg () external override view returns (address[] memory) {
        return _orgs;
    }
    
    function contains (address orgContract) external override view returns (bool) {
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