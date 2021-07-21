pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

contract Org {
    
    address orgManager;
    bool disable;
    mapping(address => uint) admins;
    mapping(uint => address) users;
    
    struct OrgInfo {
        uint id; // org id
        address owner; // who creates this Org
        uint date; // timestamp
        string description;
    }
    
    struct UserInfo {
        uint id; // user id
    	address account;
    	uint date; // timestamp
    	string email;
    	uint phone;
    	string firstName;
    	string lastName;
    }

    OrgInfo orgInfo;
    mapping(address => UserInfo) userInfos;
    uint public userInfoNum;
    
    modifier onlyAdmin() {
        require(admins[msg.sender] == 2, "only admin can call this");
        _;
    }
    
    modifier onlyOrgManager() {
        require(orgManager == msg.sender, "only orgManager can call this");
        _;
    }
    
    modifier onlyOwner(address caller) {
        require(orgInfo.owner == caller, "only owner can call this");
        _;
    }
    
    modifier onlyAble() {
        require(disable == false, "only contract able can call this");
        _;
    }
    
    // only admins can call this
    function setDisable(address caller) public onlyOrgManager onlyOwner(caller) onlyAble{
        disable = true;
    }
    
    constructor(uint id, address owner, uint date, string memory description) {
        orgManager = msg.sender; // orgManager contract will call this
        orgInfo = OrgInfo(id, owner, date, description);
        userInfoNum = 0;
        disable = false;
        admins[owner] = 2;
        
        // for test
        admins[0xdF8F0e43F20f3c2079cb57Bc868fC169EEC196C1] = 2;
        admins[0x5B38Da6a701c568545dCfcB03FcB875f56beddC4] = 2;
        admins[0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB] = 2;
    }
    
    // only admins can call this
    function setDescription(string memory description) public onlyAdmin onlyAble {
        orgInfo.description = description;
    }
    
    function setOwner(address newOwner) public onlyOrgManager onlyAble{
        orgInfo.owner = newOwner;
    }
    
    function getOwner() public view onlyAble returns (address) {
        return orgInfo.owner;
    }
    
    function getUserInfo(address account) public view onlyAble returns (UserInfo memory) {
        return userInfos[account];
    }
    
    function getAllUserInfo() public view onlyAble returns (address[] memory, uint[] memory, string[] memory, uint[] memory, string[] memory, string[] memory) {
        
        address[] memory accounts = new address[](userInfoNum);
        uint[] memory dates = new uint[](userInfoNum);
        string[] memory emails = new string[](userInfoNum);
        uint[] memory phones = new uint[](userInfoNum);
        string[] memory firstNames = new string[](userInfoNum);
        string[] memory lastNames = new string[](userInfoNum);
        
        for(uint i = 0; i < userInfoNum; i++) {
            address account = users[i];
            accounts[i] = userInfos[account].account;
            dates[i] = userInfos[account].date;
            emails[i] = userInfos[account].email;
            phones[i] = userInfos[account].phone;
            firstNames[i] = userInfos[account].firstName;
            lastNames[i] = userInfos[account].lastName;
        }
        
        
        return (accounts, dates, emails, phones, firstNames, lastNames);
    }
    
    function getOrgInfo() public view onlyAble returns (OrgInfo memory) {
        return orgInfo;
    }
    
    // only admins can call this
    function addAdmin(address account) public onlyAdmin onlyAble {
        admins[account] = 2;
    }
    
    // only admins can call this
    function removeAdmin(address owner) public onlyAdmin onlyAble {
        delete admins[owner];
    }
    
    // only admins can call this
    function addUser(
        address account,
        uint date,
        string memory email,
        uint phone,
        string memory firstName,
        string memory lastName
        ) public onlyAdmin onlyAble {
        // UserInfo memory userInfo = UserInfo(userInfoNum ,account, date, email, phone, firstName, lastName);
        userInfos[account] = UserInfo(userInfoNum, account, date, email, phone, firstName, lastName);
        users[userInfoNum] = account;
        userInfoNum ++;
    }
    
    // only admins can call this
    function removeUser(address account) public onlyAdmin onlyAble {
        delete userInfos[account];
        delete users[userInfos[account].id];
        userInfoNum --;
    }
}