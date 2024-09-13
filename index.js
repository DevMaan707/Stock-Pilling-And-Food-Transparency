require('dotenv').config();
const express = require('express');
const { ethers } = require('hardhat');
const app = express();
app.use(express.json());

let userManagement, supplyChainManagement, inventoryManagement, disputeResolution, complianceAndReporting, consumerTransparency;


async function initializeContracts() {
    userManagement = await ethers.getContractAt("UserManagement", process.env.USER_MANAGEMENT_ADDRESS);
    supplyChainManagement = await ethers.getContractAt("SupplyChainManagement", process.env.SUPPLY_CHAIN_MANAGEMENT_ADDRESS);
    inventoryManagement = await ethers.getContractAt("InventoryManagement", process.env.INVENTORY_MANAGEMENT_ADDRESS);
    disputeResolution = await ethers.getContractAt("DisputeResolution", process.env.DISPUTE_RESOLUTION_ADDRESS);
    complianceAndReporting = await ethers.getContractAt("ComplianceAndReporting", process.env.COMPLIANCE_AND_REPORTING_ADDRESS);
    consumerTransparency = await ethers.getContractAt("ConsumerTransparency", process.env.CONSUMER_TRANSPARENCY_ADDRESS);
}

initializeContracts().catch((error) => {
    console.error("Error initializing contracts:", error);
});

app.post('/register', async (req, res) => {
    const { username, role } = req.body;
    try {
        const tx = await userManagement.registerUser(username, role);
        await tx.wait();
        res.send(`User ${username} registered successfully`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Supply Chain Management Routes
app.post('/record-shipment', async (req, res) => {
    const { productId, destination, quantity, farmerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.recordShipment(productId, destination, quantity, farmerPrice);
        await tx.wait();
        res.send(`Shipment recorded for product ID ${productId}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/update-shipment', async (req, res) => {
    const { productId, newStatus, retailerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.updateShipmentStatusAndRetailerPrice(productId, newStatus, retailerPrice);
        await tx.wait();
        res.send(`Shipment for product ID ${productId} updated successfully`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Inventory Management Routes
app.post('/update-inventory', async (req, res) => {
    const { productId, quantity, price } = req.body;
    try {
        const tx = await inventoryManagement.updateInventory(productId, quantity, price);
        await tx.wait();
        res.send(`Inventory updated for product ID ${productId}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/inventory/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const inventory = await inventoryManagement.getInventory(productId);
        res.json(inventory);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Dispute Resolution Routes
app.post('/initiate-dispute', async (req, res) => {
    const { productId, issue, details, evidenceHash } = req.body;
    try {
        const tx = await disputeResolution.initiateDispute(productId, issue, details, evidenceHash);
        await tx.wait();
        res.send(`Dispute initiated for product ID ${productId}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/resolve-dispute', async (req, res) => {
    const { disputeId, resolution } = req.body;
    try {
        const tx = await disputeResolution.resolveDispute(disputeId, resolution);
        await tx.wait();
        res.send(`Dispute ${disputeId} resolved successfully`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Compliance and Reporting Routes
app.get('/compliance-report/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const report = await complianceAndReporting.generateComplianceReport(productId);
        res.send(`Compliance Report for product ID ${productId}: ${report}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Consumer Transparency Routes
app.get('/provenance/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const provenance = await consumerTransparency.getProvenance(productId);
        res.json(provenance);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/quality-checks/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const qualityChecks = await consumerTransparency.getQualityChecks(productId);
        res.json(qualityChecks);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
