pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

// https://forum.openzeppelin.com/t/function-settokenuri-in-erc721-is-gone-with-pragma-0-8-0/5978/3

contract NFT1155Demo is ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address _owner;
    // using Strings for uint256;
    
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
    
    // function setBaseURI(string memory baseURI_) external {
    //     _baseURIextended = baseURI_;
    // }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    // function _baseURI() internal view virtual override returns (string memory) {
    //     return _baseURIextended;
    // }
    
    // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    //     require(exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    //     string memory _tokenURI = _tokenURIs[tokenId];
    //     string memory base = _baseURI();
        
    //     // If there is no base URI, return the token URI.
    //     if (bytes(base).length == 0) {
    //         return _tokenURI;
    //     }
    //     // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
    //     if (bytes(_tokenURI).length > 0) {
    //         return string(abi.encodePacked(base, _tokenURI));
    //     }
    //     // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
    //     return string(abi.encodePacked(base, tokenId.toString()));
    // }
    
    function mintNft(address receiver, uint[][] memory powerIds, string memory metadataUri) external onlyOwner returns (uint256) {
        
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(receiver, id, 1, new bytes(0));
        _setTokenURI(id, metadataUri);
        _powerIds[id] = powerIds[0];
        
        return id;
    }
    
    function mintBatchNft(address receiver, uint number, uint[][] memory powerIds, string memory metadataUri) external onlyOwner returns (uint256[] memory) {
        
        uint256[] memory ids = new uint256[](number);
        uint256[] memory amounts = new uint256[](number);
        for (uint256 i = 0; i < number; i++) {
            _tokenIds.increment();
            ids[i] = _tokenIds.current();
            amounts[i] = 1;
            _setTokenURI(ids[i], metadataUri);
            _powerIds[ids[i]] = powerIds[i];
        }
        
        _mintBatch(receiver, ids, amounts, new bytes(0));

        return ids;
    }
}