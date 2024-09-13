# Stockpiling and Supply Chain Management Smart Contracts

## Overview

This project includes a set of smart contracts designed to manage the supply chain of agricultural products. The contracts enable seamless interactions between farmers, distributors, retailers, consumers, and regulators. The primary goal is to ensure transparency, traceability, and efficiency in the supply chain while preventing issues such as hoarding.

### Contracts Overview

1. **UserManagement Contract**: Handles user registration and role assignment.
2. **SupplyChainManagement Contract**: Manages product shipments, tracking shipment status and prices at different stages.
3. **InventoryManagement Contract**: Manages the inventory of products, tracking quantity and price changes over time.
4. **DisputeResolution Contract**: Manages disputes between different parties in the supply chain.
5. **ConsumerTransparency Contract**: Provides consumers with detailed provenance and quality check information.
6. **ComplianceAndReporting Contract**: Generates compliance reports and audits transaction history.

---

## 1. UserManagement Contract

### Purpose
The `UserManagement` contract is responsible for registering users and assigning them specific roles within the supply chain. Roles include Farmer, Distributor, Retailer, Consumer, and Regulator.

### Key Functions

- **registerUser(string memory username, Role role)**:
  - Registers a new user with a username and role.
  - **Expected Request**: `{ "username": "JohnDoe", "role": "Farmer" }`
  - **Expected Response**: Emits `UserRegistered` event.

- **updateUserProfile(string memory newUsername, Role newRole)**:
  - Allows users to update their username and role.
  - **Expected Request**: `{ "newUsername": "JohnDoe2", "newRole": "Distributor" }`
  - **Expected Response**: Emits `UserProfileUpdated` event.

- **getUser(address userAddress)**:
  - Retrieves the user profile based on the address.
  - **Expected Request**: `{ "userAddress": "0x123..." }`
  - **Expected Response**: Returns `{ "username": "JohnDoe", "role": "Farmer" }`

---

## 2. SupplyChainManagement Contract

### Purpose
The `SupplyChainManagement` contract manages the movement of products along the supply chain, from farmer to retailer. It tracks the status of shipments and allows the setting of prices at each stage.

### Key Functions

- **recordShipment(string memory productId, address destination, uint256 quantity, uint256 farmerPrice)**:
  - Records a new shipment initiated by a farmer.
  - **Expected Request**: `{ "productId": "Wheat", "destination": "0x456...", "quantity": 1000, "farmerPrice": 50 }`
  - **Expected Response**: Emits `ShipmentRecorded` event.

- **updateShipmentStatusAndRetailerPrice(string memory productId, ShipmentStatus newStatus, uint256 retailerPrice)**:
  - Updates the shipment status and sets the retailer price.
  - **Expected Request**: `{ "productId": "Wheat", "newStatus": "Delivered", "retailerPrice": 60 }`
  - **Expected Response**: Emits `ShipmentRecorded` event.

- **verifyShipment(string memory productId)**:
  - Verifies the quality of the shipment.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Emits `ShipmentVerified` event.

- **getProductPrice(string memory productId)**:
  - Retrieves the prices set by the farmer and retailer for the product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns `{ "farmerPrice": 50, "retailerPrice": 60 }`

- **getShipmentHistory(string memory productId)**:
  - Retrieves the shipment history for a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns an array of shipment records.

---

## 3. InventoryManagement Contract

### Purpose
The `InventoryManagement` contract tracks the inventory of products held by distributors and retailers, including quantity and price changes over time.

### Key Functions

- **updateInventory(string memory productId, uint256 quantity, uint256 price)**:
  - Updates the inventory with the current quantity and price.
  - **Expected Request**: `{ "productId": "Wheat", "quantity": 500, "price": 55 }`
  - **Expected Response**: Emits `InventoryUpdated` event.

- **getInventory(string memory productId)**:
  - Retrieves the current inventory for a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns `{ "productId": "Wheat", "quantity": 500, "price": 55 }`

- **getInventoryHistory(string memory productId)**:
  - Retrieves the history of inventory changes for a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns arrays of quantities, prices, and timestamps.

---

## 4. DisputeResolution Contract

### Purpose
The `DisputeResolution` contract allows parties in the supply chain to initiate and resolve disputes.

### Key Functions

- **initiateDispute(string memory productId, string memory issue, string memory details, bytes32 evidenceHash)**:
  - Initiates a dispute with details and optional evidence.
  - **Expected Request**: `{ "productId": "Wheat", "issue": "Quality issue", "details": "Mold found in shipment", "evidenceHash": "0xabc..." }`
  - **Expected Response**: Emits `DisputeInitiated` event.

- **resolveDispute(uint256 disputeId, string memory resolution)**:
  - Resolves a dispute with a given resolution.
  - **Expected Request**: `{ "disputeId": 1, "resolution": "Refund issued" }`
  - **Expected Response**: Emits `DisputeResolved` event.

- **getDispute(uint256 disputeId)**:
  - Retrieves the details of a specific dispute.
  - **Expected Request**: `{ "disputeId": 1 }`
  - **Expected Response**: Returns the dispute details.

---

## 5. ConsumerTransparency Contract

### Purpose
The `ConsumerTransparency` contract provides consumers with detailed information about the provenance and quality of products.

### Key Functions

- **getProvenance(string memory productId)**:
  - Retrieves the shipment history (provenance) of a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns an array of shipment records.

- **getQualityChecks(string memory productId)**:
  - Retrieves the quality checks performed on a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns an array of quality check records.

- **getCertifications(string memory productId)**:
  - Retrieves any certifications associated with the product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns a string of certifications.

---

