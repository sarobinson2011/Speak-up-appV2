// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

import "forge-std/Script.sol";
import "../src/PetitionRegistryV2.sol";
import "../src/verifiers/NoirVerifier.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployV2Script is Script {
    function run() external {
        // Use the broadcaster's key (from --account flag)
        vm.startBroadcast();
        
        // 1. Deploy verifier
        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));
        
        // 2. Deploy implementation
        PetitionRegistryV2 implementation = new PetitionRegistryV2();
        console.log("Implementation deployed at:", address(implementation));
        
        // 3. Encode initialize call
        bytes memory initData = abi.encodeWithSelector(
            PetitionRegistryV2.initialize.selector,
            address(verifier)
        );
        
        // 4. Deploy proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        console.log("Proxy deployed at:", address(proxy));
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Complete ===");
        console.log("Use PetitionRegistryV2 at proxy address:", address(proxy));
    }
}
