# Speak Up V2 - Smart Contracts

UUPS upgradeable smart contracts for the Speak Up petition platform with integrated zero-knowledge proof verification.

## Structure

```
contracts/
├── src/
│   ├── SpeakUpV2.sol          # Main petition contract (upgradeable)
│   ├── proxy/
│   │   └── SpeakUpProxy.sol   # UUPS proxy contract
│   └── verifiers/
│       └── NoirVerifier.sol   # Generated from Noir circuit
├── script/
│   └── Deploy.s.sol           # Deployment scripts
├── test/
│   └── SpeakUpV2.t.sol        # Contract tests
└── foundry.toml               # Foundry configuration
```

## Setup

```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Deploy to Aurora testnet
forge script script/Deploy.s.sol --rpc-url aurora_testnet --broadcast --verify
```

## Contract Architecture

### UUPS Proxy Pattern
- **Proxy Contract**: Immutable entry point, delegates all calls to implementation
- **Implementation Contract**: Contains business logic, upgradeable
- **Upgrade Authority**: Only authorized addresses can upgrade

### ZK Proof Integration
- Verifier contract generated from Noir circuit
- Proofs verified on-chain before petition actions
- Optional ZK mode per petition

## Environment Variables

Create `.env` in this directory:
```
PRIVATE_KEY=your_private_key
AURORASCAN_API_KEY=your_api_key
```

## Gas Optimization

- Storage packing where possible
- CEI (Checks-Effects-Interactions) pattern
- Efficient proof verification gas usage

## Security Considerations

- Reentrancy guards on external calls
- Input validation on all public functions
- Access control for admin functions
- Upgrade authorization checks
