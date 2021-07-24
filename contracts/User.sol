pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

contract User {
    
    struct UserInfo {
        uint id; // user id
        address account;
        uint date; // timestamp
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
    
    function addUser(
        address account,
        uint date,
        string memory email,
        uint phone,
        string memory firstName,
        string memory lastName
        ) external {
        // UserInfo memory userInfo = UserInfo(userInfoNum ,account, date, email, phone, firstName, lastName);
        _userInfos[account] = UserInfo(_userInfoNum, account, date, email, phone, firstName, lastName);
        _userAddress[_userInfoNum] = account;
        _userInfoNum ++;
    }
    
    function removeUser(address account) external {
        delete _userInfos[account];
        delete _userAddress[_userInfos[account].id];
        _userInfoNum --;
    }
    
    function getUserInfo(address account) external view returns (UserInfo memory) {
        return _userInfos[account];
    }
    
    function getAllUserInfo() external view returns (UserInfo[] memory) {
        
        UserInfo[] memory result = new UserInfo[](_userInfoNum);
        
        for(uint i = 0; i < _userInfoNum; i++) {
            result[i] = _userInfos[_userAddress[i]];
        }
        
        return result;
    }
}
