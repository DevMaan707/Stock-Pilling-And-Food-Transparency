require('dotenv').config();
const express = require('express');
const { ethers } = require('hardhat');
const app = express();
app.use(express.json());

let userManagement, supplyChainManagement, inventoryManagement, disputeResolution, complianceAndReporting, consumerTransparency;


async function initializeContracts() {
    const [deployer] = await ethers.getSigners();


    const UserManagement = await ethers.getContractFactory("UserManagement");
    userManagement = await UserManagement.deploy();
    await userManagement.deployed();


    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address);
    await supplyChainManagement.deployed();


    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    inventoryManagement = await InventoryManagement.deploy(userManagement.address);
    await inventoryManagement.deployed();


    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.deployed();


    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address);
    await complianceAndReporting.deployed();


    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address);
    await consumerTransparency.deployed();
}


initializeContracts();


app.post('/register', async (req, res) => {
    const { username, role } = req.body;
    try {
        await userManagement.registerUser(username, role);
        res.send(`User ${username} registered successfully`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


app.post('/record-shipment', async (req, res) => {
    const { productId, destination, status } = req.body;
    try {
        await supplyChainManagement.recordShipment(productId, destination, status);
        res.send(`Shipment recorded for product ID ${productId}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/compliance-report/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const report = await complianceAndReporting.generateComplianceReport(productId);
        res.send(`Compliance Report for product ID ${productId}: ${report}`);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

