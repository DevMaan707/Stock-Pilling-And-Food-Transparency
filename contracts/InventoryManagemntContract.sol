// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserManagementContract.sol";

contract InventoryManagement {
    UserManagement private userManagement;

    struct Inventory {
        string productId;
        uint256 quantity;
    }

    mapping(string => Inventory) public inventories;

    event InventoryUpdated(string productId, uint256 quantity);

    constructor(address userManagementAddress) {
        userManagement = UserManagement(userManagementAddress);
    }

    function updateInventory(string memory productId, uint256 quantity) public {
        (, UserManagement.Role role) = userManagement.getUser(msg.sender);
        require(role == UserManagement.Role.Retailer || role == UserManagement.Role.Distributor, "Unauthorized user.");

        inventories[productId] = Inventory({ productId: productId, quantity: quantity });
        emit InventoryUpdated(productId, quantity);
    }

    function getInventory(string memory productId) public view returns (uint256) {
        return inventories[productId].quantity;
    }
}
