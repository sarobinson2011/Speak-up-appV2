# Speak Up V2 - Quick Start Guide

## Project Structure Created ✅

```
speak-up-appv2/
├── contracts/          # Foundry smart contracts
│   ├── src/           # Contract source code
│   │   ├── proxy/     # UUPS proxy contracts
│   │   └── verifiers/ # Noir-generated verifiers
│   ├── script/        # Deployment scripts
│   ├── test/          # Contract tests
│   └── foundry.toml   # Foundry configuration
│
├── backend/           # Node.js Express API
│   ├── src/          # TypeScript source
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Business logic
│   └── package.json  # Dependencies
│
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── app/      # Main app component
│   │   ├── components/ # UI components
│   │   ├── lib/
│   │   │   ├── contracts/ # ABIs and addresses
│   │   │   └── noir/      # ZK proof utilities
│   │   └── hooks/    # Custom React hooks
│   └── package.json  # Dependencies
│
├── zk/                # Noir ZK circuits
│   ├── src/
│   │   └── main.nr   # Circuit implementation
│   ├── Nargo.toml    # Circuit configuration
│   └── Prover.toml   # Example inputs
│
├── scripts/           # Automation
│   └── deploy.sh     # Full stack deployment
│
└── docs/
    └── ARCHITECTURE.md # System architecture
```

## Stage 1: Zero-Knowledge Circuits (Current Phase)

### Prerequisites
```bash
# Install Noir toolchain
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Verify installation
nargo --version
```

### Getting Started with ZK

```bash
cd speak-up-appv2/zk

# 1. Check circuit syntax
nargo check

# 2. Compile circuit
nargo compile

# 3. Test with example inputs (edit Prover.toml first)
nargo prove

# 4. Verify the proof
nargo verify

# 5. Generate Solidity verifier
nargo codegen-verifier
# This creates the verifier contract for deployment
```

### Circuit Development Loop

1. **Edit `src/main.nr`** - Implement your eligibility logic
2. **Update `Prover.toml`** - Add test inputs
3. **Run `nargo check`** - Validate syntax
4. **Run `nargo prove`** - Generate proof
5. **Run `nargo verify`** - Verify it works
6. **Repeat** until satisfied

### What to Implement First

Start with a simple proof - just prove you know a secret:

```noir
fn main(
    user_secret: Field,      // Private input
    petition_id: pub Field   // Public input
) {
    // Prove: I know a secret that hashes to a specific value
    // This proves eligibility without revealing the secret
    
    assert(user_secret != 0);
    // Add real logic here
}
```

Then expand to:
- Merkle tree membership proofs
- Nullifiers (prevent double-signing)
- Complex eligibility criteria

## Stage 2: Smart Contracts (Next Phase)

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

### Setup Contracts

```bash
cd speak-up-appv2/contracts

# Install dependencies (OpenZeppelin, etc.)
forge install OpenZeppelin/openzeppelin-contracts-upgradeable

# Build contracts
forge build

# Run tests
forge test

# Deploy to Aurora testnet
forge script script/Deploy.s.sol --rpc-url aurora_testnet --broadcast
```

## Stage 3: Frontend (Final Phase)

### Setup Frontend

```bash
cd speak-up-appv2/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Development Workflow

### Daily Development
1. **Work in ZK first** - Get circuit working in isolation
2. **Integrate with contracts** - Move verifier, test on-chain
3. **Build frontend** - Connect proof generation to UI

### Testing Strategy
- **ZK**: Test circuits with `nargo test`
- **Contracts**: Test with `forge test`
- **Frontend**: Manual testing + eventual E2E tests
- **Integration**: Test full flow locally

### Deployment Pipeline

```bash
# Automated deployment (when ready)
./scripts/deploy.sh --deploy

# Manual steps:
# 1. Compile ZK circuit
# 2. Generate Solidity verifier
# 3. Deploy contracts to Aurora
# 4. Update frontend with contract addresses
# 5. Deploy frontend to hosting
```

## Key Files to Start With

### Stage 1 (ZK) - Start Here
- `zk/src/main.nr` - Circuit implementation
- `zk/Prover.toml` - Test inputs
- `zk/README.md` - Detailed ZK instructions

### Stage 2 (Contracts)
- `contracts/src/SpeakUpV2.sol` - Main contract (to be created)
- `contracts/src/proxy/SpeakUpProxy.sol` - UUPS proxy (to be created)
- `contracts/test/SpeakUpV2.t.sol` - Contract tests (to be created)

### Stage 3 (Frontend)
- `frontend/src/app/App.tsx` - Main app (already created)
- `frontend/src/lib/noir/` - Proof generation (to be created)
- `frontend/src/lib/contracts/` - Contract interaction (to be created)

## Environment Setup

Each package needs environment variables:

### Contracts (`.env` in contracts/)
```bash
PRIVATE_KEY=your_private_key_here
AURORASCAN_API_KEY=your_api_key_here
```

### Backend (`.env` in backend/)
```bash
PORT=3001
AURORA_RPC_URL=https://testnet.aurora.dev
CONTRACT_ADDRESS=deployed_contract_address
```

### Frontend (`.env` in frontend/)
```bash
VITE_AURORA_RPC_URL=https://testnet.aurora.dev
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## Next Steps

1. ✅ Structure created
2. ⏳ **Start ZK circuit development** ← You are here
3. ⏳ Implement upgradeable contracts
4. ⏳ Build frontend UI

## Resources

- [Noir Documentation](https://noir-lang.org)
- [Foundry Book](https://book.getfoundry.sh/)
- [Aurora Docs](https://docs.aurora.dev/)
- [React Docs](https://react.dev/)

## Getting Help

Each package has its own detailed README:
- [ZK Circuits Guide](./zk/README.md)
- [Smart Contracts Guide](./contracts/README.md)
- [Backend Guide](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

---

**Ready to start?** Head to `zk/` and begin circuit development! 🚀
