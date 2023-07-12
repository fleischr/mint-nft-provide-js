// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <=0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ProvideTest is ERC721, Pausable, Ownable, ERC721Burnable {
    constructor() ERC721("ProvideTest", "PRVDTST") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    uint256 public totalMints = 0; 

    function openMint() public {
        totalMints++;
        safeMint(msg.sender,totalMints);
    }
}
