# Speak Up V2 - Architecture

## System Overview

Speak Up V2 is a zero-knowledge proof-enabled petition platform built on Aurora (NEAR's EVM layer). Users can create and sign petitions anonymously while proving eligibility without revealing their identity.

## Technology Stack

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Foundry
- **Pattern**: UUPS (Universal Upgradeable Proxy Standard)
- **Network**: Aurora Testnet (EVM-compatible)

### Zero-Knowledge Proofs
- **Framework**: Noir
- **Proof System**: Plonk with Barretenberg backend
- **Generation**: Client-side in browser
- **Verification**: On-chain via Solidity verifier

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Purpose**: Optional API for indexing and metadata

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Blockchain**: ethers.js v6
- **ZK Integration**: @noir-lang/noir_js

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└─────┬───────┘
      │
      ├──────────────────┐
      │                  │
      v                  v
┌─────────────┐    ┌──────────────┐
│ ZK Circuit  │    │   ethers.js  │
│ (Noir WASM) │    │ (Web3 calls) │
└─────┬───────┘    └──────┬───────┘
      │                   │
      │ Generate          │ Sign & Send
      │ Proof             │ Transaction
      │                   │
      v                   v
┌─────────────────────────────────┐
│      Smart Contract (Aurora)    │
│                                 │
│  ┌──────────────────────────┐  │
│  │   UUPS Proxy             │  │
│  │   (Fixed Address)        │  │
│  └──────────┬───────────────┘  │
│             │ delegatecall      │
│             v                   │
│  ┌──────────────────────────┐  │
│  │   Implementation         │  │
│  │   (Upgradeable Logic)    │  │
│  │   - createPetition()     │  │
│  │   - signWithProof()      │  │
│  │   - verifyProof()        │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │   Noir Verifier          │  │
│  │   (Generated Contract)   │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## Data Flow

### Creating a Petition
1. User fills petition form in frontend
2. Frontend calls `createPetition()` on smart contract
3. Contract emits `PetitionCreated` event
4. Backend indexes event (optional)
5. Frontend updates UI

### Signing with ZK Proof
1. User clicks "Sign Petition"
2. Frontend generates ZK proof in browser:
   - Inputs: `user_secret` (private), `petition_id` (public)
   - Circuit proves eligibility without revealing identity
   - Proof generation takes ~2-10 seconds
3. Frontend calls `signWithProof(petitionId, proof)` on contract
4. Contract verifies proof via Noir verifier
5. If valid, signature is recorded
6. Contract emits `PetitionSigned` event

## Smart Contract Architecture

### UUPS Proxy Pattern
```
User → Proxy (storage) → delegatecall → Implementation (logic)
```

**Benefits:**
- Fixed address for users
- Upgradeable logic without data migration
- Lower gas costs than transparent proxy
- Upgrade authorization built into implementation

### Storage Layout
```solidity
struct Petition {
    uint256 id;
    address creator;
    string title;
    string description;
    uint256 signatureCount;
    bool requiresZkProof;
    uint256 createdAt;
    mapping(address => bool) hasSigned;
}
```

### Security Measures
- ReentrancyGuard on external calls
- Access control for admin functions
- Input validation on all public functions
- CEI (Checks-Effects-Interactions) pattern
- Upgrade authorization checks

## Zero-Knowledge Circuit Design

### Circuit Logic (Noir)
```noir
fn main(
    user_secret: Field,      // Private witness
    petition_id: pub Field,  // Public input
    eligibility_root: pub Field
) {
    // Prove eligibility without revealing identity
    // Implementation depends on eligibility criteria
}
```

### What We Prove
- User possesses a valid secret/credential
- User is eligible for this specific petition
- User hasn't signed before (nullifier)

### What We Don't Reveal
- User's identity
- User's specific credential
- Why user is eligible

## Upgrade Strategy

### Upgrade Process
1. Deploy new implementation contract
2. Call `upgradeTo(newImplementation)` on proxy
3. Proxy updates implementation pointer
4. All future calls use new logic
5. Storage remains intact

### Upgrade Authorization
Only addresses with `UPGRADER_ROLE` can upgrade.

### Testing Upgrades
1. Deploy V1 → Test
2. Deploy V2 → Test standalone
3. Upgrade V1 → V2 on testnet
4. Verify storage preservation
5. Deploy to mainnet

## Performance Considerations

### ZK Proof Generation
- **Time**: 2-10 seconds (browser-dependent)
- **Memory**: ~500MB WASM
- **Caching**: Circuit WASM cached after first load

### Gas Costs (Aurora Testnet)
- Create petition: ~200k gas
- Sign with proof: ~500k gas (includes verification)
- Verify proof: ~300k gas

### Scalability
- Proofs verified on-chain (no trusted setup needed post-circuit)
- Storage optimized with mappings
- Events for off-chain indexing

## Security Model

### Threat Model
- **Malicious users**: Cannot forge proofs or sign multiple times
- **Replay attacks**: Prevented via petition-specific proofs
- **Privacy**: Identity never revealed on-chain
- **Contract bugs**: Mitigated via upgradability

### Audit Checklist
- [ ] Smart contract audit
- [ ] ZK circuit review
- [ ] Frontend security review
- [ ] Key management audit
- [ ] Upgrade mechanism review

## Deployment Environments

### Testnet (Current)
- Network: Aurora Testnet
- Purpose: Development and testing
- Faucet: https://aurora.dev/faucet

### Mainnet (Future)
- Network: Aurora Mainnet
- NEAR integration for gas sponsorship
- Multi-wallet support (MetaMask, NEAR Wallet)

## Monitoring and Observability

### On-chain Events
- `PetitionCreated(id, creator, title)`
- `PetitionSigned(id, signer)` - Note: signer could be nullifier
- `Upgraded(newImplementation)`

### Off-chain Metrics
- Proof generation success rate
- Average proof generation time
- Gas costs per transaction
- User adoption metrics

## Future Enhancements

### Phase 2
- Delegated proof generation (server-side option)
- Multi-signature petitions
- Petition expiration/deadlines
- Signature goals

### Phase 3
- NEAR wallet integration
- Cross-chain petitions
- DAO integration
- Token-gated petitions

### Phase 4
- Advanced eligibility circuits (Merkle trees, credentials)
- Gasless transactions (meta-transactions)
- Mobile app
- Petition templates
