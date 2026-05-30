// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssistEarn {

    event RewardRecorded(
        address indexed user,
        string taskType,
        uint256 tokens,
        uint256 timestamp
    );

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // 🔥 Main function: record reward on blockchain
    function recordReward(
        address user,
        string memory taskType,
        uint256 tokens
    ) public onlyOwner {
        emit RewardRecorded(user, taskType, tokens, block.timestamp);
    }
}