# Blockchain-Based Stockpiling and Food Transparency System

## Overview

This project is a blockchain-based platform designed to enhance transparency, prevent unethical practices such as stockpiling, and ensure food safety throughout the food supply chain. By leveraging Ethereum's blockchain, the platform records every transaction and movement of food products in a secure, immutable, and decentralized ledger. This system empowers consumers with detailed provenance information about the food they consume, ensures fair distribution, and simplifies regulatory compliance.

## Features

### 1. Supply Chain Transparency
- **Description**: Every transaction and movement of food products through the supply chain is recorded on the blockchain, ensuring a tamper-proof and transparent record that is accessible to all stakeholders.

### 2. Inventory Management
- **Description**: Real-time monitoring and updating of inventory levels across the supply chain. The system enforces anti-hoarding rules through smart contracts to prevent unethical stockpiling and ensure fair distribution.

### 3. Food Safety and Quality Assurance
- **Description**: Automated recording of food quality checks at various points in the supply chain, ensuring that only safe and high-quality food reaches consumers. The blockchain allows for rapid and precise recalls if necessary.

### 4. Consumer Transparency
- **Description**: Consumers can trace the origin, journey, and certification of their food by scanning a QR code, which provides detailed provenance information stored on the blockchain.

### 5. Dispute Resolution
- **Description**: Smart contracts facilitate the automatic resolution of disputes between supply chain participants, ensuring fairness and reducing conflicts.

### 6. Compliance and Reporting
- **Description**: The platform generates compliance reports and provides a transparent audit trail for regulators, ensuring that all food safety standards are met.

## Smart Contracts

### 1. `UserManagement.sol`
- **Purpose**: Manages user registration and roles.
- **Functions**:
  - `registerUser(string memory username, Role role)`
  - `getUser(address userAddress)`

### 2. `SupplyChainManagement.sol`
- **Purpose**: Records and manages shipments and updates their status.
- **Functions**:
  - `recordShipment(string memory productId, address destination, ShipmentStatus status)`
  - `getShipmentHistory(string memory productId)`
  - `updateShipmentStatus(string memory productId, ShipmentStatus newStatus)`

### 3. `InventoryManagement.sol`
- **Purpose**: Tracks inventory levels and updates.
- **Functions**:
  - `updateInventory(string memory productId, uint256 quantity)`
  - `getInventory(string memory productId)`

### 4. `DisputeResolution.sol`
- **Purpose**: Handles disputes between supply chain participants.
- **Functions**:
  - `initiateDispute(string memory productId, string memory issue, string memory details)`
  - `resolveDispute(uint256 disputeId, string memory resolution)`
  - `getDispute(uint256 disputeId)`

### 5. `ComplianceAndReporting.sol`
- **Purpose**: Generates compliance reports and audits transactions.
- **Functions**:
  - `generateComplianceReport(string memory productId)`
  - `auditTransactionHistory(string memory productId)`

### 6. `ConsumerTransparency.sol`
- **Purpose**: Provides consumers with provenance and quality check information.
- **Functions**:
  - `getProvenance(string memory productId)`
  - `getQualityChecks(string memory productId)`

## Technology Stack

- **Blockchain Platform**: Ethereum (Goerli Testnet)
- **Smart Contracts**: Solidity
- **Development Environment**: Hardhat
- **Backend**: Node.js with Express
- **Frontend**: React.js or Angular
- **Deployment**: Deployed on the Goerli Testnet

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/stock-pilling.git
   cd stock-pilling
2. **Install dependencies**:
   ```bash
   npm i
   ```
3. **Compile smart contracts**:
   ```bash
    npx hardhat compile
   ```
4. **Deploy snart contracts to Goerli testnet**:
   ```bash
    npx hardhat run scripts/deploy.js --network goerli
   ```

   **Make sure you have set your own envs**
