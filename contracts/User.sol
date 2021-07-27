pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

contract User {
    
    struct UserInfo {
        uint id;
        uint[] orgIds;
        string email;
        uint phone;
        string firstName;
        string lastName;
    }
    
    uint _userInfoNum;
    mapping(address => UserInfo) _userInfos;
    // user id => account address
    mapping(uint => address) _userAddress;
    
    constructor() {
        _userInfoNum = 0;
    }
    
    function register(
        address account,
        string memory email,
        uint phone,
        string memory firstName,
        string memory lastName
        ) external {
        _userInfos[account] = UserInfo(_userInfoNum, new uint[](0), email, phone, firstName, lastName);
        _userAddress[_userInfoNum++] = account;
    }
    
    function addOrgIdToUser(address account, uint orgId) external {
        (bool result,) = has(account, orgId);
        require(!result, "The user can not belong to Org");
        _userInfos[account].orgIds.push(orgId);
    }
    
    function removeOrgIdToUser(address account, uint orgId) external {
        (bool result, uint id) = has(account, orgId);
        require(result, "The user must belong to Org");
        delete _userInfos[account].orgIds[id];
    }
    
    function has(address account, uint orgId) private view returns (bool result, uint id) {
        uint[] memory ids = _userInfos[account].orgIds;
        for(uint i = 0; i < ids.length; i++) {
            if(ids[i] == orgId) {
                result = true;
                id = i;
                break;
            }
        }
    }
    
    function removeUser(address account) external {
        delete _userInfos[account];
        delete _userAddress[_userInfos[account].id];
        _userInfoNum --;
    }
    
    function getUserInfo(address account) external view returns (UserInfo memory) {
        return _userInfos[account];
    }
    
    function getAllUserInfo() external view returns (UserInfo[] memory result) {
        result = new UserInfo[](_userInfoNum);
        for(uint i = 0; i < _userInfoNum; i++) {
            result[i] = _userInfos[_userAddress[i]];
        }
    }
}
