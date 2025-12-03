// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ERC7984} from "confidential-contracts-v91/contracts/token/ERC7984/ERC7984.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialZama is ERC7984, ZamaEthereumConfig, Ownable {
    address private _minerManager;

    event MinerManagerUpdated(address indexed newManager);

    constructor() ERC7984("cZama", "cZama", "") Ownable(msg.sender) {}

    function minerManager() external view returns (address) {
        return _minerManager;
    }

    function setMinerManager(address newManager) external onlyOwner {
        _minerManager = newManager;
        emit MinerManagerUpdated(newManager);
    }

    function mintMinerReward(address account, euint64 amount) external returns (euint64 mintedAmount) {
        if (msg.sender != _minerManager) {
            revert("Unauthorized miner manager");
        }
        require(account != address(0), "Invalid receiver");

        require(FHE.isAllowed(amount, address(this)), "Token not allowed");

        mintedAmount = _mint(account, amount);
    }
}
