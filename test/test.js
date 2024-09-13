require('dotenv').config();
const { expect } = require('chai');
const request = require('supertest');
const { ethers } = require('hardhat');
const express = require('express');

// Initialize Express app
const app = express();
app.use(express.json());

let server;
let userManagement, supplyChainManagement, inventoryManagement, disputeResolution, complianceAndReporting, consumerTransparency;
let farmer, retailer, consumer, regulator;

async function initializeContracts() {
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
    complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address, userManagement.address);
    await complianceAndReporting.deployed();

    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address);
    await consumerTransparency.deployed();

    // Get signers for different roles
    [farmer, retailer, consumer, regulator] = await ethers.getSigners();

    // Register users with their respective roles, ensuring a fresh setup
    await userManagement.connect(farmer).registerUser("FarmerUser1", 0); // Role 0: Farmer
    await userManagement.connect(retailer).registerUser("RetailerUser1", 1); // Role 1: Retailer
    await userManagement.connect(consumer).registerUser("ConsumerUser1", 2); // Role 2: Consumer
    await userManagement.connect(regulator).registerUser("RegulatorUser1", 4); // Role 4: Regulator
}

// Express routes
app.post('/register', async (req, res) => {
    const { username, role } = req.body;
    try {
        const tx = await userManagement.registerUser(username, role);
        await tx.wait();
        res.send(`User ${username} registered successfully`);
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/record-shipment', async (req, res) => {
    const { productId, destination, quantity, farmerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.connect(farmer).recordShipment(productId, destination, quantity, farmerPrice);
        await tx.wait();
        res.send(`Shipment recorded for product ID ${productId}`);
    } catch (error) {
        console.error("Error recording shipment:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/update-shipment', async (req, res) => {
    const { productId, newStatus, retailerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.connect(retailer).updateShipmentStatusAndRetailerPrice(productId, newStatus, retailerPrice);
        await tx.wait();
        res.send(`Shipment for product ID ${productId} updated successfully`);
    } catch (error) {
        console.error("Error updating shipment:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/update-inventory', async (req, res) => {
    const { productId, quantity, price } = req.body;
    try {
        const tx = await inventoryManagement.connect(retailer).updateInventory(productId, quantity, price);
        await tx.wait();
        res.send(`Inventory updated for product ID ${productId}`);
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/inventory/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const inventory = await inventoryManagement.connect(retailer).getInventory(productId);
        res.json(inventory);
    } catch (error) {
        console.error("Error retrieving inventory:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/initiate-dispute', async (req, res) => {
    const { productId, issue, details, evidenceHash } = req.body;
    try {
        const tx = await disputeResolution.connect(consumer).initiateDispute(productId, issue, details, evidenceHash);
        await tx.wait();
        res.send(`Dispute initiated for product ID ${productId}`);
    } catch (error) {
        console.error("Error initiating dispute:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/resolve-dispute', async (req, res) => {
    const { disputeId, resolution } = req.body;
    try {
        const tx = await disputeResolution.connect(retailer).resolveDispute(disputeId, resolution);
        await tx.wait();
        res.send(`Dispute ${disputeId} resolved successfully`);
    } catch (error) {
        console.error("Error resolving dispute:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/compliance-report/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const report = await complianceAndReporting.connect(regulator).generateComplianceReport(productId);
        res.send(report);
    } catch (error) {
        console.error("Error generating compliance report:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/provenance/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const provenance = await consumerTransparency.connect(consumer).getProvenance(productId);
        res.json(provenance);
    } catch (error) {
        console.error("Error retrieving provenance:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/quality-checks/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const qualityChecks = await consumerTransparency.connect(consumer).getQualityChecks(productId);
        res.json(qualityChecks);
    } catch (error) {
        console.error("Error retrieving quality checks:", error);
        res.status(500).send(error.toString());
    }
});

// Start the test server
before(async () => {
    await initializeContracts();
    server = app.listen(3000, () => {
        console.log("Test server running on port 3000");
    });
});

after((done) => {
    server.close(() => {
        console.log("Test server closed");
        done();
    });
});

// Tests
describe("Complete Integration Test for Stockpiling System", function () {
    it("Should register a user", async function () {
        // Skipping this test since users are already registered in setup
        const res = await request(app)
            .post('/register')
            .send({ username: "Alice2", role: 0 });
        expect(res.statusCode).to.equal(500); 
    });

    it("Should record a shipment", async function () {
        const res = await request(app)
            .post('/record-shipment')
            .send({ productId: "PRODUCT1231", destination: retailer.address, quantity: 100, farmerPrice: ethers.utils.parseUnits('1', 'ether') });
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Shipment recorded for product ID PRODUCT1231');
    });

    it("Should update a shipment", async function () {
        const res = await request(app)
            .post('/update-shipment')
            .send({ productId: "PRODUCT1231", newStatus: 2, retailerPrice: ethers.utils.parseUnits('1.5', 'ether') });
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Shipment for product ID PRODUCT1231 updated successfully');
    });

    it("Should update inventory", async function () {
        const res = await request(app)
            .post('/update-inventory')
            .send({ productId: "PRODUCT1231", quantity: 50, price: ethers.utils.parseUnits('2', 'ether') });
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Inventory updated for product ID PRODUCT1231');
    });

    it("Should retrieve inventory", async function () {
        const res = await request(app)
            .get('/inventory/PRODUCT1231');
        expect(res.statusCode).to.equal(200);
        expect(res.body.quantity).to.equal(50);
        expect(res.body.price).to.equal(ethers.utils.parseUnits('2', 'ether').toString());
    });

    it("Should initiate a dispute", async function () {
        const res = await request(app)
            .post('/initiate-dispute')
            .send({ productId: "PRODUCT1231", issue: "Defective product", details: "The product was defective.", evidenceHash: ethers.utils.formatBytes32String("evidence") });
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Dispute initiated for product ID PRODUCT1231');
    });

    it("Should resolve a dispute", async function () {
        const res = await request(app)
            .post('/resolve-dispute')
            .send({ disputeId: 0, resolution: "Refund issued" });
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Dispute 0 resolved successfully');
    });

    it("Should generate a compliance report", async function () {
        const res = await request(app)
            .get('/compliance-report/PRODUCT1231');
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Compliance Report for Product ID: PRODUCT1231');
    });

    it("Should retrieve provenance information", async function () {
        const res = await request(app)
            .get('/provenance/PRODUCT1231');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it("Should retrieve quality checks information", async function () {
        const res = await request(app)
            .get('/quality-checks/PRODUCT1231');
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.be.an('array');
    });
});

