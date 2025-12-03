// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint16, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ConfidentialZama} from "./ConfidentialZama.sol";

contract MinerNFT is ERC721, ZamaEthereumConfig {
    struct MinerState {
        bool miningActive;
        uint64 lastUpdate;
    }

    error MinerAlreadyClaimed();
    error MinerNotFound();
    error MinerAlreadyActive();
    error MinerNotActive();
    error MinerUnauthorized();
    error MinerNonTransferable();

    ConfidentialZama public immutable rewardToken;

    uint256 private _tokenIdTracker;
    mapping(uint256 => euint16) private _powers;
    mapping(uint256 => euint64) private _pendingRewards;
    mapping(uint256 => MinerState) private _states;
    mapping(address => uint256) private _assignedMiner;

    event MinerClaimed(address indexed account, uint256 indexed tokenId, euint16 power);
    event MiningStarted(uint256 indexed tokenId);
    event MiningStopped(uint256 indexed tokenId);
    event RewardsWithdrawn(uint256 indexed tokenId, euint64 amount);

    constructor(address rewardTokenAddress) ERC721("Confidential Miner", "cMINER") {
        rewardToken = ConfidentialZama(rewardTokenAddress);
    }

    function claimMiner() external returns (uint256 tokenId, euint16 power) {
        if (_assignedMiner[msg.sender] != 0) {
            revert MinerAlreadyClaimed();
        }

        tokenId = ++_tokenIdTracker;
        _safeMint(msg.sender, tokenId);

        uint64 currentTimestamp = uint64(block.timestamp);
        _states[tokenId] = MinerState(false, currentTimestamp);

        euint16 randomSample = FHE.randEuint16();
        euint16 bounded = FHE.rem(randomSample, 91);
        power = FHE.add(bounded, FHE.asEuint16(10));
        FHE.allowThis(power);
        FHE.allow(power, msg.sender);
        _powers[tokenId] = power;

        euint64 initialRewards = FHE.asEuint64(0);
        FHE.allowThis(initialRewards);
        FHE.allow(initialRewards, msg.sender);
        FHE.allow(initialRewards, address(rewardToken));
        _pendingRewards[tokenId] = initialRewards;

        emit MinerClaimed(msg.sender, tokenId, power);
    }

    function startMining() external {
        uint256 tokenId = _requireMiner(msg.sender);
        MinerState storage miner = _states[tokenId];
        if (miner.miningActive) {
            revert MinerAlreadyActive();
        }

        _updateRewards(tokenId);
        miner.miningActive = true;

        emit MiningStarted(tokenId);
    }

    function stopMining() external {
        uint256 tokenId = _requireMiner(msg.sender);
        MinerState storage miner = _states[tokenId];
        if (!miner.miningActive) {
            revert MinerNotActive();
        }

        _updateRewards(tokenId);
        miner.miningActive = false;

        emit MiningStopped(tokenId);
    }

    function withdrawRewards() external returns (euint64 mintedAmount) {
        uint256 tokenId = _requireMiner(msg.sender);
        if (ownerOf(tokenId) != msg.sender) {
            revert MinerUnauthorized();
        }

        _updateRewards(tokenId);

        euint64 rewards = _pendingRewards[tokenId];
        FHE.allow(rewards, address(rewardToken));

        mintedAmount = rewardToken.mintMinerReward(msg.sender, rewards);

        euint64 reset = FHE.asEuint64(0);
        FHE.allowThis(reset);
        FHE.allow(reset, msg.sender);
        FHE.allow(reset, address(rewardToken));
        _pendingRewards[tokenId] = reset;

        _states[tokenId].lastUpdate = uint64(block.timestamp);

        emit RewardsWithdrawn(tokenId, mintedAmount);
    }

    function minerIdOf(address account) external view returns (uint256) {
        return _assignedMiner[account];
    }

    function minerPower(uint256 tokenId) external view returns (euint16) {
        _requireOwned(tokenId);
        return _powers[tokenId];
    }

    function minerPendingRewards(uint256 tokenId) external view returns (euint64) {
        _requireOwned(tokenId);
        return _pendingRewards[tokenId];
    }

    function minerState(uint256 tokenId) external view returns (bool miningActive, uint64 lastUpdate) {
        _requireOwned(tokenId);
        MinerState memory state = _states[tokenId];
        return (state.miningActive, state.lastUpdate);
    }

    function getMinerSnapshot(uint256 tokenId)
        external
        view
        returns (euint16 power, euint64 pendingRewards, bool miningActive, uint64 lastUpdate)
    {
        _requireOwned(tokenId);
        MinerState memory state = _states[tokenId];
        return (_powers[tokenId], _pendingRewards[tokenId], state.miningActive, state.lastUpdate);
    }

    function totalMiners() external view returns (uint256) {
        return _tokenIdTracker;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert MinerNonTransferable();
        }

        address previousOwner = super._update(to, tokenId, auth);

        if (previousOwner != address(0) && to == address(0)) {
            _assignedMiner[previousOwner] = 0;
        }

        if (to != address(0)) {
            _assignedMiner[to] = tokenId;
        }

        return previousOwner;
    }

    function _requireMiner(address account) internal view returns (uint256 tokenId) {
        tokenId = _assignedMiner[account];
        if (tokenId == 0) {
            revert MinerNotFound();
        }
    }

    function _updateRewards(uint256 tokenId) internal {
        MinerState storage miner = _states[tokenId];
        uint64 currentTimestamp = uint64(block.timestamp);

        if (miner.lastUpdate == 0) {
            miner.lastUpdate = currentTimestamp;
            return;
        }

        if (!miner.miningActive) {
            miner.lastUpdate = currentTimestamp;
            return;
        }

        if (currentTimestamp <= miner.lastUpdate) {
            return;
        }

        uint64 elapsed = currentTimestamp - miner.lastUpdate;

        euint64 power64 = FHE.asEuint64(_powers[tokenId]);
        euint64 dailyYield = FHE.mul(power64, FHE.asEuint64(100));
        euint64 elapsedEncrypted = FHE.asEuint64(elapsed);
        euint64 rewardProduct = FHE.mul(dailyYield, elapsedEncrypted);
        euint64 incremental = FHE.div(rewardProduct, uint64(1 days));

        address ownerAddress = ownerOf(tokenId);

        FHE.allowThis(incremental);
        FHE.allow(incremental, ownerAddress);
        FHE.allow(incremental, address(rewardToken));

        euint64 accumulated = FHE.add(_pendingRewards[tokenId], incremental);
        FHE.allowThis(accumulated);
        FHE.allow(accumulated, ownerAddress);
        FHE.allow(accumulated, address(rewardToken));
        _pendingRewards[tokenId] = accumulated;

        miner.lastUpdate = currentTimestamp;
    }
}
