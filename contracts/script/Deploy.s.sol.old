// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VotingCredential.sol";
import "../src/PetitionRegistry.sol";

contract DeployScript is Script {
    function run() external {
        // When using --account flag, vm.broadcast() uses that account
        vm.startBroadcast();
        
        // Deploy VotingCredential first
        VotingCredential credential = new VotingCredential();
        console.log("VotingCredential deployed at:", address(credential));
        
        // Deploy PetitionRegistry with credential address
        PetitionRegistry registry = new PetitionRegistry(address(credential));
        console.log("PetitionRegistry deployed at:", address(registry));
        
        vm.stopBroadcast();
    }
}