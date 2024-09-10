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
    }

    mapping(string => Shipment[]) public shipments;

    event ShipmentRecorded(string productId, address origin, address destination, ShipmentStatus status);

    constructor(address userManagementAddress) {
        userManagement = UserManagement(userManagementAddress);
    }

    function recordShipment(string memory productId, address destination, ShipmentStatus status) public {
        (, UserManagement.Role role) = userManagement.getUser(msg.sender);
        require(role == UserManagement.Role.Farmer || role == UserManagement.Role.Distributor, "Unauthorized user.");

        Shipment memory newShipment = Shipment({
            productId: productId,
            origin: msg.sender,
            destination: destination,
            status: status,
            timestamp: block.timestamp
        });

        shipments[productId].push(newShipment);
        emit ShipmentRecorded(productId, msg.sender, destination, status);
    }

    function getShipmentHistory(string memory productId) public view returns (Shipment[] memory) {
        return shipments[productId];
    }

    function updateShipmentStatus(string memory productId, ShipmentStatus newStatus) public {
        Shipment[] storage shipmentHistory = shipments[productId];
        require(shipmentHistory.length > 0, "Shipment not found.");

        Shipment storage latestShipment = shipmentHistory[shipmentHistory.length - 1];
        require(latestShipment.destination == msg.sender, "Unauthorized to update this shipment.");
        latestShipment.status = newStatus;

        emit ShipmentRecorded(productId, latestShipment.origin, latestShipment.destination, newStatus);
    }
}
