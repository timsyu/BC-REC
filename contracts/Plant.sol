pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./Issuer.sol";

contract Plant {
    enum State { Pending, Approve, DisApprove} // add not send request yet state?
    event RecordEvent(uint indexed powerId, uint indexed deviceId, uint date, uint value);
    
    struct Power {
        uint powerId;
        uint deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    }
    
    struct DeviceInfo {
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	State state;
    	string location;
    	string image;
    }

    uint _orgId;
    address _org;
    string _plantName;
    uint _plantId;
    string _plantLocation;
    uint _deviceInfoNum;
    mapping(uint => DeviceInfo) _deviceInfos;
    Power[] _powers;
    uint totalPowerNum; // include history power
    
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
        uint state,
        string memory location,
        string memory image
        ) external onlyOrg returns (uint) { // permission??
        require(uint(State.DisApprove) >= state);
        _deviceInfos[_deviceInfoNum++] = DeviceInfo(date, capacity, State(state), location, image);
        return _deviceInfoNum;
    }
    
    function changeDeviceState(
        uint deviceId,
        uint state
        ) external onlyOrg {
        require(uint(State.DisApprove) >= state);
        _deviceInfos[deviceId].state = State(state);
    }
    
    function record(
        uint deviceId,
        uint date,
        uint value
        ) external onlyDevice {
        require(_deviceInfos[deviceId].state == State.Approve);
        // store record value to the storage
        _powers.push(Power(totalPowerNum, deviceId, date, value, value));
        // emit record event to the chain
        emit RecordEvent(totalPowerNum, deviceId, date, value); // transaction hash?
        totalPowerNum++;
    }
    
    function getAllDeviceByState(State state) external view returns (DeviceInfo[] memory result) {
        result = new DeviceInfo[](_deviceInfoNum);
        uint num = 0;
        for(uint i = 0; i< _deviceInfoNum; i++) {
            if(_deviceInfos[i].state == state) {
                result[num++] = _deviceInfos[i];
            }
        }
    }
    
    function getAllPower() external view returns (Power[] memory) {
        return _powers;
    }
    
    function getDeviceNum() external view returns (uint) {
        return _deviceInfoNum;
    }
    
    // function requestCertificate( // <- call requestCertificate() in the Issuer contract directly
    //     address issuerContract, 
    //     uint number
    //     ) external onlyDevice { // should add some balance to this contract?
    //     Issuer(issuerContract).requestCertificate(_orgId, _plantId, number);
    // }
    
    // check whether it is able to request certificate
    // return result and number of power
    function checkReqCertAble(uint number) private view returns (bool, uint) {
        if (number == 0) { // check number == 0
            return (false, 0);
        }
        uint num = 0;
        Power[] memory ps = _powers;
        for (uint i = 0;i < number;i++) {
            uint target = 1000;
            for (uint j = 0;j < ps.length;j++) {
                Power memory p = ps[j];
                if (p.remainValue != 0) {
                    num++;
                    if (target > p.remainValue) {
                        target -= p.remainValue;
                        p.remainValue = 0;
                    } else { // generate a cert.
                        p.remainValue -= target;
                        target = 0;
                        break;
                    }
                }
            }
            if (target != 0) { // all power can not generate a cert.
                return (false, 0);
            }
        }
        return (true, num);
    }
    
    struct DateRange {
        uint sdate;
        uint edate;
    }
    
    event CalculateEvent(uint indexed powerId, uint value);
    // safe math? overflow?
    function calculate(uint number) external returns (uint[] memory, uint[] memory, DateRange[] memory){
        
        (bool result, uint num) = checkReqCertAble(number);
        require(result, "checkReqCertAble is failed!"); // check result
        
        uint[] memory numbers = new uint[](number); // number of powerIds[i] and values[i]
        DateRange[] memory dateRanges = new DateRange[](number); // start dates
        // uint[] memory sdates = new uint[](number); // start dates
        // uint[] memory edates = new uint[](number); // end dates
        uint[] memory powerIds = new uint[](num); // power used to request cert
        uint[] memory values = new uint[](num); // value of the power used to request cert
        
        uint powerNum = 0;
        for (uint i = 0;i < number;i++) {
            uint target = 1000;
            uint count = 0;
            uint minDate = 2**256 - 1;
            uint maxDate = 0;
            for (uint j = 0;j < _powers.length;j++) {
                Power storage p = _powers[j];
                if (p.remainValue != 0) {
                    if (minDate > p.date) {
                        minDate = p.date;
                    }
                    if (maxDate < p.date) {
                        maxDate = p.date;
                    }
                    count++;
                    powerIds[powerNum] = p.powerId;
                    if (target > p.remainValue) {
                        target -= p.remainValue;
                        values[powerNum++] = p.remainValue;
                        p.remainValue = 0;
                    } else { // generate a cert.
                        p.remainValue -= target;
                        values[powerNum++] = target;
                        target = 0;
                        break;
                    }
                }
            }
            numbers[i] = count;
            dateRanges[i] = DateRange(minDate, maxDate);
            // sdates[i] = minDate;
            // edates[i] = maxDate;
        }
        // check num == powerNum, if fail, above modification will recovery <- check?
        require(num == powerNum, "validate powerNum is not equal to current powerNum");
        // emit record event to the chain
        for (uint i = 0;i < num;i++) {
            emit CalculateEvent(powerIds[i], values[i]);
        }
        // delete the power which remainValue == 0
        for (uint i = 0;i < _powers.length;i++) {
            if (_powers[i].remainValue == 0) {
                delete _powers[i];
            }
        }
        
        return (numbers, powerIds, dateRanges);
    }
}