// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DisputeResolution {
    struct Dispute {
        uint256 disputeId;
        string productId;
        address initiator;
        string issue;
        string details;
        bool resolved;
        string resolution;
        bytes32 evidenceHash; 
    }

    uint256 private disputeCounter;
    mapping(uint256 => Dispute) public disputes;

    event DisputeInitiated(uint256 disputeId, string productId, address initiator, string issue);
    event DisputeResolved(uint256 disputeId, string resolution);

    constructor() {
        disputeCounter = 0;
    }

    function initiateDispute(string memory productId, string memory issue, string memory details, bytes32 evidenceHash) public {
        disputes[disputeCounter] = Dispute({
            disputeId: disputeCounter,
            productId: productId,
            initiator: msg.sender,
            issue: issue,
            details: details,
            resolved: false,
            resolution: "",
            evidenceHash: evidenceHash
        });

        emit DisputeInitiated(disputeCounter, productId, msg.sender, issue);
        disputeCounter++;
    }

    function resolveDispute(uint256 disputeId, string memory resolution) public {
        require(disputes[disputeId].resolved == false, "Dispute already resolved.");
        disputes[disputeId].resolved = true;
        disputes[disputeId].resolution = resolution;

        emit DisputeResolved(disputeId, resolution);
    }

    function getDispute(uint256 disputeId) public view returns (Dispute memory) {
        return disputes[disputeId];
    }
}
