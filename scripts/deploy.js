const hre = require("hardhat");
const fs = require('fs');
const readline = require('readline');

async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function deployContract(contractName, deployArgs = []) {
    const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei'); 
    const maxFeePerGas = ethers.utils.parseUnits('10', 'gwei');

    const Contract = await ethers.getContractFactory(contractName);
    const estimatedGas = await ethers.provider.estimateGas(
        Contract.getDeployTransaction(...deployArgs)
    );
    const contractInstance = await Contract.deploy(...deployArgs, {
        gasLimit: estimatedGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
    });
    await contractInstance.deployed();
    console.log(`${contractName} contract deployed to:`, contractInstance.address);
    return contractInstance.address;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy UserManagement Contract
    let userManagementAddress;
    if (process.env.USER_MANAGEMENT_ADDRESS) {
        const ans = await askQuestion('UserManagement contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            userManagementAddress = await deployContract("UserManagementContr");
        } else {
            userManagementAddress = process.env.USER_MANAGEMENT_ADDRESS;
            console.log("Using existing UserManagement contract at:", userManagementAddress);
        }
    } else {
        userManagementAddress = await deployContract("UserManagement");
    }

    // Deploy SupplyChainManagement Contract
    let supplyChainManagementAddress;
    if (process.env.SUPPLY_CHAIN_MANAGEMENT_ADDRESS) {
        const ans = await askQuestion('SupplyChainManagement contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            supplyChainManagementAddress = await deployContract("SupplyChainManagement", [userManagementAddress]);
        } else {
            supplyChainManagementAddress = process.env.SUPPLY_CHAIN_MANAGEMENT_ADDRESS;
            console.log("Using existing SupplyChainManagement contract at:", supplyChainManagementAddress);
        }
    } else {
        supplyChainManagementAddress = await deployContract("SupplyChainManagement", [userManagementAddress]);
    }

    // Deploy InventoryManagement Contract
    let inventoryManagementAddress;
    if (process.env.INVENTORY_MANAGEMENT_ADDRESS) {
        const ans = await askQuestion('InventoryManagement contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            inventoryManagementAddress = await deployContract("InventoryManagement", [userManagementAddress]);
        } else {
            inventoryManagementAddress = process.env.INVENTORY_MANAGEMENT_ADDRESS;
            console.log("Using existing InventoryManagement contract at:", inventoryManagementAddress);
        }
    } else {
        inventoryManagementAddress = await deployContract("InventoryManagement", [userManagementAddress]);
    }

    // Deploy DisputeResolution Contract
    let disputeResolutionAddress;
    if (process.env.DISPUTE_RESOLUTION_ADDRESS) {
        const ans = await askQuestion('DisputeResolution contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            disputeResolutionAddress = await deployContract("DisputeResolution");
        } else {
            disputeResolutionAddress = process.env.DISPUTE_RESOLUTION_ADDRESS;
            console.log("Using existing DisputeResolution contract at:", disputeResolutionAddress);
        }
    } else {
        disputeResolutionAddress = await deployContract("DisputeResolution");
    }

    // Deploy ComplianceAndReporting Contract
    let complianceAndReportingAddress;
    if (process.env.COMPLIANCE_AND_REPORTING_ADDRESS) {
        const ans = await askQuestion('ComplianceAndReporting contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            complianceAndReportingAddress = await deployContract("ComplianceAndReporting", [supplyChainManagementAddress, userManagementAddress]);
        } else {
            complianceAndReportingAddress = process.env.COMPLIANCE_AND_REPORTING_ADDRESS;
            console.log("Using existing ComplianceAndReporting contract at:", complianceAndReportingAddress);
        }
    } else {
        complianceAndReportingAddress = await deployContract("ComplianceAndReporting", [supplyChainManagementAddress, userManagementAddress]);
    }

    // Deploy ConsumerTransparency Contract
    let consumerTransparencyAddress;
    if (process.env.CONSUMER_TRANSPARENCY_ADDRESS) {
        const ans = await askQuestion('ConsumerTransparency contract already deployed. Redeploy? (y/N) ');
        if (ans.toLowerCase() === 'y') {
            consumerTransparencyAddress = await deployContract("ConsumerTransparency", [supplyChainManagementAddress]);
        } else {
            consumerTransparencyAddress = process.env.CONSUMER_TRANSPARENCY_ADDRESS;
            console.log("Using existing ConsumerTransparency contract at:", consumerTransparencyAddress);
        }
    } else {
        consumerTransparencyAddress = await deployContract("ConsumerTransparency", [supplyChainManagementAddress]);
    }

    // Write the contract addresses to .env
    const envData = `
USER_MANAGEMENT_ADDRESS=${userManagementAddress}
SUPPLY_CHAIN_MANAGEMENT_ADDRESS=${supplyChainManagementAddress}
INVENTORY_MANAGEMENT_ADDRESS=${inventoryManagementAddress}
DISPUTE_RESOLUTION_ADDRESS=${disputeResolutionAddress}
COMPLIANCE_AND_REPORTING_ADDRESS=${complianceAndReportingAddress}
CONSUMER_TRANSPARENCY_ADDRESS=${consumerTransparencyAddress}
    `;
    fs.appendFileSync('.env', envData);

    console.log("All contracts deployed and addresses written to .env!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contracts:", error);
        process.exit(1);
    });
