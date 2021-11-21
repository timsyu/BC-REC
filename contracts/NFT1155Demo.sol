pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "./INFT1155Demo.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
// https://forum.openzeppelin.com/t/function-settokenuri-in-erc721-is-gone-with-pragma-0-8-0/5978/3

contract NFT1155Demo is INFT1155Demo, ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address _orgManager;
    address _owner;
    // using Strings for uint256;
    
    // token id => is claim
    // mapping (uint256 => bool) _isClaims;
    // Optional mapping for token URIs
    // mapping (uint256 => string) _tokenURIs;
    // token id => power ids
    // mapping (uint256 => uint[]) _powerIds;
    // token id => certificate
    mapping (uint256 => Certificate) _certificates;
    
    // Base URI
    // string private _baseURIextended;
    
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }
    
    constructor(address orgManager) ERC1155("") {
        _orgManager = orgManager;
        _owner = msg.sender;
    }
    
    // function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    //     // require(exists(tokenId), "ERC1155Metadata: URI set of nonexistent token");
    //     _tokenURIs[tokenId] = _tokenURI;
    // }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        return _certificates[_tokenId].metadataUri;
    }
      
    function mintNft(address receiver, address plantId, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external override onlyOwner returns (uint256) {
        
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(receiver, id, 1, new bytes(0));
        _certificates[id] = Certificate(id, receiver, plantId, false, metadataUri, powerIds[0], values[0]);
        return id;
    }
    
    function mintBatchNft(uint requestId, address receiver, address plantId, uint number, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external override onlyOwner returns (uint256[] memory) {
        
        uint256[] memory ids = new uint256[](number);
        uint256[] memory amounts = new uint256[](number);
        for (uint256 i = 0; i < number; i++) {
            _tokenIds.increment();
            ids[i] = _tokenIds.current();
            amounts[i] = 1;
            // _setTokenURI(ids[i], metadataUri);
            // _powerIds[ids[i]] = powerIds[i];bytes32
            _certificates[ids[i]] = Certificate(ids[i], receiver, plantId, false, metadataUri, powerIds[i], values[i]);
            // emit CertificateEvent
            emit CertificateEvent(requestId, ids[i], receiver , plantId, powerIds[i], values[i]);
        }
        
        _mintBatch(receiver, ids, amounts, new bytes(0));

        return ids;
    }
    
    function transferToken(address to, uint256[] memory ids, uint256[] memory amounts) external override {
        for (uint256 i = 0; i < ids.length; i++) {
            require(_certificates[ids[i]].isClaim == false);
        }
        safeBatchTransferFrom(msg.sender, to, ids, amounts, new bytes(0));
    }
    
    function claimCertificate(uint256 tokenId) external override {
        require(isApprovedForAll(_owner, msg.sender));
        require(_certificates[tokenId].isClaim == false);
        // _burn(msg.sender, tokenId, 1);
        _certificates[tokenId].isClaim = true;
        emit CertificateClaimEvent(tokenId);
    }
    
    function getCertificate(uint256 tokenId) external override view returns (Certificate memory) {
        return _certificates[tokenId];
    }
    
    function getClaim(uint256 tokenId) external override view returns (bool) {
        return _certificates[tokenId].isClaim;
    }
    
    // only orgManager contract can call this.
    function setApprovalForOrg(address orgId) external override {
        require(msg.sender == _orgManager);
        setApprovalForAll(orgId, true);
    }
}