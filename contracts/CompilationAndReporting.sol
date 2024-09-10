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

        string memory report = string(abi.encodePacked("Compliance Report for Product ID: ", productId, "\n"));
        report = string(abi.encodePacked(report, "Total Shipments: ", uint2str(shipmentHistory.length), "\n"));

        for (uint i = 0; i < shipmentHistory.length; i++) {
            SupplyChainManagement.Shipment memory shipment = shipmentHistory[i];
            report = string(abi.encodePacked(report, "Shipment ", uint2str(i+1), ":\n"));
            report = string(abi.encodePacked(report, "  - Origin: ", addressToString(shipment.origin), "\n"));
            report = string(abi.encodePacked(report, "  - Destination: ", addressToString(shipment.destination), "\n"));
            report = string(abi.encodePacked(report, "  - Status: ", getShipmentStatus(shipment.status), "\n"));
            report = string(abi.encodePacked(report, "  - Timestamp: ", uint2str(shipment.timestamp), "\n"));
        }

        return report;
    }

    function auditTransactionHistory(string memory productId) public view returns (SupplyChainManagement.Shipment[] memory) {
        return supplyChain.getShipmentHistory(productId);
    }


    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function addressToString(address _address) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(51);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function getShipmentStatus(SupplyChainManagement.ShipmentStatus status) internal pure returns (string memory) {
        if (status == SupplyChainManagement.ShipmentStatus.Created) {
            return "Created";
        } else if (status == SupplyChainManagement.ShipmentStatus.InTransit) {
            return "In Transit";
        } else if (status == SupplyChainManagement.ShipmentStatus.Delivered) {
            return "Delivered";
        } else if (status == SupplyChainManagement.ShipmentStatus.QualityVerified) {
            return "Quality Verified";
        } else {
            return "Unknown Status";
        }
    }
}
