// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserManagementContract.sol";

contract InventoryManagement {
    UserManagement private userManagement;

    struct Inventory {
        string productId;
        uint256 quantity;
        uint256 price;
        uint256[] priceHistory; // For tracking price changes over time
        uint256[] quantityHistory; // For tracking inventory changes over time
        uint256[] timestamps; // To match with price and quantity changes
    }

    mapping(address => mapping(string => Inventory)) public inventories; // Store inventory by address and productId

    event InventoryUpdated(string productId, uint256 quantity, uint256 price);
    event InventoryPriceUpdated(string productId, uint256 newPrice);

    constructor(address userManagementAddress) {
        userManagement = UserManagement(userManagementAddress);
    }


function updateInventory(string memory productId, uint256 quantity, uint256 price) public {
    (, UserManagement.Role role) = userManagement.getUser(msg.sender);
    // Ensure that both farmers and retailers can update inventory
    require(
        role == UserManagement.Role.Farmer || role == UserManagement.Role.Retailer, 
        "Unauthorized user."
    );

    Inventory storage inventory = inventories[msg.sender][productId];
    inventory.productId = productId;
    inventory.quantity = quantity;
    inventory.price = price;

    inventory.quantityHistory.push(quantity);
    inventory.priceHistory.push(price);
    inventory.timestamps.push(block.timestamp);

    emit InventoryUpdated(productId, quantity, price);
}



  function getInventory(string memory productId) public view returns (uint256 quantity, uint256 price) {
    Inventory memory inventory = inventories[msg.sender][productId];
    return (inventory.quantity, inventory.price);
}
    function getInventoryHistory(string memory productId) public view returns (uint256[] memory, uint256[] memory, uint256[] memory) {
        Inventory storage inventory = inventories[msg.sender][productId];
        return (inventory.quantityHistory, inventory.priceHistory, inventory.timestamps);
    }
    function getInventoryByAddress(address userAddress, string memory productId) public view returns (uint256 quantity, uint256 price) {
    Inventory memory inventory = inventories[userAddress][productId];
    require(bytes(inventory.productId).length != 0, "Product not found in the inventory");
    return (inventory.quantity, inventory.price);
}
}
