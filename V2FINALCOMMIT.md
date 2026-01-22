feat: Complete ZK proof infrastructure debugging and Aurora testnet deployment

MAJOR ACHIEVEMENTS:
- Identified and resolved bb native/Solidity verifier divergence bug
- Upgraded Barretenberg from 3.0.0-nightly.20260102 to 20260105
- Successfully deployed working UltraHonk verifier on Aurora testnet
- Verified on-chain proof verification works (verifier.verify() returns true)
- Comprehensive precompile testing confirms Aurora compatibility

TECHNICAL DETAILS:
- Circuit: Poseidon hash (credential_secret, petition_id → nullifier)
- Proof system: UltraHonk with keccak oracle hash
- Verifier size: 24,044 bytes (under EIP-170 limit)
- All Aurora precompiles tested: ModExp, ECADD, ECMUL, Pairing - all working

KEY LEARNINGS:
1. bb nightly versions can have critical native/Solidity divergence bugs
2. Version alignment between Noir, bb, and bb.js is critical
3. Aurora testnet precompiles work correctly despite not being in bb's tested list
4. Solidity verifier generation requires exact bb version matching
5. Contract size optimization: optimizer_runs=1, via-ir, library linking

DEPLOYED ADDRESSES (Aurora Testnet):
- PetitionRegistryV2: 0x13A66f2b7FaC2C0afC34E1Cf944f710F342F7034
- Working Verifier: 0xa9C5ce20b4f3983C7cFeAC13EC3b6E1Dc17459f2
- ZKTranscriptLib: 0xeB0bE3069f104aa90c4Fc08Dd6f1298cE8a0d660

REMAINING ISSUES:
- Backend proof generation not yet updated to new bb/vk
- Aurora RPC tx confirmation flakiness
- Full end-to-end flow (create→sign) not yet demonstrated

FILES MODIFIED:
- contracts/src/verifiers/NoirVerifier.sol (regenerated from bb 20260105)
- contracts/script/DeployVerifierOnly.s.sol (fixed library linking)
- Multiple verifier iterations (V1-V5) documenting debugging journey
- Comprehensive test contracts for precompile validation

DEBUGGING ARTIFACTS:
- 8+ hours investigating SumcheckFailed error
- Tested 5 different verifier deployments
- Validated every layer: circuit, bb, Solidity, precompiles, deployment
- Created minimal reproduction bundles for bug reporting

This work establishes the foundation for V3 with production-ready ZK infrastructure.