pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

interface IOrgManager {
    
    event CreateOrgEvent(address indexed owner, address orgContract);
    event JoinOrgEvent(address indexed member, address orgContract);
    
    // new a contract to owner
    function createOrg (string memory name, uint date, string memory description, address issuerContract, address tokenContract) external returns (address);
    
    function getAllOrg () external view returns (address[] memory);
    
    function contains (address orgContract) external view returns (bool);
}