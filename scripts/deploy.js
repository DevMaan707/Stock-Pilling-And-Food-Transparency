const hre = require("hardhat");
const fs = require("fs");


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy UserManagement contract
    const UserManagement = await ethers.getContractFactory("UserManagement");
    const userManagement = await UserManagement.deploy();
    await userManagement.deployed();
    console.log("UserManagement contract deployed to:", userManagement.address);

    // Deploy InventoryManagement contract
    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    const inventoryManagement = await InventoryManagement.deploy(userManagement.address);
    await inventoryManagement.deployed();
    console.log("InventoryManagement contract deployed to:", inventoryManagement.address);

    // Deploy SupplyChainManagement contract
    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    const supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address, inventoryManagement.address);
    await supplyChainManagement.deployed();
    console.log("SupplyChainManagement contract deployed to:", supplyChainManagement.address);

    // Deploy DisputeResolution contract
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.deployed();
    console.log("DisputeResolution contract deployed to:", disputeResolution.address);

    // Deploy ComplianceAndReporting contract
    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    const complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address, userManagement.address);
    await complianceAndReporting.deployed();
    console.log("ComplianceAndReporting contract deployed to:", complianceAndReporting.address);

    // Deploy ConsumerTransparency contract
    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    const consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address);
    await consumerTransparency.deployed();
    console.log("ConsumerTransparency contract deployed to:", consumerTransparency.address);

    // Writing deployed contract addresses to .env file
    const envData = `
USER_MANAGEMENT_ADDRESS=${userManagement.address}
INVENTORY_MANAGEMENT_ADDRESS=${inventoryManagement.address}
SUPPLY_CHAIN_MANAGEMENT_ADDRESS=${supplyChainManagement.address}
DISPUTE_RESOLUTION_ADDRESS=${disputeResolution.address}
COMPLIANCE_AND_REPORTING_ADDRESS=${complianceAndReporting.address}
CONSUMER_TRANSPARENCY_ADDRESS=${consumerTransparency.address}
    `;
    fs.appendFileSync('.env', envData);

    console.log("Contract addresses written to .env file");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contracts:", error);
        process.exit(1);
    });
