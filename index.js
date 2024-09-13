// require('dotenv').config();
// const express = require('express');
// const { ethers } = require('hardhat');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// app.use(express.json());


// const roleEnum = {
//     farmer: 0,
//     distributor: 1,
//     retailer: 2,
//     consumer: 3,
//     regulator: 4
// };


// let userManagement, inventoryManagement, supplyChainManagement, disputeResolution, complianceAndReporting, consumerTransparency;
// let provider, wallet;

// const walletsDir = path.join(__dirname, 'wallets');

// // Ensure the wallets directory exists
// if (!fs.existsSync(walletsDir)) {
//     fs.mkdirSync(walletsDir);
// }

// // Generate a new wallet
// async function generateWallet() {
//     const wallet = ethers.Wallet.createRandom();
//     const walletData = {
//         address: wallet.address,
//         privateKey: wallet.privateKey
//     };
//     fs.writeFileSync(path.join(walletsDir, `${wallet.address}.json`), JSON.stringify(walletData, null, 2));
//     return walletData; 
// }

// // Fund the new wallet with ETH
// async function fundWallet(toAddress, ethAmount) {
//     try {
//         const tx = await wallet.sendTransaction({
//             to: toAddress,
//             value: ethers.utils.parseEther(ethAmount),
//             gasLimit: 21000,  // Minimal gas for simple ETH transfer
//         });
//         await tx.wait();
//         console.log(`Sent ${ethAmount} ETH to ${toAddress}`);
//     } catch (error) {
//         console.error(`Error funding wallet: ${error}`);
//         throw error;
//     }
// }

// // Get current gas price dynamically
// async function getCurrentGasOptions() {
//     const feeData = await provider.getFeeData();
//     return {
//         maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei'),
//         maxFeePerGas: feeData.maxFeePerGas || ethers.utils.parseUnits('10', 'gwei')
//     };
// }

// // Define ETH amounts required for each role
// const fundingAmounts = {
//     farmer: '0.008',  // Covers registration and 1 inventory transaction
//     retailer: '0.008', // Covers registration and 1 inventory transaction
//     consumer: '0.002' // Only covers registration
// };

// // Initialize contracts from deployed addresses
// async function initializeContracts() {
//     provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_BLOCKCHAIN_URL);
//     wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); 

//     const UserManagement = await ethers.getContractFactory("UserManagement");
//     userManagement = await UserManagement.attach(process.env.USER_MANAGEMENT_ADDRESS);

//     const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
//     inventoryManagement = await InventoryManagement.attach(process.env.INVENTORY_MANAGEMENT_ADDRESS);

//     const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
//     supplyChainManagement = await SupplyChainManagement.attach(process.env.SUPPLY_CHAIN_MANAGEMENT_ADDRESS);

//     const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
//     disputeResolution = await DisputeResolution.attach(process.env.DISPUTE_RESOLUTION_ADDRESS);

//     const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
//     complianceAndReporting = await ComplianceAndReporting.attach(process.env.COMPLIANCE_AND_REPORTING_ADDRESS);

//     const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
//     consumerTransparency = await ConsumerTransparency.attach(process.env.CONSUMER_TRANSPARENCY_ADDRESS);
// }

// // Ensure contracts are initialized before any endpoint is hit
// async function ensureContractsInitialized(req, res, next) {
//     if (!userManagement || !inventoryManagement || !supplyChainManagement) {
//         await initializeContracts();
//     }
//     next();
// }

// app.use(ensureContractsInitialized);

// // ========== Routes for UserManagement ==========
// const userRouter = express.Router();

// userRouter.post('/register', async (req, res) => {
//     const { username, role } = req.body;

//     // Convert role string to enum value
//     const roleValue = roleEnum[role.toLowerCase()]; // This will map "farmer" to 0, "retailer" to 2, etc.
    
//     if (roleValue === undefined) {
//         return res.status(400).send("Invalid role");
//     }

//     const userWallet = await generateWallet();
//     const userWalletInstance = new ethers.Wallet(userWallet.privateKey, provider);

//     try {
  
//         const ethToSend = fundingAmounts[role.toLowerCase()] || '0.001'; // Fallback amount
//         await fundWallet(userWallet.address, ethToSend);

    
//         const gasOptions = {
//             gasLimit: 100000,
//             maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'), 
//             maxFeePerGas: ethers.utils.parseUnits('10', 'gwei') 
//         };
//         const tx = await userManagement.connect(userWalletInstance).registerUser(username, roleValue, gasOptions);
//         await tx.wait();

