// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserManagement {
    enum Role { Farmer, Distributor, Retailer, Consumer, Regulator }

    struct User {
        address userAddress;
        string username;
        Role role;
    }

    mapping(address => User) public users;
    mapping(address => bool) public isUserRegistered;

    event UserRegistered(address userAddress, string username, Role role);

    function registerUser(string memory username, Role role) public {
        require(!isUserRegistered[msg.sender], "User already registered.");

        users[msg.sender] = User({
            userAddress: msg.sender,
            username: username,
            role: role
        });
        isUserRegistered[msg.sender] = true;

        emit UserRegistered(msg.sender, username, role);
    }

    function getUser(address userAddress) public view returns (string memory, Role) {
        require(isUserRegistered[userAddress], "User not registered.");
        User memory user = users[userAddress];
        return (user.username, user.role);
    }
}
