# Reproduction Info

## BB Version
```
3.0.0-nightly.20260102
```

## Commands Used

### Generate VK
```bash
cd zk
bb write_vk --scheme ultra_honk --oracle_hash keccak -b ./target/speak_up_zk.json -o ./target/vk_new
```

### Generate Verifier
```bash
bb write_solidity_verifier -k ./target/vk_new/vk -o ../contracts/src/verifiers/NoirVerifierV4.sol
```

### Generate Proof
```bash
nargo execute
bb prove --scheme ultra_honk --oracle_hash keccak -b ./target/speak_up_zk.json -w ./target/speak_up_zk.gz -k ./target/vk_new/vk -o ./failing_proof
```

### Verify Offline (PASSES ✅)
```bash
bb verify --scheme ultra_honk --oracle_hash keccak -p ./failing_proof/proof -i ./failing_proof/public_inputs -k ./target/vk_new/vk
# Output: Proof verified successfully
```

## Deployed Addresses (Aurora Testnet)

- Verifier: 0xd41AC9C40DE689f1a72367B3dDa6F63723eb315f
- PetitionRegistryV2: 0x69Eb2b35EfDD0c8D70c915979A3104C02919593A
- Chain ID: 1313161555
- RPC: https://testnet.aurora.dev

## Public Inputs (hex from failing_proof/public_inputs)
```
[
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x1590729fa9b5bba55d865365abc1fc456bed848bd1f7de0eef37e60f0a8f267f"
]
```

## Error
- **Offline**: bb verify passes ✅
- **On-chain (Aurora)**: Reverts with 0x9fc3a218 (SumcheckFailed) ❌

Same proof, same public inputs, same VK. Works offline, fails on Aurora.