## 6. ComplianceAndReporting Contract

### Purpose
The `ComplianceAndReporting` contract generates compliance reports and audits transaction history to ensure regulatory adherence.

### Key Functions

- **generateComplianceReport(string memory productId)**:
  - Generates a detailed compliance report for a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns a string containing the compliance report.

- **auditTransactionHistory(string memory productId)**:
  - Audits the transaction history for a product.
  - **Expected Request**: `{ "productId": "Wheat" }`
  - **Expected Response**: Returns an array of shipment records.

---

## Workflow Example

### 1. **Farmer Yields Produce**
   - The farmer registers as a user with the `UserManagement` contract.
   - The farmer records the harvested product using the `recordShipment` function in the `SupplyChainManagement` contract.

### 2. **Farmer Updates Inventory**
   - The farmer updates the inventory with the harvested product using the `updateInventory` function in the `InventoryManagement` contract.

### 3. **Retailer Buys Produce**
   - The retailer updates the shipment status and sets the retailer price using the `updateShipmentStatusAndRetailerPrice` function in the `SupplyChainManagement` contract.
   - The retailer updates their inventory using the `updateInventory` function in the `InventoryManagement` contract.

### 4. **Consumer Verifies Product**
   - The consumer checks the product's provenance using the `getProvenance` function in the `ConsumerTransparency` contract.
   - The consumer reviews the quality checks using the `getQualityChecks` function in the `ConsumerTransparency` contract.

### 5. **Dispute Resolution**
   - If there is an issue, the consumer or retailer can initiate a dispute using the `initiateDispute` function in the `DisputeResolution` contract.
   - The dispute is resolved using the `resolveDispute` function.

### 6. **Regulator Generates Compliance Report**
   - The regulator generates a compliance report using the `generateComplianceReport` function in the `ComplianceAndReporting` contract.
   - The transaction history is audited using the `auditTransactionHistory` function.

---

This document provides an overview of the smart contracts used in the stockpiling and supply chain management system. The contracts aim to create a transparent and efficient system that benefits all stakeholders involved.
---

# Example Workflow: From Farmer to Consumer

## 1. Farmer Yields Produce
- **Action**: The farmer harvests their produce (e.g., wheat) and decides to add it to the supply chain.
- **Smart Contract Interaction**:
  - The farmer registers as a user in the `UserManagement` contract if not already registered.
  - The farmer records the harvested product using the `recordShipment` function in the `SupplyChainManagement` contract.
  - The farmer updates their inventory using the `updateInventory` function in the `InventoryManagement` contract.
- **Expected Flow**:
  - The farmer enters details like product ID, quantity, and price in the app.
  - The `recordShipment` function logs the shipment, setting the status to `Created` and assigns a farmer price.
  - The `updateInventory` function adds the product to the farmer's inventory.

## 2. Retailer Buys Produce
- **Action**: A retailer decides to purchase the produce from the farmer.
- **Smart Contract Interaction**:
  - The retailer updates the shipment status and sets the retailer price using the `updateShipmentStatusAndRetailerPrice` function in the `SupplyChainManagement` contract.
  - The retailer updates their inventory using the `updateInventory` function in the `InventoryManagement` contract.
- **Expected Flow**:
  - The retailer accepts the shipment and sets the new price.
  - The `updateShipmentStatusAndRetailerPrice` function updates the shipment status to `Delivered` and logs the retailer price.
  - The product is automatically added to the retailer's inventory using the `updateInventory` function.

## 3. Distributor Moves Produce
- **Action**: The retailer or distributor ships the product to various locations or stores.
- **Smart Contract Interaction**:
  - The distributor records the shipment using the `recordShipment` function in the `SupplyChainManagement` contract.
  - The distributor updates the inventory using the `updateInventory` function in the `InventoryManagement` contract.
- **Expected Flow**:
  - The shipment is recorded with the status `InTransit`.
  - The distributor's inventory is updated to reflect the movement of stock.

## 4. Consumer Verifies Product
- **Action**: The consumer purchases the product and wants to verify its provenance and quality.
- **Smart Contract Interaction**:
  - The consumer checks the product's provenance using the `getProvenance` function in the `ConsumerTransparency` contract.
  - The consumer reviews the quality checks using the `getQualityChecks` function in the `ConsumerTransparency` contract.
- **Expected Flow**:
  - The consumer enters the product ID in the app to retrieve the provenance.
  - The `getProvenance` function provides the entire shipment history.
  - The `getQualityChecks` function returns records of all quality checks the product has passed.

## 5. Dispute Resolution
- **Action**: If there is an issue with the product (e.g., quality issues), the consumer or retailer initiates a dispute.
- **Smart Contract Interaction**:
  - The consumer or retailer initiates a dispute using the `initiateDispute` function in the `DisputeResolution` contract.
  - The dispute is resolved using the `resolveDispute` function.
- **Expected Flow**:
  - The party with the issue submits the dispute details, including any evidence.
  - The `initiateDispute` function logs the dispute.
  - Once resolved, the `resolveDispute` function updates the dispute status and logs the resolution.

## 6. Regulator Generates Compliance Report
- **Action**: The regulator generates a compliance report to ensure everything is in line with the regulations.
- **Smart Contract Interaction**:
  - The regulator generates a compliance report using the `generateComplianceReport` function in the `ComplianceAndReporting` contract.
  - The transaction history is audited using the `auditTransactionHistory` function.
- **Expected Flow**:
  - The regulator requests a compliance report for a specific product.
  - The `generateComplianceReport` function compiles and returns a detailed report of all relevant activities.
  - The regulator can audit the entire transaction history using the `auditTransactionHistory` function.

