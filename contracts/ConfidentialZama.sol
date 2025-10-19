// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ConfidentialFungibleToken} from "new-confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialZama is ConfidentialFungibleToken, SepoliaConfig, Ownable {
    address private _minerManager;

    event MinerManagerUpdated(address indexed newManager);

    constructor() ConfidentialFungibleToken("cZama", "cZama", "") Ownable(msg.sender) {}

    function minerManager() external view returns (address) {
        return _minerManager;
    }

    function setMinerManager(address newManager) external onlyOwner {
        _minerManager = newManager;
        emit MinerManagerUpdated(newManager);
    }

    function mintMinerReward(address account, euint64 amount) external returns (euint64 mintedAmount) {
        if (msg.sender != _minerManager) {
            revert ConfidentialFungibleTokenUnauthorizedCaller(msg.sender);
        }
        require(account != address(0), "Invalid receiver");

        require(FHE.isAllowed(amount, address(this)), "Token not allowed");

        mintedAmount = _mint(account, amount);
    }
}
