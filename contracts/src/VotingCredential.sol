// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingCredential {
    address public owner;
    mapping(address => bool) public hasCredential;
    
    event CredentialGranted(address indexed user);
    event CredentialRevoked(address indexed user);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function grantCredential(address user) external onlyOwner {
        hasCredential[user] = true;
        emit CredentialGranted(user);
    }
    
    function revokeCredential(address user) external onlyOwner {
        hasCredential[user] = false;
        emit CredentialRevoked(user);
    }
}
