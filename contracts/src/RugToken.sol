// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RugToken is ERC20 {
    uint256 private _maxSupply;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        address factory
    ) ERC20(name_, symbol_) {
        _maxSupply = maxSupply_;
        _mint(factory, maxSupply_);
    }

    function maxSupply() external view returns (uint256) {
        return _maxSupply;
    }
}
