const { expect } = require('chai');
const { ethers } = require('hardhat');

let userManagement, supplyChainManagement;

describe("Supply Chain and User Management", function () {
    before(async () => {
        const UserManagement = await ethers.getContractFactory("UserManagement");
        userManagement = await UserManagement.deploy();
        await userManagement.deployed();

        const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
        supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address);
        await supplyChainManagement.deployed();
    });

    it("Should register a user", async function () {
        await userManagement.registerUser("Alice", 0); // 0 represents the Role.Farmer
        const user = await userManagement.getUser(ethers.provider.getSigner(0).getAddress());
        expect(user[0]).to.equal("Alice");
        expect(user[1]).to.equal(0); // 0 represents Role.Farmer
    });

    it("Should record a shipment", async function () {
        await supplyChainManagement.recordShipment("PRODUCT123", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", 1);
        const shipmentHistory = await supplyChainManagement.getShipmentHistory("PRODUCT123");
        expect(shipmentHistory.length).to.equal(1);
        expect(shipmentHistory[0].destination).to.equal("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
    });
});
