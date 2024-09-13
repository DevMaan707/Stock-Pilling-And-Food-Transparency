require('dotenv').config();
const express = require('express');
const { ethers } = require('hardhat');

// Initialize Express app
const app = express();
app.use(express.json());

let userManagement, inventoryManagement, supplyChainManagement, disputeResolution, complianceAndReporting, consumerTransparency;
let provider, wallet;

const walletsDir = path.join(__dirname, 'wallets');

if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir);
}

async function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
    fs.writeFileSync(path.join(walletsDir, `${wallet.address}.json`), JSON.stringify(walletData, null, 2));
    return walletData; 
}

app.post('/create-wallet', async (req, res) => {
    try {
        const walletData = await generateWallet();
        res.json({
            message: 'Wallet created successfully!',
            address: walletData.address,
            privateKey: walletData.privateKey 
        });
    } catch (error) {
        console.error("Error generating wallet:", error);
        res.status(500).send("Error generating wallet.");
    }
});

async function initializeContracts() {
    provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_BLOCKCHAIN_URL);
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); 

    const UserManagement = await ethers.getContractFactory("UserManagement");
    userManagement = await UserManagement.attach(process.env.USER_MANAGEMENT_ADDRESS);

    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    inventoryManagement = await InventoryManagement.attach(process.env.INVENTORY_MANAGEMENT_ADDRESS);

    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    supplyChainManagement = await SupplyChainManagement.attach(process.env.SUPPLY_CHAIN_MANAGEMENT_ADDRESS);

    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.attach(process.env.DISPUTE_RESOLUTION_ADDRESS);

    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    complianceAndReporting = await ComplianceAndReporting.attach(process.env.COMPLIANCE_AND_REPORTING_ADDRESS);

    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    consumerTransparency = await ConsumerTransparency.attach(process.env.CONSUMER_TRANSPARENCY_ADDRESS);
}

async function ensureContractsInitialized(req, res, next) {
    if (!userManagement || !inventoryManagement || !supplyChainManagement) {
        await initializeContracts();
    }
    next();
}

app.use(ensureContractsInitialized);

// ========== Routes for UserManagement ==========
const userRouter = express.Router();
userRouter.post('/register', async (req, res) => {
    const { username, role } = req.body;
    try {
        const tx = await userManagement.connect(wallet).registerUser(username, role);
        await tx.wait();
        res.send(`User ${username} registered successfully.`);
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send(error.toString());
    }
});

userRouter.get('/:userAddress', async (req, res) => {
    const { userAddress } = req.params;
    try {
        const user = await userManagement.getUser(userAddress);
        res.json(user);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/user', userRouter);

// ========== Routes for InventoryManagement ==========
const inventoryRouter = express.Router();
inventoryRouter.post('/add', async (req, res) => {
    const { productId, quantity, price } = req.body;
    try {
        const tx = await inventoryManagement.connect(wallet).updateInventory(productId, quantity, price);
        await tx.wait();
        res.send(`Inventory updated for product ID ${productId}`);
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).send(error.toString());
    }
});

inventoryRouter.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const inventory = await inventoryManagement.getInventory(productId);
        res.json(inventory);
    } catch (error) {
        console.error("Error retrieving inventory:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/inventory', inventoryRouter);

// ========== Routes for SupplyChainManagement ==========
const supplyChainRouter = express.Router();
supplyChainRouter.post('/record-shipment', async (req, res) => {
    const { productId, destination, quantity, farmerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.connect(wallet).recordShipment(productId, destination, quantity, farmerPrice);
        await tx.wait();
        res.send(`Shipment recorded for product ID ${productId}`);
    } catch (error) {
        console.error("Error recording shipment:", error);
        res.status(500).send(error.toString());
    }
});

supplyChainRouter.post('/update-shipment', async (req, res) => {
    const { productId, newStatus, retailerPrice } = req.body;
    try {
        const tx = await supplyChainManagement.connect(wallet).updateShipmentStatusAndRetailerPrice(productId, newStatus, retailerPrice);
        await tx.wait();
        res.send(`Shipment updated for product ID ${productId}`);
    } catch (error) {
        console.error("Error updating shipment:", error);
        res.status(500).send(error.toString());
    }
});

supplyChainRouter.get('/history/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const history = await supplyChainManagement.getShipmentHistory(productId);
        res.json(history);
    } catch (error) {
        console.error("Error retrieving shipment history:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/supply-chain', supplyChainRouter);

// ========== Routes for DisputeResolution ==========
const disputeRouter = express.Router();
disputeRouter.post('/initiate', async (req, res) => {
    const { productId, issue, details, evidenceHash } = req.body;
    try {
        const tx = await disputeResolution.connect(wallet).initiateDispute(productId, issue, details, evidenceHash);
        await tx.wait();
        res.send(`Dispute initiated for product ID ${productId}`);
    } catch (error) {
        console.error("Error initiating dispute:", error);
        res.status(500).send(error.toString());
    }
});

disputeRouter.post('/resolve', async (req, res) => {
    const { disputeId, resolution } = req.body;
    try {
        const tx = await disputeResolution.connect(wallet).resolveDispute(disputeId, resolution);
        await tx.wait();
        res.send(`Dispute ${disputeId} resolved successfully`);
    } catch (error) {
        console.error("Error resolving dispute:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/dispute', disputeRouter);

// ========== Routes for ComplianceAndReporting ==========
const complianceRouter = express.Router();
complianceRouter.get('/report/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const report = await complianceAndReporting.connect(wallet).generateComplianceReport(productId);
        res.send(report);
    } catch (error) {
        console.error("Error generating compliance report:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/compliance', complianceRouter);

// ========== Routes for ConsumerTransparency ==========
const transparencyRouter = express.Router();
transparencyRouter.get('/provenance/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const provenance = await consumerTransparency.connect(wallet).getProvenance(productId);
        res.json(provenance);
    } catch (error) {
        console.error("Error retrieving provenance:", error);
        res.status(500).send(error.toString());
    }
});

transparencyRouter.get('/quality-checks/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const qualityChecks = await consumerTransparency.connect(wallet).getQualityChecks(productId);
        res.json(qualityChecks);
    } catch (error) {
        console.error("Error retrieving quality checks:", error);
        res.status(500).send(error.toString());
    }
});
app.use('/transparency', transparencyRouter);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