//         res.json({
//             message: `User ${username} registered successfully.`,
//             walletAddress: userWallet.address,
//             privateKey: userWallet.privateKey
//         });
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/user', userRouter);

// // ========== Routes for InventoryManagement ==========
// const inventoryRouter = express.Router();
// inventoryRouter.post('/add', async (req, res) => {
//     const { productId, quantity, price, address } = req.body;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const tx = await inventoryManagement.connect(userWalletInstance).updateInventory(productId, quantity, price, gasOptions);
//         await tx.wait();
//         res.send(`Inventory updated for product ID ${productId}`);
//     } catch (error) {
//         console.error("Error updating inventory:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/inventory', inventoryRouter);

// // ========== Routes for SupplyChainManagement ==========
// const supplyChainRouter = express.Router();
// supplyChainRouter.post('/record-shipment', async (req, res) => {
//     const { productId, destination, quantity, farmerPrice, address } = req.body;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const tx = await supplyChainManagement.connect(userWalletInstance).recordShipment(productId, destination, quantity, farmerPrice, gasOptions);
//         await tx.wait();
//         res.send(`Shipment recorded for product ID ${productId}`);
//     } catch (error) {
//         console.error("Error recording shipment:", error);
//         res.status(500).send(error.toString());
//     }
// });

// supplyChainRouter.post('/update-shipment', async (req, res) => {
//     const { productId, newStatus, retailerPrice, address } = req.body;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const tx = await supplyChainManagement.connect(userWalletInstance).updateShipmentStatusAndRetailerPrice(productId, newStatus, retailerPrice, gasOptions);
//         await tx.wait();
//         res.send(`Shipment updated for product ID ${productId}`);
//     } catch (error) {
//         console.error("Error updating shipment:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/supply-chain', supplyChainRouter);

// // ========== Routes for DisputeResolution ==========
// const disputeRouter = express.Router();
// disputeRouter.post('/initiate', async (req, res) => {
//     const { productId, issue, details, evidenceHash, address } = req.body;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const tx = await disputeResolution.connect(userWalletInstance).initiateDispute(productId, issue, details, evidenceHash, gasOptions);
//         await tx.wait();
//         res.send(`Dispute initiated for product ID ${productId}`);
//     } catch (error) {
//         console.error("Error initiating dispute:", error);
//         res.status(500).send(error.toString());
//     }
// });

// disputeRouter.post('/resolve', async (req, res) => {
//     const { disputeId, resolution, address } = req.body;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const tx = await disputeResolution.connect(userWalletInstance).resolveDispute(disputeId, resolution, gasOptions);
//         await tx.wait();
//         res.send(`Dispute ${disputeId} resolved successfully`);
//     } catch (error) {
//         console.error("Error resolving dispute:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/dispute', disputeRouter);

// // ========== Routes for ComplianceAndReporting ==========
// const complianceRouter = express.Router();
// complianceRouter.get('/report/:productId', async (req, res) => {
//     const { productId, address } = req.params;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const report = await complianceAndReporting.connect(userWalletInstance).generateComplianceReport(productId, gasOptions);
//         res.send(report);
//     } catch (error) {
//         console.error("Error generating compliance report:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/compliance', complianceRouter);

// // ========== Routes for ConsumerTransparency ==========
// const transparencyRouter = express.Router();
// transparencyRouter.get('/provenance/:productId', async (req, res) => {
//     const { productId, address } = req.params;
//     try {
//         const userWalletInstance = new ethers.Wallet(address, provider);
//         const gasOptions = await getCurrentGasOptions();
//         const provenance = await consumerTransparency.connect(userWalletInstance).getProvenance(productId, gasOptions);
//         res.json(provenance);
//     } catch (error) {
//         console.error("Error retrieving provenance:", error);
//         res.status(500).send(error.toString());
//     }
// });

// app.use('/transparency', transparencyRouter);

// // Start the Express server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
require('dotenv').config();
const express = require('express');
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const roleEnum = {
    farmer: 0,
    distributor: 1,
    retailer: 2,
    consumer: 3,
    regulator: 4
};

let userManagement, inventoryManagement, supplyChainManagement, disputeResolution, complianceAndReporting, consumerTransparency;
let provider, wallet;

const walletsDir = path.join(__dirname, 'wallets');

// Ensure the wallets directory exists
if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir);
}

// Generate a new wallet
async function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
    fs.writeFileSync(path.join(walletsDir, `${wallet.address}.json`), JSON.stringify(walletData, null, 2));
    return walletData; 
}

