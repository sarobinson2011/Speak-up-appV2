const fs = require('fs');
const path = require('path');

const proofData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'target', 'proof-data.json'), 'utf8')
);

const proofHex = proofData.proof.slice(2);

const testContent = `// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

import "forge-std/Test.sol";
import "../src/verifiers/NoirVerifier.sol";

contract VerifierTest is Test {
    HonkVerifier public verifier;

    function setUp() public {
        verifier = new HonkVerifier();
    }

    function testVerifyValidProof() public view {
        // Proof generated from Noir circuit with:
        // credential_secret = "123" (private)
        // petition_id = "1" (public)
        // nullifier = computed hash (public)
        
        bytes memory proof = hex"${proofHex}";
        
        bytes32[] memory publicInputs = new bytes32[](${proofData.publicInputs.length});
${proofData.publicInputs.map((input, i) => `        publicInputs[${i}] = ${input};`).join('\n')}
        
        bool result = verifier.verify(proof, publicInputs);
        assertTrue(result, "Proof verification should succeed");
    }
}
`;

const outputPath = path.join(__dirname, '..', 'contracts', 'test', 'VerifierTest.t.sol');
fs.writeFileSync(outputPath, testContent);

console.log('✅ Generated test file:', outputPath);
console.log('\nRun with:');
console.log('  cd contracts');
console.log('  forge test --match-test testVerifyValidProof -vvv');