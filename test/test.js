require('dotenv').config();
const { expect } = require('chai');
const { ethers } = require('hardhat');
const request = require('supertest');  // Import supertest to test Express routes
const express = require('express');

// Initialize Express app
const app = express();
app.use(express.json());

let server;
let userManagement, supplyChainManagement, inventoryManagement, disputeResolution, complianceAndReporting, consumerTransparency;
let farmer, retailer, consumer, regulator;

async function initializeContracts() {
    // Deploy UserManagement contract
    const UserManagement = await ethers.getContractFactory("UserManagement");
    userManagement = await UserManagement.deploy();
    await userManagement.deployed();

    // Deploy InventoryManagement contract
    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    inventoryManagement = await InventoryManagement.deploy(userManagement.address);
    await inventoryManagement.deployed();

    // Deploy SupplyChainManagement contract
    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address, inventoryManagement.address);
    await supplyChainManagement.deployed();

    // Deploy DisputeResolution contract
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.deployed();

    // Deploy ComplianceAndReporting contract
    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address, userManagement.address);
    await complianceAndReporting.deployed();

    // Deploy ConsumerTransparency contract
    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address);
    await consumerTransparency.deployed();

    // Get signers for different roles
    [farmer, retailer, consumer, regulator] = await ethers.getSigners();

    // Register users with their respective roles
    await userManagement.connect(farmer).registerUser("FarmerUser", 0); // Farmer
    await userManagement.connect(retailer).registerUser("RetailerUser", 1); // Retailer
    await userManagement.connect(consumer).registerUser("ConsumerUser", 2); // Consumer
    await userManagement.connect(regulator).registerUser("RegulatorUser", 4); // Regulator
}

// Express routes for interacting with the contracts
app.post('/add-inventory', async (req, res) => {
    const { productId, quantity, price } = req.body;
    console.log("Adding inventory", productId, quantity, price);  // Debugging log
    try {
        const tx = await inventoryManagement.connect(farmer).updateInventory(productId, quantity, price);
        await tx.wait();
        res.send(`Inventory updated for product ID ${productId}`);
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/record-shipment', async (req, res) => {
    const { productId, destination, quantity, farmerPrice } = req.body;
    console.log("Recording shipment", productId, destination, quantity, farmerPrice);  // Debugging log
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
    console.log("Updating shipment", productId, newStatus, retailerPrice);  // Debugging log
    try {
        const tx = await supplyChainManagement.connect(retailer).updateShipmentStatusAndRetailerPrice(productId, newStatus, retailerPrice);
        await tx.wait();
        res.send(`Shipment updated for product ID ${productId}`);
    } catch (error) {
        console.error("Error updating shipment:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/initiate-dispute', async (req, res) => {
    const { productId, issue, details, evidenceHash } = req.body;
    console.log("Initiating dispute", productId, issue, details);  // Debugging log
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
    console.log("Resolving dispute", disputeId, resolution);  // Debugging log
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
    console.log("Generating compliance report", productId);  // Debugging log
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
    console.log("Retrieving provenance", productId);  // Debugging log
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
    console.log("Retrieving quality checks", productId);  // Debugging log
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

describe("Complete Supply Chain Workflow", function () {
    it("Should allow farmer to add inventory and record shipment", async function () {
        // Step 1: Add produce to inventory
        const inventoryRes = await request(app)
            .post('/add-inventory')
            .send({ productId: "PRODUCT1", quantity: 100, price: ethers.utils.parseUnits('1', 'ether') });
        expect(inventoryRes.statusCode).to.equal(200);
        expect(inventoryRes.text).to.include('Inventory updated for product ID PRODUCT1');

        // Step 2: Record shipment
        const shipmentRes = await request(app)
            .post('/record-shipment')
            .send({ productId: "PRODUCT1", destination: retailer.address, quantity: 100, farmerPrice: ethers.utils.parseUnits('1', 'ether') });
        expect(shipmentRes.statusCode).to.equal(200);
        expect(shipmentRes.text).to.include('Shipment recorded for product ID PRODUCT1');
    });

    it("Should update shipment status", async function () {
        // Update shipment status from "Created" to "InTransit" (Status 2)
        const updateShipmentRes = await request(app)
            .post('/update-shipment')
            .send({ productId: "PRODUCT1", newStatus: 2, retailerPrice: ethers.utils.parseUnits('1.5', 'ether') });
        expect(updateShipmentRes.statusCode).to.equal(200);
        expect(updateShipmentRes.text).to.include('Shipment updated for product ID PRODUCT1');
    });

    it("Should initiate and resolve a dispute", async function () {
        // Step 1: Consumer initiates a dispute
        const initiateDisputeRes = await request(app)
            .post('/initiate-dispute')
            .send({
                productId: "PRODUCT1",
                issue: "Defective product",
                details: "The product arrived damaged.",
                evidenceHash: ethers.utils.formatBytes32String("evidence")
            });
        expect(initiateDisputeRes.statusCode).to.equal(200);
        expect(initiateDisputeRes.text).to.include('Dispute initiated for product ID PRODUCT1');

        // Step 2: Retailer resolves the dispute
        const resolveDisputeRes = await request(app)
            .post('/resolve-dispute')
            .send({ disputeId: 0, resolution: "Refund issued" });
        expect(resolveDisputeRes.statusCode).to.equal(200);
        expect(resolveDisputeRes.text).to.include('Dispute 0 resolved successfully');
    });

    it("Should generate a compliance report", async function () {
        const complianceReportRes = await request(app)
            .get('/compliance-report/PRODUCT1');
        expect(complianceReportRes.statusCode).to.equal(200);

        // This is where you check if the response text contains the expected product ID
        expect(complianceReportRes.text).to.include('Compliance Report for Product ID: PRODUCT1');
    });

    it("Should retrieve provenance and quality checks", async function () {
        // Step 1: Retrieve provenance
        const provenanceRes = await request(app)
            .get('/provenance/PRODUCT1');
        expect(provenanceRes.statusCode).to.equal(200);
        expect(provenanceRes.body).to.be.an('array');

        // Step 2: Retrieve quality checks
        const qualityChecksRes = await request(app)
            .get('/quality-checks/PRODUCT1');
        expect(qualityChecksRes.statusCode).to.equal(200);
        expect(qualityChecksRes.body).to.be.an('array');
    });
});