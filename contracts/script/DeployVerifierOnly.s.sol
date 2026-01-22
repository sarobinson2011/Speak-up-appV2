// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

// IMPORTANT: import the CURRENT verifier you just regenerated/patched
import { HonkVerifier } from "../src/verifiers/NoirVerifier.sol";

contract DeployVerifierOnly is Script {
    function run() external returns (address verifierAddr) {
        vm.startBroadcast();

        HonkVerifier verifier = new HonkVerifier();

        vm.stopBroadcast();

        console2.log("Verifier deployed at:", address(verifier));
        return address(verifier);
    }
}
