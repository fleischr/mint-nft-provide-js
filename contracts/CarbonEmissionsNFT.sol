pragma solidity >=0.8.0 <=0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonEmissionsNFT is ERC721, ERC721Burnable, Ownable {
    constructor() ERC721("CarbonEmissionNFT", "CENFT") {}

    uint256 public totalMints = 0; 

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function openMint() public {
        totalMints++;
        safeMint(msg.sender,totalMints);
    }
}