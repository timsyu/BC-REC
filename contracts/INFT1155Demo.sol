pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

interface INFT1155Demo {
    
    event CertificateEvent(uint indexed requestId, uint indexed tokenId, address orgId ,address plantId, uint[] powerIds, uint[] values);
    event CertificateClaimEvent(uint256 indexed tokenId);
    
    struct Certificate {
        uint tokenId;
        address orgId;
        address plantId;
        bool isClaim;
        string metadataUri;
        uint[] powerIds;
        uint[] values;
    }
    
    function mintNft(address receiver, address plantId, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external returns (uint256);
    
    function mintBatchNft(uint requestId, address receiver, address plantId, uint number, uint[][] memory powerIds, uint[][] memory values, string memory metadataUri) external returns (uint256[] memory);
    
    function transferToken(address to, uint256[] memory ids, uint256[] memory amounts) external;
    
    function claimCertificate(uint256 tokenId) external;
    
    function getCertificate(uint256 tokenId) external view returns (Certificate memory);
    
    function getClaim(uint256 tokenId) external view returns (bool);
    
    function setApprovalForOrg(address orgId) external;
}