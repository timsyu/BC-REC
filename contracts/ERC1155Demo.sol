pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

// https://forum.openzeppelin.com/t/function-settokenuri-in-erc721-is-gone-with-pragma-0-8-0/5978/3

contract NFT1155Demo is ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    event CertificateEvent(uint indexed requestId, uint indexed tokenId, address orgId ,address plantId, uint[] powerIds, uint[] values);
    event CertificateClaimEvent(uint256 indexed tokenId);
    
    address _owner;
    // using Strings for uint256;
    
    // token id => is claim
    mapping (uint256 => bool) _isClaims;
    // Optional mapping for token URIs
    mapping (uint256 => string) _tokenURIs;
    // token id => power ids
    mapping (uint256 => uint[]) _powerIds;
    
    // Base URI
    // string private _baseURIextended;
    
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }
    
    constructor() ERC1155("") {
        _owner = msg.sender;
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        // require(exists(tokenId), "ERC1155Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function mintNft(address receiver, uint[][] memory powerIds, string memory metadataUri) external onlyOwner returns (uint256) {
        
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(receiver, id, 1, new bytes(0));
        _setTokenURI(id, metadataUri);
        _powerIds[id] = powerIds[0];
        
        return id;
    }
    
    function mintBatchNft(uint requestId, address receiver, address plantId, uint number, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external onlyOwner returns (uint256[] memory) {
        
        uint256[] memory ids = new uint256[](number);
        uint256[] memory amounts = new uint256[](number);
        for (uint256 i = 0; i < number; i++) {
            _tokenIds.increment();
            ids[i] = _tokenIds.current();
            amounts[i] = 1;
            _setTokenURI(ids[i], metadataUri);
            _powerIds[ids[i]] = powerIds[i];
            // emit CertificateEvent
            emit CertificateEvent(requestId, ids[i], receiver , plantId, powerIds[i], values[i]);
        }
        
        _mintBatch(receiver, ids, amounts, new bytes(0));

        return ids;
    }
    
    function transferToken(address to, uint256[] memory ids, uint256[] memory amounts) external {
        for (uint256 i = 0; i < ids.length; i++) {
            require(_isClaims[ids[i]] == false);
        }
        safeBatchTransferFrom(msg.sender, to, ids, amounts, new bytes(0));
    }
    
    function claimCertificate(uint256 tokenId) external {
        require(isApprovedForAll(_owner, msg.sender));
        require(_isClaims[tokenId] == false);
        // _burn(msg.sender, tokenId, 1);
        _isClaims[tokenId] = true;
        emit CertificateClaimEvent(tokenId);
    }
    
    function getClaim(uint256 tokenId) external view returns (bool) {
        return _isClaims[tokenId];
    }
}