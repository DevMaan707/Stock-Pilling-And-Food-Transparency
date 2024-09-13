// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserManagementContract.sol";

contract SupplyChainManagement {
    UserManagement private userManagement;

    enum ShipmentStatus { Created, InTransit, Delivered, QualityVerified }

    struct Shipment {
        string productId;
        address origin;
        address destination;
        ShipmentStatus status;
        uint256 timestamp;
        uint256 quantity;
        uint256 farmerPrice;    // Price set by the farmer
        uint256 retailerPrice;  // Price set by the retailer
    }

    mapping(string => Shipment[]) public shipments;

    event ShipmentRecorded(string productId, address origin, address destination, ShipmentStatus status, uint256 quantity, uint256 farmerPrice, uint256 retailerPrice);
    event ShipmentVerified(string productId, address verifier);

    constructor(address userManagementAddress) {
        userManagement = UserManagement(userManagementAddress);
    }

    function recordShipment(string memory productId, address destination, uint256 quantity, uint256 farmerPrice) public {
        (, UserManagement.Role role) = userManagement.getUser(msg.sender);
        require(role == UserManagement.Role.Farmer, "Only farmers can initiate shipments.");

        Shipment memory newShipment = Shipment({
            productId: productId,
            origin: msg.sender,
            destination: destination,
            status: ShipmentStatus.Created,
            timestamp: block.timestamp,
            quantity: quantity,
            farmerPrice: farmerPrice,
            retailerPrice: 0 // Set later by the retailer
        });

        shipments[productId].push(newShipment);
        emit ShipmentRecorded(productId, msg.sender, destination, ShipmentStatus.Created, quantity, farmerPrice, 0);
    }

    function updateShipmentStatusAndRetailerPrice(string memory productId, ShipmentStatus newStatus, uint256 retailerPrice) public {
        Shipment[] storage shipmentHistory = shipments[productId];
        require(shipmentHistory.length > 0, "Shipment not found.");

        Shipment storage latestShipment = shipmentHistory[shipmentHistory.length - 1];
        require(latestShipment.destination == msg.sender, "Unauthorized to update this shipment.");
        
        latestShipment.status = newStatus;
        latestShipment.retailerPrice = retailerPrice;

        emit ShipmentRecorded(productId, latestShipment.origin, latestShipment.destination, newStatus, latestShipment.quantity, latestShipment.farmerPrice, retailerPrice);
    }

    function verifyShipment(string memory productId) public {
        Shipment[] storage shipmentHistory = shipments[productId];
        require(shipmentHistory.length > 0, "Shipment not found.");

        Shipment storage latestShipment = shipmentHistory[shipmentHistory.length - 1];
        require(latestShipment.destination == msg.sender, "Only the receiving party can verify this shipment.");

        latestShipment.status = ShipmentStatus.QualityVerified;

        emit ShipmentVerified(productId, msg.sender);
    }

    function getProductPrice(string memory productId) public view returns (uint256, uint256) {
        Shipment[] storage shipmentHistory = shipments[productId];
        require(shipmentHistory.length > 0, "Shipment not found.");

        Shipment storage latestShipment = shipmentHistory[shipmentHistory.length - 1];
        return (latestShipment.farmerPrice, latestShipment.retailerPrice);
    }

    function getShipmentHistory(string memory productId) public view returns (Shipment[] memory) {
        return shipments[productId];
    }
}
