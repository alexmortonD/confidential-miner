# Confidential Miner

A fully privacy-preserving blockchain mining application that leverages Fully Homomorphic Encryption (FHE) to enable confidential computation on the Ethereum blockchain. Users can mint unique miner NFTs with hidden compute power, mine confidential tokens, and manage their rewards - all while keeping sensitive data encrypted on-chain.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Advantages](#advantages)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Smart Contracts](#smart-contracts)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [Frontend Application](#frontend-application)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Roadmap](#future-roadmap)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

Confidential Miner is a decentralized application (dApp) that combines blockchain technology with Fully Homomorphic Encryption (FHE) to create a privacy-first virtual mining ecosystem. Each user can claim a unique, non-transferable miner NFT with encrypted compute power ranging from 10 to 100. The miner generates confidential cZama tokens over time, with all balances and power metrics remaining encrypted on-chain and only decryptable by the owner.

This project demonstrates the practical implementation of FHE in blockchain applications, showcasing how sensitive data can remain private while still being used in smart contract computations.

## Key Features

### Privacy-Preserving Mining
- **Fully Encrypted Compute Power**: Each miner's power level (10-100) is generated using FHE random number generation and remains encrypted on-chain
- **Confidential Token Balances**: All cZama token balances are stored as encrypted values, ensuring complete financial privacy
- **Private Reward Accumulation**: Mining rewards accrue in an encrypted state and are only revealed to the rightful owner through client-side decryption

### Unique Miner NFTs
- **One Miner Per Wallet**: Each Ethereum address can claim exactly one miner NFT, ensuring fair distribution
- **Non-Transferable**: Miners are soulbound tokens that cannot be transferred, preventing market manipulation
- **Random Power Assignment**: Compute power is assigned randomly using FHE-based randomness, making it unpredictable and fair
- **ERC-721 Compliance**: Built on the standard NFT protocol while adding privacy features

### Flexible Mining Operations
- **Start/Stop Mining**: Users can activate or pause mining at any time
- **Real-Time Reward Calculation**: Rewards are calculated based on elapsed time and encrypted compute power
- **Withdraw Anytime**: Accumulated rewards can be withdrawn to the user's cZama balance whenever desired
- **State Tracking**: Mining status and last update timestamp are tracked for accurate reward distribution

### Confidential Token System
- **cZama Token**: A confidential fungible token implementing encrypted balances and transfers
- **Encrypted Minting**: Tokens are minted with encrypted amounts, maintaining privacy throughout the lifecycle
- **FHE Operations**: All arithmetic operations (addition, multiplication, division) are performed on encrypted data
- **Access Control**: Only authorized contracts (MinerNFT) can mint tokens through the MinerManager role

## Advantages

### 1. **Complete On-Chain Privacy**
Traditional blockchain applications expose all transaction details publicly. Confidential Miner uses FHE to keep sensitive information encrypted on-chain:
- Competitors cannot see your mining power
- Token balances remain completely private
- Reward amounts are hidden from observers
- Only the owner can decrypt and view their private data

### 2. **Trustless Computation**
Unlike zero-knowledge proofs or trusted execution environments:
- No trusted setup ceremony required
- No reliance on secure hardware
- All computations are verifiable on-chain
- Smart contracts operate directly on encrypted data

### 3. **Fair Distribution Mechanism**
The one-miner-per-wallet policy ensures:
- Equal opportunity for all participants
- Prevention of whale dominance
- Democratic access to mining rewards
- Sybil resistance through NFT claiming mechanism

### 4. **Non-Custodial Architecture**
Users maintain complete control:
- No central authority can freeze funds
- Private keys remain in user wallets
- Decentralized reward distribution
- Censorship-resistant operations

### 5. **Scalable Privacy Solution**
FHE provides advantages over other privacy technologies:
- No circuit constraints like ZK-proofs
- Unlimited computation complexity
- Composable privacy (encrypted data can be used across contracts)
- Future-proof as FHE technology advances

### 6. **Developer-Friendly**
Built with modern best practices:
- Clean, modular smart contract architecture
- Comprehensive TypeScript support
- React-based responsive UI
- Extensive documentation and examples
- Hardhat development environment with full tooling support

## Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.27**: Smart contract development language
- **FHEVM (Zama)**: Fully Homomorphic Encryption virtual machine enabling encrypted computation
  - `@fhevm/solidity ^0.8.0`: Core FHE libraries for Solidity
  - `@zama-fhe/oracle-solidity ^0.1.0`: Decryption oracle for secure off-chain decryption
  - `new-confidential-contracts ^0.1.1`: Confidential token standards
- **OpenZeppelin Contracts**: Battle-tested libraries for ERC-721 NFTs and access control
- **Hardhat ^2.26.0**: Ethereum development environment
  - `@fhevm/hardhat-plugin ^0.1.0`: FHE integration plugin
  - `hardhat-deploy ^0.11.45`: Deployment framework
  - `hardhat-gas-reporter ^2.3.0`: Gas usage analysis

### Frontend
- **React ^19.1.1**: Modern UI framework
- **TypeScript ^5.8.3**: Type-safe JavaScript development
- **Vite ^7.1.6**: Lightning-fast build tool and dev server
- **Wagmi ^2.17.0**: React hooks for Ethereum
- **Viem ^2.37.6**: TypeScript Ethereum library
- **RainbowKit ^2.2.8**: Beautiful wallet connection UI
- **TanStack Query ^5.89.0**: Powerful data fetching and caching
- **Ethers.js ^6.15.0**: Ethereum library for contract interactions
- **@zama-fhe/relayer-sdk ^0.2.0**: Client-side FHE decryption SDK

### Development & Tooling
- **TypeChain ^8.3.2**: TypeScript bindings for smart contracts
- **Mocha ^11.7.1**: Test framework
- **Chai ^4.5.0**: Assertion library
- **ESLint ^8.57.1**: Code linting
- **Prettier ^3.6.2**: Code formatting
- **Solhint ^6.0.0**: Solidity linter
- **Solidity Coverage ^0.8.16**: Test coverage reporting

### Infrastructure
- **Ethereum Sepolia Testnet**: EVM-compatible test network with FHE support
- **Infura**: Ethereum node infrastructure provider
- **Hardhat Network**: Local development blockchain

## Architecture

### System Overview

The Confidential Miner system consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ RainbowKit   │  │ Wagmi/Viem   │  │ Zama SDK     │     │
│  │ Wallet UI    │  │ Web3 Hooks   │  │ FHE Decrypt  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Smart Contracts (Solidity)                 │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   MinerNFT.sol       │◄───│  ConfidentialZama    │      │
│  │   ERC-721 + FHE      │    │  (cZama Token)       │      │
│  │                      │    │  ERC-20 + FHE        │      │
│  │ • Claim Miner        │    │                      │      │
│  │ • Start/Stop Mining  │    │ • Encrypted Balances │      │
│  │ • Withdraw Rewards   │    │ • Minting Authority  │      │
│  │ • Encrypted Power    │    │ • FHE Operations     │      │
│  │ • Reward Calculation │    │                      │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FHEVM (Zama Protocol Layer)                    │
│  • Homomorphic Encryption Operations                       │
│  • Encrypted State Storage                                 │
│  • FHE Random Number Generation                            │
│  • Decryption Oracle (Off-chain)                           │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

#### MinerNFT Contract
The core contract managing miner lifecycle:
- **Minting Logic**: One non-transferable NFT per address
- **Power Generation**: FHE-based random power assignment (10-100)
- **Mining State Machine**: Active/paused state management
- **Reward Algorithm**: `rewards = power × 100 × (time_elapsed / 1_day)`
- **Encrypted Storage**: `euint16` for power, `euint64` for rewards

#### ConfidentialZama Contract
Confidential token implementation:
- **Encrypted Balances**: All balances stored as `euint64`
- **Minting Access Control**: Only MinerManager can mint
- **FHE Token Standard**: Based on `ConfidentialFungibleToken`
- **Permission System**: FHE.allow() for access control

### Data Flow

#### 1. Miner Claiming Flow
```
User → claimMiner() → Generate Random Power (FHE.randEuint16)
                    → Mint NFT (tokenId)
                    → Store encrypted power
                    → Initialize encrypted rewards (0)
                    → Emit MinerClaimed event
```

#### 2. Mining & Reward Accrual Flow
```
User → startMining() → Update state (miningActive = true)
                     → Record timestamp
                     ↓
[Time passes while mining is active]
                     ↓
Internal → _updateRewards() → Calculate elapsed time
                            → Compute: power × 100 × elapsed / 1_day
                            → Add to encrypted pending rewards (FHE.add)
                            → Update timestamp
```

#### 3. Reward Withdrawal Flow
```
User → withdrawRewards() → Calculate final rewards
                         → Mint cZama tokens (encrypted amount)
                         → Reset pending rewards to 0
                         → Update user's cZama balance
```

#### 4. Client-Side Decryption Flow
```
Frontend → Fetch encrypted handles (power, rewards, balance)
         → Generate keypair (local)
         → Create EIP-712 signature
         → Call Zama Relayer SDK
         → Decrypt values locally
         → Display in UI
```

## Problem Statement

### Current Blockchain Privacy Limitations

Traditional blockchain applications face several critical privacy challenges:

1. **Complete Transparency**: All on-chain data is publicly visible, exposing:
   - User balances and holdings
   - Transaction amounts and frequencies
   - Smart contract state and interactions
   - Strategic information to competitors

2. **Privacy-Performance Tradeoff**: Existing privacy solutions have limitations:
   - **Zero-Knowledge Proofs**: Complex circuit design, trusted setup requirements, limited computation
   - **Mixers/Tumblers**: Regulatory concerns, potential illicit use
   - **Off-Chain Computation**: Centralization risks, trust assumptions
   - **Layer 2 Privacy**: Fragmented liquidity, bridge vulnerabilities

3. **Application-Specific Issues**:
   - **Gaming**: Visible player stats and strategies reduce competitiveness
   - **DeFi**: Trading positions and strategies are front-runnable
   - **NFTs**: Ownership and rarity data are completely public
   - **Governance**: Voting choices are transparent, enabling coercion

4. **Regulatory Compliance vs Privacy**: Organizations need:
   - Confidential business logic
   - Private financial data
   - Selective disclosure capabilities
   - Audit trails without full transparency

### The Mining/Gaming Use Case Problem

In traditional blockchain-based mining or gaming applications:
- Player power levels are visible to all participants
- Rewards can be calculated and gamed by observers
- Whales can dominate through transparent advantage accumulation
- No fair discovery mechanism for random attributes
- Market manipulation through information asymmetry

## Solution

Confidential Miner addresses these challenges through **Fully Homomorphic Encryption (FHE)** on Ethereum:

### 1. **True On-Chain Privacy**
- All sensitive data (power, rewards, balances) encrypted at rest
- Computations performed directly on encrypted data
- Results remain encrypted until owner decrypts locally
- No information leakage through gas usage or event logs

### 2. **Fair Randomness**
- FHE-based random number generation (FHE.randEuint16)
- Unpredictable power assignment (10-100 range)
- Verifiable randomness without revealing the value
- Prevents gaming or prediction of outcomes

### 3. **Confidential Computation**
- Addition, multiplication, division on encrypted numbers
- Comparison operations without revealing values
- Complex business logic with complete privacy
- Composable encrypted operations across contracts

### 4. **User-Controlled Decryption**
- Only the owner can decrypt their private data
- Client-side decryption using Zama SDK
- EIP-712 signatures for authorization
- Time-bound decryption permissions

### 5. **Practical Implementation**
- Production-ready smart contracts on Sepolia testnet
- User-friendly React frontend with wallet integration
- Comprehensive developer tooling
- Real-world demonstration of FHE capabilities

### How It Works

**Step 1: Claim Miner**
```solidity
// Generate encrypted random power between 10-100
euint16 randomSample = FHE.randEuint16();
euint16 bounded = FHE.rem(randomSample, 91);
power = FHE.add(bounded, FHE.asEuint16(10));
// Power value is encrypted and only visible to owner
```

**Step 2: Mine Confidentially**
```solidity
// Calculate rewards on encrypted values
euint64 power64 = FHE.asEuint64(_powers[tokenId]);
euint64 dailyYield = FHE.mul(power64, FHE.asEuint64(100));
euint64 rewardProduct = FHE.mul(dailyYield, elapsedEncrypted);
euint64 incremental = FHE.div(rewardProduct, uint64(1 days));
// All operations preserve encryption
```

**Step 3: Decrypt Client-Side**
```typescript
// User authorizes decryption with signature
const signature = await signer.signTypedData(eip712.domain, types, message);
// Zama relayer returns decrypted values
const result = await instance.userDecrypt(handles, privateKey, publicKey, signature);
// Values displayed only to the user in their browser
```

## Smart Contracts

### MinerNFT.sol

**Purpose**: Manages the lifecycle of miner NFTs and reward distribution.

**Key Functions**:

- `claimMiner()`: Mints a new miner NFT with random encrypted power
  - Returns: `(tokenId, encryptedPower)`
  - Constraints: One per address, non-transferable
  - Emits: `MinerClaimed(address, tokenId, power)`

- `startMining()`: Activates mining for the caller's miner
  - Updates rewards before activation
  - Sets `miningActive = true`
  - Emits: `MiningStarted(tokenId)`

- `stopMining()`: Pauses mining activity
  - Updates rewards before pausing
  - Sets `miningActive = false`
  - Emits: `MiningStopped(tokenId)`

- `withdrawRewards()`: Claims accumulated rewards
  - Calculates final reward amount
  - Mints cZama tokens to user's balance
  - Resets pending rewards to 0
  - Returns: `encryptedMintedAmount`
  - Emits: `RewardsWithdrawn(tokenId, amount)`

**View Functions**:

- `minerIdOf(address)`: Returns the miner token ID for an address
- `minerPower(tokenId)`: Returns encrypted power value
- `minerPendingRewards(tokenId)`: Returns encrypted pending rewards
- `minerState(tokenId)`: Returns mining status and last update timestamp
- `getMinerSnapshot(tokenId)`: Returns all miner data in one call
- `totalMiners()`: Returns total number of miners claimed

**Internal Functions**:

- `_updateRewards(tokenId)`: Calculates and updates encrypted rewards
  - Formula: `(power × 100 × elapsed_seconds) / 86400`
  - Only accrues when mining is active
  - All operations performed on encrypted values

**Security Features**:

- Non-transferable NFTs (soulbound)
- One miner per address enforcement
- Owner-only operations
- FHE permission management with `FHE.allow()`

### ConfidentialZama.sol

**Purpose**: Confidential ERC-20 compatible token with encrypted balances.

**Inheritance**:
- `ConfidentialFungibleToken`: FHE-enabled token standard
- `SepoliaConfig`: Zama configuration for Sepolia testnet
- `Ownable`: Access control for administrative functions

**Key Functions**:

- `setMinerManager(address)`: Sets the authorized miner contract
  - Only callable by owner
  - Emits: `MinerManagerUpdated(address)`

- `mintMinerReward(address, euint64)`: Mints encrypted token amount
  - Only callable by MinerManager
  - Validates FHE permissions
  - Returns: `encryptedMintedAmount`

**View Functions**:

- `minerManager()`: Returns the current miner manager address
- `confidentialBalanceOf(address)`: Returns encrypted balance (inherited)
- `name()`: Returns "cZama" (inherited)
- `symbol()`: Returns "cZama" (inherited)

**Access Control**:

- Owner: Can set miner manager
- MinerManager: Can mint rewards
- FHE Permissions: Managed through `FHE.allow()`

### Contract Addresses (Sepolia Testnet)

Configuration located in: `frontend/src/config/contracts.ts`

- **MinerNFT**: `[Deployed Address]`
- **ConfidentialZama**: `[Deployed Address]`

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
  ```bash
  node --version  # Should be >= 20.0.0
  ```

- **npm**: Version 7.0.0 or higher (comes with Node.js)
  ```bash
  npm --version  # Should be >= 7.0.0
  ```

- **Git**: For cloning the repository
  ```bash
  git --version
  ```

- **MetaMask**: Browser extension for Ethereum wallet
  - Install from [metamask.io](https://metamask.io)
  - Create or import a wallet
  - Add Sepolia testnet to your networks

- **Sepolia ETH**: Test ETH for gas fees
  - Get free test ETH from [Sepolia Faucet](https://sepoliafaucet.com)
  - Or use [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/confidential-miner.git
   cd confidential-miner
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Configuration

#### 1. Set Up Environment Variables

**Backend (.env in root directory)**:

```bash
# Create .env file
touch .env

# Add the following variables:
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_API_KEY="your_infura_api_key"
ETHERSCAN_API_KEY="your_etherscan_api_key"  # Optional, for verification
```

**Using Hardhat Variables (Recommended for Security)**:

```bash
# Set mnemonic
npx hardhat vars set MNEMONIC

# Set Infura API key
npx hardhat vars set INFURA_API_KEY

# Optional: Set Etherscan API key for contract verification
npx hardhat vars set ETHERSCAN_API_KEY
```

**Frontend (.env in frontend directory)**:

```bash
cd frontend
touch .env

# Add the following:
VITE_MINER_CONTRACT_ADDRESS="0x..."
VITE_TOKEN_CONTRACT_ADDRESS="0x..."
VITE_WALLETCONNECT_PROJECT_ID="your_project_id"  # Get from WalletConnect Cloud
```

#### 2. Get API Keys

**Infura**:
- Sign up at [infura.io](https://infura.io)
- Create a new project
- Copy your API key

**Etherscan** (Optional):
- Sign up at [etherscan.io](https://etherscan.io)
- Go to API Keys section
- Generate a new API key

**WalletConnect** (For Frontend):
- Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
- Create a new project
- Copy your Project ID

### Local Development

#### 1. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeScript typings with TypeChain
- Create artifacts in the `artifacts/` directory

#### 2. Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage
```

#### 3. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# This will start a local FHE-enabled blockchain at http://localhost:8545
```

#### 4. Deploy to Local Network

```bash
# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost

# Note the deployed contract addresses
```

#### 5. Update Frontend Configuration

Edit `frontend/src/config/contracts.ts` with your deployed addresses:

```typescript
export const MINER_CONTRACT = {
  address: '0x...', // Your deployed MinerNFT address
  abi: MinerNFTABI,
};

export const TOKEN_CONTRACT = {
  address: '0x...', // Your deployed ConfidentialZama address
  abi: ConfidentialZamaABI,
};
```

#### 6. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Deployment

#### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH**

   ```bash
   # Check your balance
   npx hardhat accounts --network sepolia
   ```

2. **Deploy contracts**

   ```bash
   npm run deploy:sepolia
   # or
   npx hardhat deploy --network sepolia
   ```

3. **Verify contracts on Etherscan**

   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. **Update frontend configuration** with Sepolia contract addresses

5. **Build frontend for production**

   ```bash
   cd frontend
   npm run build
   ```

6. **Deploy frontend** to hosting service (Vercel, Netlify, etc.)

   ```bash
   # Example with Vercel
   npm install -g vercel
   vercel deploy
   ```

#### Custom Network Configuration

Edit `hardhat.config.ts` to add custom networks:

```typescript
networks: {
  customNetwork: {
    accounts: {
      mnemonic: MNEMONIC,
      path: "m/44'/60'/0'/0/",
      count: 10,
    },
    chainId: 12345,
    url: "https://your-rpc-url.com",
  },
}
```

## Frontend Application

### Overview

The frontend is a modern React application built with TypeScript, providing a seamless interface for interacting with the Confidential Miner protocol.

### Key Components

#### 1. **Header Component** (`src/components/Header.tsx`)
- RainbowKit wallet connection
- Network status display
- User account information
- Responsive navigation

#### 2. **MinerApp Component** (`src/components/MinerApp.tsx`)
The main application interface with sections for:

- **Claim Section**: Mint your first miner NFT
- **Overview Section**: Display encrypted stats (power, status, balance)
- **Mining Controls**: Start/stop mining operations
- **Rewards Section**: View and withdraw pending rewards
- **Upgrade Section**: Future power purchase functionality

### Custom Hooks

#### `useZamaInstance` (`src/hooks/useZamaInstance.ts`)
Initializes the Zama FHE SDK for client-side decryption:
- Creates FHE instance from contract configuration
- Manages loading and error states
- Provides decryption capabilities

#### `useEthersSigner` (`src/hooks/useEthersSigner.ts`)
Converts Viem client to Ethers signer:
- Enables compatibility with Ethers.js
- Used for contract write operations
- Maintains type safety with TypeScript

### State Management

- **Wagmi**: Blockchain state (account, contracts, read operations)
- **TanStack Query**: Data fetching and caching
- **React State**: UI state (decryption status, feedback, transaction progress)

### Decryption Flow

The application implements a sophisticated client-side decryption system:

1. **Fetch Encrypted Handles**: Read encrypted values from contracts
2. **Generate Keypair**: Create ephemeral encryption keys
3. **Sign EIP-712 Message**: Authorize decryption request
4. **Call Zama Relayer**: Submit decryption request to oracle
5. **Decrypt Locally**: Process encrypted responses in browser
6. **Display Values**: Show decrypted data to user only

This ensures:
- No plaintext values on-chain
- User-controlled privacy
- Zero knowledge to relayer
- Secure key management

### Styling

- Custom CSS with CSS variables
- Dark theme optimized for Web3
- Responsive design (mobile-first)
- Accessible UI components

### Environment Configuration

Frontend configuration is managed through:

1. **Vite Environment Variables** (`.env`)
2. **Contract Configuration** (`src/config/contracts.ts`)
3. **Wagmi Configuration** (`src/config/wagmi.ts`)

## Usage Guide

### 1. Connect Your Wallet

- Click "Connect Wallet" button in the header
- Select your preferred wallet (MetaMask, Coinbase, etc.)
- Approve the connection
- Ensure you're on Sepolia testnet

### 2. Claim Your Miner

- Click "Claim Miner" button
- Approve the transaction in your wallet
- Wait for confirmation (1-2 blocks)
- Your miner NFT will be minted with random encrypted power (10-100)

### 3. Start Mining

- After claiming, view your miner overview
- Your compute power will be decrypted and displayed (may take 10-20 seconds)
- Click "Start Mining" to begin reward accumulation
- Mining status will change to "Active"

### 4. Monitor Your Rewards

- Pending rewards update automatically as time passes
- Calculation: `power × 100 × days_elapsed`
- All values displayed are decrypted locally in your browser
- No one else can see your actual numbers

### 5. Withdraw Rewards

- Click "Withdraw Rewards" when you have pending rewards
- Approve the transaction
- Encrypted reward amount will be minted to your cZama balance
- Balance updates immediately after confirmation

### 6. Pause Mining

- Click "Pause Mining" to stop reward accumulation
- Useful if you want to accumulate rewards before withdrawing
- Can resume mining at any time

### 7. View Your Stats

The dashboard displays:
- **Compute Power**: Your miner's encrypted power level
- **Mining Status**: Active or Paused
- **cZama Balance**: Your total token balance (encrypted)
- **Pending Rewards**: Accumulated but not yet withdrawn
- **Last Update**: Timestamp of last mining update

## Testing

### Smart Contract Tests

Located in `test/` directory:

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/MinerNFT.ts

# Run tests with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

**Test Coverage Includes**:
- Miner claiming (one per address)
- Random power generation
- Mining state transitions
- Reward calculations
- Encrypted operations
- Access control
- Edge cases and error handling

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Integration Testing on Sepolia

```bash
# Test on live Sepolia testnet
npm run test:sepolia
```

### Manual Testing Checklist

- [ ] Wallet connection/disconnection
- [ ] Network switching
- [ ] Miner claiming
- [ ] Duplicate claim prevention
- [ ] Start/stop mining
- [ ] Reward accumulation over time
- [ ] Reward withdrawal
- [ ] Balance updates
- [ ] Decryption process
- [ ] Error handling
- [ ] Mobile responsiveness

## Project Structure

```
confidential-miner/
├── contracts/                  # Smart contract source code
│   ├── ConfidentialZama.sol   # Confidential token contract
│   └── MinerNFT.sol           # Miner NFT contract
│
├── deploy/                     # Deployment scripts
│   └── deploy.ts              # Hardhat-deploy script
│
├── test/                       # Smart contract tests
│   └── MinerNFT.ts            # Test suite
│
├── tasks/                      # Custom Hardhat tasks
│   ├── accounts.ts            # Account management
│   └── miner.ts               # Miner-specific tasks
│
├── types/                      # TypeScript type definitions
│   └── [generated]            # Auto-generated TypeChain types
│
├── frontend/                   # React frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.tsx
│   │   │   └── MinerApp.tsx
│   │   ├── config/            # Configuration files
│   │   │   ├── contracts.ts   # Contract ABIs and addresses
│   │   │   └── wagmi.ts       # Wagmi configuration
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useZamaInstance.ts
│   │   │   └── useEthersSigner.ts
│   │   ├── styles/            # CSS stylesheets
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # Entry point
│   │   └── vite-env.d.ts      # Vite types
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite configuration
│   └── package.json           # Frontend dependencies
│
├── artifacts/                  # Compiled contract artifacts
├── cache/                      # Hardhat cache
├── fhevmTemp/                  # FHE temporary files
│
├── hardhat.config.ts          # Hardhat configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── .env                       # Environment variables (gitignored)
├── .gitignore                 # Git ignore rules
├── LICENSE                    # BSD-3-Clause-Clear license
└── README.md                  # This file
```

### Important Files

- **`hardhat.config.ts`**: Network configuration, compiler settings, plugins
- **`frontend/src/config/contracts.ts`**: Contract addresses and ABIs
- **`frontend/src/config/wagmi.ts`**: Web3 provider configuration
- **`.env`**: Environment variables (never commit this file)

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2024)
- [ ] **Power Upgrade Marketplace**
  - Spend cZama tokens to increase compute power
  - Encrypted bidding system
  - Dynamic pricing based on demand

- [ ] **Mining Pools**
  - Collaborative mining with encrypted contributions
  - Fair reward distribution based on hidden stakes
  - Pool management dashboard

- [ ] **Referral System**
  - Invite friends to earn bonus power
  - Encrypted referral tracking
  - Tiered reward structure

### Phase 2: Advanced Features (Q3 2024)
- [ ] **Miner Specializations**
  - Different miner types (speed, efficiency, stability)
  - Rare miner variants with bonus multipliers
  - Specialization tree system

- [ ] **Encrypted Leaderboards**
  - Rank miners without revealing exact stats
  - Zero-knowledge proof of ranking
  - Seasonal competitions with rewards

- [ ] **Governance**
  - cZama token voting for protocol changes
  - Encrypted ballot system
  - Proposal creation and discussion

- [ ] **Cross-Chain Bridge**
  - Bridge cZama to other FHE-enabled chains
  - Maintain encryption across chains
  - Unified balance view

### Phase 3: Ecosystem Expansion (Q4 2024)
- [ ] **Miner Marketplace**
  - Secondary market for miner NFTs (if transferability is added)
  - Encrypted auction system
  - Price discovery mechanism

- [ ] **DeFi Integration**
  - Stake cZama for boosted mining
  - Liquidity pools with encrypted reserves
  - Lending/borrowing with confidential collateral

- [ ] **Mobile Application**
  - Native iOS and Android apps
  - Push notifications for mining events
  - Simplified wallet management

- [ ] **Analytics Dashboard**
  - Historical mining performance
  - Encrypted chart visualizations
  - Personalized insights and recommendations

### Phase 4: Mainnet & Beyond (2025)
- [ ] **Mainnet Deployment**
  - Full security audits
  - Bug bounty program
  - Gradual migration from testnet

- [ ] **Developer SDK**
  - npm package for confidential mining integration
  - React component library
  - Documentation and tutorials

- [ ] **Enterprise Features**
  - White-label solutions
  - Custom token integration
  - Advanced analytics and reporting

- [ ] **Research Initiatives**
  - Novel FHE applications
  - Performance optimization
  - Academic partnerships

### Community Requests
We actively listen to community feedback. Submit feature requests via:
- GitHub Issues
- Discord community channel
- Governance proposals (coming soon)

## Security Considerations

### Smart Contract Security

1. **Audits**: Contracts have not yet been professionally audited. **DO NOT USE IN PRODUCTION**.

2. **Known Limitations**:
   - Reward calculation precision limited by integer arithmetic
   - Gas costs for FHE operations are higher than standard operations
   - Decryption reliance on Zama oracle availability

3. **Best Practices Implemented**:
   - OpenZeppelin libraries for standard functionality
   - Access control on sensitive functions
   - Reentrancy protection (inherited from OpenZeppelin)
   - Input validation and bounds checking
   - Event emission for all state changes

### FHE-Specific Security

1. **Encryption Guarantees**:
   - Data encrypted at rest on-chain
   - Operations maintain encryption throughout
   - Only authorized addresses can decrypt

2. **Decryption Security**:
   - Client-side key generation
   - EIP-712 signature verification
   - Time-bound decryption permissions
   - No plaintext exposure to relayer

3. **Potential Attack Vectors**:
   - **Timing attacks**: Gas usage might leak information
   - **Relay attacks**: Signature replay prevention needed
   - **Oracle downtime**: Decryption unavailable if relayer offline

### Frontend Security

1. **Private Key Management**:
   - Never expose private keys
   - Use hardware wallets when possible
   - Verify contract addresses before interactions

2. **Transaction Safety**:
   - Always verify transaction details
   - Check network and gas settings
   - Use reputable RPC providers

3. **Dependency Security**:
   - Regular dependency updates
   - npm audit checks
   - No known critical vulnerabilities

### User Recommendations

- **Test First**: Use testnet before any real funds
- **Verify Contracts**: Check deployed addresses match official documentation
- **Secure Wallet**: Use hardware wallet or secure seed phrase storage
- **Monitor Activity**: Review transaction history regularly
- **Report Issues**: Immediately report any suspicious behavior

### Bug Bounty

**Coming Soon**: We plan to launch a bug bounty program with rewards for:
- Critical smart contract vulnerabilities
- FHE implementation flaws
- Frontend security issues
- Decryption privacy leaks

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or spreading the word, every contribution matters.

### How to Contribute

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/confidential-miner.git
   cd confidential-miner
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**

   - Write clean, documented code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**

   ```bash
   npm run compile
   npm test
   npm run lint
   ```

5. **Commit with clear messages**

   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

   - Describe your changes in detail
   - Reference any related issues
   - Ensure CI checks pass

### Development Guidelines

**Code Style**:
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write self-documenting code with comments for complex logic
- Use descriptive variable and function names

**Testing**:
- Write unit tests for all new functions
- Ensure >80% code coverage
- Test edge cases and error conditions
- Include integration tests where applicable

**Documentation**:
- Update README.md for new features
- Add inline comments for complex code
- Create examples for new functionality
- Keep documentation in sync with code

**Commit Messages**:
- Use conventional commits format
- Examples: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Keep first line under 50 characters
- Add detailed description if needed

### Areas for Contribution

- **Smart Contracts**: Gas optimization, new features
- **Frontend**: UI/UX improvements, accessibility
- **Testing**: Additional test coverage, fuzzing
- **Documentation**: Tutorials, guides, translations
- **Examples**: Integration examples, use cases
- **Tooling**: Developer tools, scripts, automation

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No patent grant
- ❌ No trademark use
- ⚠️ Liability and warranty disclaimers apply

See the [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

This project incorporates code from:

- **OpenZeppelin Contracts**: MIT License
- **Zama FHEVM**: BSD-3-Clause-Clear License
- **Hardhat**: MIT License
- **React**: MIT License

See respective package directories for individual license files.

## Support

### Documentation

- **FHEVM Documentation**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Documentation**: [hardhat.org/docs](https://hardhat.org/docs)
- **Wagmi Documentation**: [wagmi.sh](https://wagmi.sh)
- **Viem Documentation**: [viem.sh](https://viem.sh)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/confidential-miner/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/yourusername/confidential-miner/discussions)
- **Discord**: [Join our community](https://discord.gg/your-invite)
- **Twitter**: [@YourProject](https://twitter.com/yourproject)

### Getting Help

**For bugs and issues**:
1. Check existing GitHub issues
2. Provide detailed reproduction steps
3. Include error messages and logs
4. Specify your environment (Node version, OS, etc.)

**For questions**:
1. Search documentation first
2. Check GitHub Discussions
3. Ask in Discord community channel
4. Stack Overflow with tags: `fhevm`, `zama`, `ethereum`

**For security issues**:
- **DO NOT** open public issues
- Email security@yourproject.com
- Use PGP key for sensitive reports (if available)

### Contact

- **Email**: support@yourproject.com
- **Website**: [yourproject.com](https://yourproject.com)
- **Documentation**: [docs.yourproject.com](https://docs.yourproject.com)

---

## Acknowledgments

This project is built on the shoulders of giants:

- **Zama** for pioneering FHEVM technology and making blockchain privacy practical
- **OpenZeppelin** for secure, audited smart contract libraries
- **Hardhat** team for excellent Ethereum development tooling
- **Wagmi** and **Viem** teams for modern Web3 React development
- **RainbowKit** for beautiful wallet connection UX
- The broader **Ethereum community** for continuous innovation

Special thanks to all contributors and community members who have helped shape this project.

---

**Built with privacy-first principles and powered by Fully Homomorphic Encryption**

**Start mining confidentially today!** 🚀🔒
