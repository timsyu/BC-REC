pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./Issuer.sol";

contract Plant {
    
    struct Power {
        uint deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    	string certificateId;
    }
    
    struct DeviceInfo {
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	string state;
    	string location;
    	string image;
    }
    
    struct CertificateRequest {
        Org.State state;
    }
    
    uint _orgId;
    address _org;
    string _plantName;
    uint _plantId;
    string _plantLocation;
    uint _deviceInfoNum;
    mapping(uint => DeviceInfo) _deviceInfos;
    Power[] _powers;
    
    modifier onlyDevice() {
        require(Org(_org).getUserRole(msg.sender) == Org.Role.Device, "only Device can call this");
        _;
    }
    
    modifier onlyOrg() {
        require(_org == msg.sender, "only Device can call this");
        _;
    }
    
    constructor(uint orgId, string memory plantName, string memory plantLocation) {
        _orgId = orgId;
        _org = msg.sender;
        _plantName = plantName;
        _plantLocation = plantLocation;
        _deviceInfoNum = 0;
    }
    
    function addDevice(
        uint date,
        uint capacity,
        string memory state,
        string memory location,
        string memory image
        ) external onlyOrg returns (uint) {
        _deviceInfos[_deviceInfoNum] = DeviceInfo(date, capacity, state, location, image);
        uint id = _deviceInfoNum;
        _deviceInfoNum ++;
        return id;
    }
    
    function record(
        uint deviceId,
        uint date,
        uint value
        ) external {
        _powers.push(Power(deviceId, date, value, value, ""));
    }
    
    // get target time section power generation
    function showTimeSection(
        uint sdate,
        uint edate
        ) external view returns (Power[] memory) {
        Power[] memory result = new Power[](_powers.length);
        uint num = 0;
       
        for (uint i = 0; i < _powers.length ; i++) {
            uint d = _powers[i].date;
            if (sdate <= d && d <= edate) {
                result[num] = _powers[i];
                num ++;
            }
        }
        
        return result;
    }
    
    function getDeviceNum() external view returns (uint) {
        return _deviceInfoNum;
    }
    
    function requestCertificate(
        address issuerContract, 
        uint number
        ) external onlyDevice {
        Issuer(issuerContract).requestCertificate(_orgId, _plantId, number);
    }
}