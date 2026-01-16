# Speak Up v2

Zero-knowledge proof-enabled petition platform with upgradeable smart contracts.

## Project Structure

```
speak-up-appv2/
├── contracts/    # Foundry smart contracts (UUPS upgradeable)
├── backend/      # Node.js API server
├── frontend/     # React web application
├── zk/           # Noir zero-knowledge circuits
├── scripts/      # Build and deployment automation
└── docs/         # Architecture and deployment documentation
```

## Development Roadmap

### Stage 1: Zero-Knowledge Circuits (Current)
- Implement Noir circuit for petition eligibility proofs
- Generate Solidity verifier contract
- Test proof generation and verification loop

### Stage 2: Upgradeable Smart Contracts
- Implement UUPS proxy pattern
- Integrate ZK verifier into petition contract
- Deploy to Aurora testnet

### Stage 3: Frontend Enhancement
- Upgrade UI component library
- Integrate proof generation
- Polish user experience

## Getting Started

Each package has its own README with specific setup instructions:
- [Contracts Setup](./contracts/README.md)
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)
- [ZK Circuits Setup](./zk/README.md)

## Prerequisites

- Node.js v18+
- Foundry
- Nargo (Noir toolchain)
- pnpm/yarn/npm

## License

MIT
