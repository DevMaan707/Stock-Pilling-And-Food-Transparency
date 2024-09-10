// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SupplyChainManagementContract.sol";

contract ConsumerTransparency {
    SupplyChainManagement private supplyChain;

    constructor(address supplyChainAddress) {
        supplyChain = SupplyChainManagement(supplyChainAddress);
    }

    function getProvenance(string memory productId) public view returns (SupplyChainManagement.Shipment[] memory) {
        return supplyChain.getShipmentHistory(productId);
    }

    function getQualityChecks(string memory productId) public view returns (SupplyChainManagement.Shipment[] memory) {
        SupplyChainManagement.Shipment[] memory shipmentHistory = supplyChain.getShipmentHistory(productId);
        SupplyChainManagement.Shipment[] memory qualityChecks;
        uint256 count = 0;

        for (uint256 i = 0; i < shipmentHistory.length; i++) {
            if (shipmentHistory[i].status == SupplyChainManagement.ShipmentStatus.QualityVerified) {
                qualityChecks[count] = shipmentHistory[i];
                count++;
            }
        }

        return qualityChecks;
    }
}
