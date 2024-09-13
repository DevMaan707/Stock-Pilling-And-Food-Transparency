const hre = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const gasPrice = ethers.utils.parseUnits('2', 'gwei');

  
    const UserManagement = await ethers.getContractFactory("UserManagement");
    const userManagement = await UserManagement.deploy({ gasPrice });
    await userManagement.deployed();
    console.log("UserManagement contract deployed to:", userManagement.address);

    const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
    const supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address, { gasPrice });
    await supplyChainManagement.deployed();
    console.log("SupplyChainManagement contract deployed to:", supplyChainManagement.address);


    const InventoryManagement = await ethers.getContractFactory("InventoryManagement");
    const inventoryManagement = await InventoryManagement.deploy(userManagement.address, { gasPrice });
    await inventoryManagement.deployed();
    console.log("InventoryManagement contract deployed to:", inventoryManagement.address);

    
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy({ gasPrice });
    await disputeResolution.deployed();
    console.log("DisputeResolution contract deployed to:", disputeResolution.address);


    const ComplianceAndReporting = await ethers.getContractFactory("ComplianceAndReporting");
    const complianceAndReporting = await ComplianceAndReporting.deploy(supplyChainManagement.address, { gasPrice });
    await complianceAndReporting.deployed();
    console.log("ComplianceAndReporting contract deployed to:", complianceAndReporting.address);


    const ConsumerTransparency = await ethers.getContractFactory("ConsumerTransparency");
    const consumerTransparency = await ConsumerTransparency.deploy(supplyChainManagement.address, { gasPrice });
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
