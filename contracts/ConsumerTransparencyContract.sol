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

    function getCertifications(string memory productId) public view returns (string memory) {
        // Assuming certifications are recorded in the shipment history.
        SupplyChainManagement.Shipment[] memory shipmentHistory = supplyChain.getShipmentHistory(productId);
        string memory certifications = "Certifications: \n";

        for (uint i = 0; i < shipmentHistory.length; i++) {
            if (shipmentHistory[i].status == SupplyChainManagement.ShipmentStatus.QualityVerified) {
                certifications = string(abi.encodePacked(certifications, "Quality Verified at step ", uint2str(i+1), "\n"));
            }
        }

        return certifications;
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
}
