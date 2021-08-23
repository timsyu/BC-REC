pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./Org.sol";
import "./Issuer.sol";

contract Plant {
    
    event RecordEvent(uint indexed powerId, address indexed deviceId, uint date, uint value);
    event RecordTxHashEvent(uint indexed powerId, bytes32 txHash);
    
    struct Power {
        address deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    	bytes32 txHash; // record tx hash
    }
    
    struct SimplifiedPower {
        uint powerId;
    	uint value;
    }
    
    struct DeviceInfo {
        uint date; // timestamp
    	uint capacity; // float? theoretical power generation
    	Org.State state;
    	string location;
    	string image;
    	uint index;
    }
    
    struct PlantInfo {
        string _plantName;
        string _plantLocation;
    }
    
    address _orgContract;
    address _issuerContract;
    PlantInfo _plantInfo;
    
    // device account address => DeviceInfo
    mapping(address => DeviceInfo) _deviceInfoMap;
    address[] _devices;
    
    uint _powerCount;
    // power id => _powers index
    mapping(uint => uint) _powerIndexes;
    Power[] _powers;
    
    
    modifier onlyDevice() { // need test
        require(_deviceInfoMap[msg.sender].date > 0, "only Device can call this");
        _;
    }
    
    modifier onlyOrg() {
        require(_orgContract == msg.sender, "only Org can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(_issuerContract == msg.sender, "only Issuer can call this");
        _;
    }
    
    constructor(address issuerContract, string memory plantName, string memory plantLocation) {
        _powerCount = 0;
        // init contract
        _orgContract = msg.sender; // org contract will new plant
        _issuerContract = issuerContract;
        // init plant info
        _plantInfo = PlantInfo(plantName, plantLocation);
    }
    
    function addDevice(
        address device,
        uint date,
        uint capacity,
        string memory location,
        string memory image
        ) external onlyOrg {
        _devices.push(device);
        _deviceInfoMap[device] = DeviceInfo(date, capacity, Org.State.Idle, location, image, _devices.length - 1);
    }
    
    function updateDeviceState(
        address deviceId,
        bool approve
        ) external onlyIssuer {
        _deviceInfoMap[deviceId].state = approve ? Org.State.Approve : Org.State.DisApprove;
    }
    
    function getAllDevice() external view returns (DeviceInfo[] memory) {
        DeviceInfo[] memory result = new DeviceInfo[](_devices.length);
        for(uint i = 0; i < _devices.length; i++) {
            result[i] = _deviceInfoMap[_devices[i]];
        }
        return result;
    }
    
    // return powerId
    function record(
        address deviceId,
        uint date,
        uint value
        ) external onlyDevice returns (uint){
        require(_deviceInfoMap[deviceId].state == Org.State.Approve, "this device must be approved by issuer");
        // store record value to the storage
        _powers.push(Power(deviceId, date, value, value, bytes32(0x0)));
        _powerIndexes[++_powerCount] = _powers.length - 1;
        // emit record event to the chain
        emit RecordEvent(_powerCount, deviceId, date, value);
        return _powerCount;
    }
    
    function bindPowerAndTxHash(
        address deviceId,
        uint powerId,
        bytes32 txHash
        ) external {
        require(_deviceInfoMap[deviceId].state == Org.State.Approve, "this device must be approved by issuer");
        _powers[_powerIndexes[powerId]].txHash = txHash;
        emit RecordTxHashEvent(powerId, txHash);
    }
    
    // function getAllDeviceByState(State state) external view returns (DeviceInfo[] memory) {
    //     DeviceInfo[] memory result = new DeviceInfo[](_deviceInfoNum);
    //     uint num = 0;
    //     for(uint i = 0; i< _deviceInfoNum; i++) {
    //         if(_deviceInfo[i].state == state) {
    //             result[num++] = _deviceInfo[i];
    //         }
    //     }
    //     return result;
    // }
    
    function getAllPower() external view returns (Power[] memory) {
        return _powers;
    }
    
    // // check whether it is able to request certificate
    // // return result and number of power
    // function checkReqCertAble(uint number) private view returns (bool, uint) {
    //     if (number == 0) { // check number == 0
    //         return (false, 0);
    //     }
    //     uint num = 0;
    //     Power[] memory ps = _powers;
    //     for (uint i = 0;i < number;i++) {
    //         uint target = 1000;
    //         for (uint j = 0;j < ps.length;j++) {
    //             Power memory p = ps[j];
    //             if (p.remainValue != 0) {
    //                 num++;
    //                 if (target > p.remainValue) {
    //                     target -= p.remainValue;
    //                     p.remainValue = 0;
    //                 } else { // generate a cert.
    //                     p.remainValue -= target;
    //                     target = 0;
    //                     break;
    //                 }
    //             }
    //         }
    //         if (target != 0) { // all power can not generate a cert.
    //             return (false, 0);
    //         }
    //     }
    //     return (true, num);
    // }
    
    // struct DateRange {
    //     uint sdate;
    //     uint edate;
    // }
    
    // event CalculateEvent(uint indexed powerId, uint value);
    // // safe math? overflow?
    // function calculate(uint number) external returns (uint[] memory, uint[] memory, DateRange[] memory){
        
    //     (bool result, uint num) = checkReqCertAble(number);
    //     require(result, "checkReqCertAble is failed!"); // check result
        
    //     uint[] memory numbers = new uint[](number); // number of powerIds[i] and values[i]
    //     DateRange[] memory dateRanges = new DateRange[](number); // start dates
    //     // uint[] memory sdates = new uint[](number); // start dates
    //     // uint[] memory edates = new uint[](number); // end dates
    //     uint[] memory powerIds = new uint[](num); // power used to request cert
    //     uint[] memory values = new uint[](num); // value of the power used to request cert
        
    //     uint powerNum = 0;
    //     for (uint i = 0;i < number;i++) {
    //         uint target = 1000;
    //         uint count = 0;
    //         uint minDate = 2**256 - 1;
    //         uint maxDate = 0;
    //         for (uint j = 0;j < _powers.length;j++) {
    //             Power storage p = _powers[j];
    //             if (p.remainValue != 0) {
    //                 if (minDate > p.date) {
    //                     minDate = p.date;
    //                 }
    //                 if (maxDate < p.date) {
    //                     maxDate = p.date;
    //                 }
    //                 count++;
    //                 powerIds[powerNum] = p.powerId;
    //                 if (target > p.remainValue) {
    //                     target -= p.remainValue;
    //                     values[powerNum++] = p.remainValue;
    //                     p.remainValue = 0;
    //                 } else { // generate a cert.
    //                     p.remainValue -= target;
    //                     values[powerNum++] = target;
    //                     target = 0;
    //                     break;
    //                 }
    //             }
    //         }
    //         numbers[i] = count;
    //         dateRanges[i] = DateRange(minDate, maxDate);
    //         // sdates[i] = minDate;
    //         // edates[i] = maxDate;
    //     }
    //     // check num == powerNum, if fail, above modification will recovery <- check?
    //     require(num == powerNum, "validate powerNum is not equal to current powerNum");
    //     // emit record event to the chain
    //     for (uint i = 0;i < num;i++) {
    //         emit CalculateEvent(powerIds[i], values[i]);
    //     }
    //     // delete the power which remainValue == 0
    //     for (uint i = 0;i < _powers.length;i++) {
    //         if (_powers[i].remainValue == 0) {
    //             delete _powers[i];
    //         }
    //     }
        
    //     return (numbers, powerIds, dateRanges);
    // }

}