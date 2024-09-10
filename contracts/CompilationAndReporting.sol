// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SupplyChainManagementContract.sol";

contract ComplianceAndReporting {
    SupplyChainManagement private supplyChain;

    constructor(address supplyChainAddress) {
        supplyChain = SupplyChainManagement(supplyChainAddress);
    }

    function generateComplianceReport(string memory productId) public view returns (string memory) {
        SupplyChainManagement.Shipment[] memory shipmentHistory = supplyChain.getShipmentHistory(productId);
        require(shipmentHistory.length > 0, "No shipment history found for this product.");

        // Simplified example, real implementation would compile a more detailed report.
        return "Compliance Report Generated";
    }

    function auditTransactionHistory(string memory productId) public view returns (SupplyChainManagement.Shipment[] memory) {
        return supplyChain.getShipmentHistory(productId);
    }
}