// Fund the new wallet with ETH
async function fundWallet(toAddress, ethAmount) {
    try {
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.utils.parseEther(ethAmount),
            gasLimit: 21000,  // Minimal gas for simple ETH transfer
        });
        await tx.wait();
        console.log(`Sent ${ethAmount} ETH to ${toAddress}`);
    } catch (error) {
        console.error(`Error funding wallet: ${error}`);
        throw error;
    }
}

// Get current gas price dynamically, with fallback to low-cost values
async function getCurrentGasOptions() {
    const feeData = await provider.getFeeData();

    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas 
        ? ethers.utils.parseUnits(Math.min(ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'), 1).toString(), 'gwei') 
        : ethers.utils.parseUnits('1', 'gwei');
    
    const maxFeePerGas = feeData.maxFeePerGas 
        ? ethers.utils.parseUnits(Math.min(ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei'), 8).toString(), 'gwei') 
        : ethers.utils.parseUnits('8', 'gwei');

    return {
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit: 65000 // Estimate gas limit for registration, optimize per action
    };
}

// Define ETH amounts required for each role
const fundingAmounts = {
    farmer: '0.008',  // Covers registration and 1 inventory transaction
    retailer: '0.008', // Covers registration and 1 inventory transaction
    consumer: '0.002' // Only covers registration
};

// Initialize contracts from deployed addresses
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

// Ensure contracts are initialized before any endpoint is hit
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

    // Convert role string to enum value
    const roleValue = roleEnum[role.toLowerCase()]; 
    
    if (roleValue === undefined) {
        return res.status(400).send("Invalid role");
    }

    const userWallet = await generateWallet();
    const userWalletInstance = new ethers.Wallet(userWallet.privateKey, provider);

    try {
        const ethToSend = fundingAmounts[role.toLowerCase()] || '0.001'; 
        await fundWallet(userWallet.address, ethToSend);

        const gasOptions = await getCurrentGasOptions();
        
        const tx = await userManagement.connect(userWalletInstance).registerUser(username, roleValue, gasOptions);
        await tx.wait();

        res.json({
            "message": `User ${username} registered successfully.`,
            "walletAddress": userWallet.address,
            "privateKey": userWallet.privateKey
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send(error.toString());
    }
});

userRouter.get('/get/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const userData = await userManagement.getUser(address);
        res.json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/user', userRouter);

// ========== Routes for InventoryManagement ==========
const inventoryRouter = express.Router();

inventoryRouter.post('/add', async (req, res) => {
    const { address, productName, quantity } = req.body;

    try {
        const gasOptions = await getCurrentGasOptions();
        const tx = await inventoryManagement.addProduct(address, productName, quantity, gasOptions);
        await tx.wait();
        res.json({ "message":` Product ${productName} added successfully. `});
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/inventory', inventoryRouter);

// ========== Routes for SupplyChainManagement ==========
const supplyChainRouter = express.Router();

supplyChainRouter.post('/transfer', async (req, res) => {
    const { productId, from, to } = req.body;

    try {
        const gasOptions = await getCurrentGasOptions();
        const tx = await supplyChainManagement.transferProduct(productId, from, to, gasOptions);
        await tx.wait();
        res.json({ "message": `Product ${productId} transferred from ${from} to ${to}. `});
    } catch (error) {
        console.error("Error transferring product:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/supply-chain', supplyChainRouter);

// ========== Routes for DisputeResolution ==========
const disputeRouter = express.Router();

disputeRouter.post('/raise', async (req, res) => {
    const { transactionId, description } = req.body;

    try {
        const gasOptions = await getCurrentGasOptions();
        const tx = await disputeResolution.raiseDispute(transactionId, description, gasOptions);
        await tx.wait();
        res.json({ "message": `Dispute raised for transaction ${transactionId}. `});
    } catch (error) {
        console.error("Error raising dispute:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/dispute', disputeRouter);

// ========== Routes for ComplianceAndReporting ==========
const complianceRouter = express.Router();

complianceRouter.get('/report/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const report = await complianceAndReporting.generateComplianceReport(address);
        res.json(report);
    } catch (error) {
        console.error("Error generating compliance report:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/compliance', complianceRouter);

// ========== Routes for ConsumerTransparency ==========
const transparencyRouter = express.Router();

transparencyRouter.get('/product/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const productInfo = await consumerTransparency.getProductInfo(productId);
        res.json(productInfo);
    } catch (error) {
        console.error("Error fetching product info:", error);
        res.status(500).send(error.toString());
    }
});

app.use('/transparency', transparencyRouter);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
