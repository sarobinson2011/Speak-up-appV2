# Speak Up V2 - Zero-Knowledge Circuits

Noir circuits for anonymous petition eligibility proofs.

## Overview

These circuits allow users to prove they're eligible to sign a petition without revealing their identity or specific eligibility criteria.

## Structure

```
zk/
├── src/
│   └── main.nr         # Main circuit logic
├── Nargo.toml          # Circuit package configuration
└── Prover.toml         # Example prover inputs
```

## Prerequisites

Install Noir toolchain:
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup
```

Verify installation:
```bash
nargo --version
```

## Development Workflow

### 1. Build Circuit
```bash
nargo check    # Type check
nargo compile  # Compile to bytecode
```

### 2. Generate Proof (Example)
```bash
nargo prove
```

### 3. Verify Proof
```bash
nargo verify
```

### 4. Generate Solidity Verifier
```bash
nargo codegen-verifier
```

This generates a Solidity contract that can verify proofs on-chain. Move it to:
```
../contracts/src/verifiers/NoirVerifier.sol
```

## Circuit Design

### Private Inputs (Witness)
- `user_secret`: User's private key or secret identifier
- Additional eligibility proofs (to be defined)

### Public Inputs
- `petition_id`: Which petition they're signing
- `eligibility_root`: Merkle root or other public eligibility parameter

### What We're Proving
"I am eligible to sign petition X" without revealing:
- Who I am
- Why I'm eligible
- My specific eligibility criteria

## Testing

```bash
# Run circuit tests
nargo test

# Test with specific inputs
nargo execute witness_name
```

## Proof Generation Performance

- Circuit complexity: TBD gates
- Proof generation time: ~X seconds (client-side)
- Verification time: ~X ms (on-chain)
- Gas cost: ~X gas (Aurora testnet)

## Integration Points

1. **Frontend**: Generates proofs in browser using `@noir-lang/noir_js`
2. **Smart Contract**: Verifies proofs using generated Solidity verifier
3. **Backend** (optional): Can assist with proof generation if client-side is too slow

## Security Considerations

- Never expose private inputs
- Validate all public inputs on-chain
- Consider replay attack prevention
- Audit circuit logic thoroughly

## Resources

- [Noir Documentation](https://noir-lang.org)
- [Noir Examples](https://github.com/noir-lang/noir-examples)
