pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./IIssuerV2.sol";
import "./NFT1155Demo.sol";
import "./IOrgManager.sol";
import "./IPlant.sol";

contract IssuerV2 is IIssuerV2 {
    
    address _issuerAccount;
    address _orgManager;
    NFT1155Demo _nft;
    
    uint _certificateRequestCount;
    uint _deviceRequestCount;
    // device request id => _deviceRequests index
    mapping(uint => uint) _deviceRequestIndexes;
    DeviceRequest[] _deviceRequests;
    
    constructor(address orgManagerContract) {
        _orgManager = orgManagerContract;
        _nft = new NFT1155Demo(orgManagerContract);
        // test
        _issuerAccount = msg.sender;
    }
    
    modifier onlyOrg() {
        require(IOrgManager(_orgManager).contains(msg.sender), "only org contract can call this");
        _;
    }
    
    modifier onlyIssuer() {
        require(msg.sender == _issuerAccount, "only issuer can call this");
        _;
    }
    
    // function setIssuerAccount(address issuerAccount) external {
    //     _issuerAccount = issuerAccount;
    // }
    
    // only org contract can call this
    // return requestId
    function requestApproveDevice(
        address plantId,
        address deviceId,
        string memory deviceLocation
        ) external override onlyOrg returns (uint) {
        // check device request exist
        for(uint i = 0; i < _deviceRequests.length; i++) {
            require(_deviceRequests[i].deviceAccount != deviceId);
        }
        _deviceRequestCount++;
        _deviceRequests.push(DeviceRequest(_deviceRequestCount, msg.sender, plantId, deviceId, deviceLocation));
        _deviceRequestIndexes[_deviceRequestCount] = _deviceRequests.length - 1;
        emit DeviceRequestEvent(_deviceRequestCount); 
        return _deviceRequestCount;
    }
    
    function getAllDeviceRequest() external override view returns (DeviceRequest[] memory) {
        return _deviceRequests;
    }
    
    // only issuer can call this
    function approveDeviceRequest(uint requestId, bool approve) external override onlyIssuer {
        uint index = _deviceRequestIndexes[requestId];
        DeviceRequest memory request = _deviceRequests[index];
        emit DeviceRequestApprovedEvent(requestId, request.orgContract, request.plantContract, request.deviceAccount, approve);
        // update device state
        IPlant(request.plantContract).updateDeviceState(request.deviceAccount, approve);
        // remove request
        DeviceRequest memory last = _deviceRequests[_deviceRequests.length - 1];
        _deviceRequestIndexes[last.id] = index;
        _deviceRequests[index] = last;
        _deviceRequests.pop();
        delete _deviceRequestIndexes[requestId];
    }
    
    struct Power {
        uint id;
        address deviceId;
    	uint date; // timestamp
    	uint value; // float? 上傳電量
    	uint remainValue; // remainValue - 被用來申請憑證的電量
    	bytes32 txHash; // record tx hash
    }
    
    function requestCertificate(
        uint number,
        address plantId,
        uint[][] memory powerIds,
        uint[][] memory values,
        string memory metadataUri
    ) external override onlyOrg returns (uint, uint[] memory) {
        uint requestId = ++_certificateRequestCount;
        // emit CertificateRequestApprovedEvent
        emit CertificateRequestApprovedEvent(requestId);
        // check cert request input valid
        require(number > 0, "1");
        require(plantId!=address(0), "2");
        require(number == powerIds.length);
        require(powerIds.length == values.length);
        // get target power's remainValue in plant
        uint[][] memory remainValues = IPlant(plantId).getValues(powerIds);
        for(uint i = 0; i < number; i++) {
            // check data length
            require(powerIds[i].length == values[i].length);
            uint[] memory vs = values[i];
            uint total = 0;
            for(uint j = 0; j < vs.length; j++) {
                // check power enough
                require(remainValues[i][j] > 0, "3");
                require(vs[j] <= remainValues[i][j], "4");
                total += vs[j];
                // emit PowerReqCertEvents
                emit PowerReqCertEvent(plantId, powerIds[i][j], vs[j]);
            }
            // check power reach to cert
            require(total == 1000, "5");
        }
        // reduce power
        IPlant(plantId).reducePower(powerIds, values);
        
        // mint
        address orgId = msg.sender;
        uint[] memory tokenIds = _nft.mintBatchNft(requestId, orgId, plantId, number, powerIds, values, metadataUri);
       

        return (requestId, tokenIds);
    }
    
    function getNFTContract() external override view returns (address) {
        return address(_nft);
    }
    
}