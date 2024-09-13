const { expect } = require('chai');
const { ethers } = require('hardhat');

let userManagement, supplyChainManagement;

describe("Supply Chain and User Management", function () {
    before(async () => {
        const UserManagement = await ethers.getContractFactory("UserManagement");
        userManagement = await UserManagement.deploy({ gasPrice: ethers.utils.parseUnits('2', 'gwei') });
        await userManagement.deployed();

        const SupplyChainManagement = await ethers.getContractFactory("SupplyChainManagement");
        supplyChainManagement = await SupplyChainManagement.deploy(userManagement.address, { gasPrice: ethers.utils.parseUnits('2', 'gwei') });
        await supplyChainManagement.deployed();
    });

    it("Should register a user", async function () {
        await userManagement.registerUser("Alice", 0);
        const user = await userManagement.getUser(ethers.provider.getSigner(0).getAddress());
        expect(user[0]).to.equal("Alice");
        expect(user[1]).to.equal(0); 
    });

    it("Should record a shipment", async function () {
        await supplyChainManagement.recordShipment("PRODUCT123", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", 100, ethers.utils.parseUnits('1', 'ether'));
        const shipmentHistory = await supplyChainManagement.getShipmentHistory("PRODUCT123");
        expect(shipmentHistory.length).to.equal(1);
        expect(shipmentHistory[0].destination).to.equal("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
        expect(shipmentHistory[0].quantity).to.equal(100);
        expect(shipmentHistory[0].farmerPrice).to.equal(ethers.utils.parseUnits('1', 'ether'));
    });
});
