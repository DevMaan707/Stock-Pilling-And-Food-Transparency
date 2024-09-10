
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
 
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the UserManagement contract
    const UserManagement = await ethers.getContractFactory("UserManagement");
    const userManagement = await UserManagement.deploy();
    await userManagement.deployed();
    console.log("UserManagement contract deployed to:", userManagement.address);

    // Deploy the SupplyChainManagement contract with the address of UserManagement
    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    const supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address);
    await supplyChainManagement.deployed();
    console.log("SupplyChainManagement contract deployed to:", supplyChainManagement.address);

    // Deploy the InventoryManagement contract with the address of UserManagement
    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    const inventoryManagement = await InventoryManagement.deploy(userManagement.address);
    await inventoryManagement.deployed();
    console.log("InventoryManagement contract deployed to:", inventoryManagement.address);

    // Deploy the DisputeResolution contract
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.deployed();
    console.log("DisputeResolution contract deployed to:", disputeResolution.address);

    // Deploy the ComplianceAndReporting contract with the address of SupplyChainManagement
    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    const complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address);
    await complianceAndReporting.deployed();
    console.log("ComplianceAndReporting contract deployed to:", complianceAndReporting.address);

    // Deploy the ConsumerTransparency contract with the address of SupplyChainManagement
    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    const consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address);
    await consumerTransparency.deployed();
    console.log("ConsumerTransparency contract deployed to:", consumerTransparency.address);

    console.log("All contracts deployed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contracts:", error);
        process.exit(1);
    });
