## Deployed Contracts (Aurora Testnet)

- PetitionRegistryV2 Proxy: 0x13A66f2b7FaC2C0afC34E1Cf944f710F342F7034
- HonkVerifier: 0x716e2C0e1Aa76aA4bAa2871273eA44FbC2F83Da3
- Implementation: 0x4E16F198105A43C9Cf4380F78C7E752C1Ef100aB



## AI Moderation Improvement

### Objective
Validate and refine the GPT-4 moderation prompt to ensure consistent, fair content moderation.

### Tasks
- [ ] Test suite: Create 20-30 sample comments covering edge cases:
  - Strong political speech (should pass)
  - Profanity without hate (should pass)
  - Borderline cases (test consistency)
  - Clear violations (should reject)
  - Ambiguous content (manual review)
- [ ] Run batch tests and log results
- [ ] Analyze false positives/negatives
- [ ] Tune prompt based on results
- [ ] Document moderation policy and threshold rationale
- [ ] Consider prompt versioning for audit trail

### Current Settings
- Model: GPT-4
- Temperature: 0.3
- Auto-approve threshold: ≥0.7 confidence
- Manual review: <0.7 confidence
- Test trigger: "buckleyourseatbeltdorothy"


## Current Status - V2 MVP Nearly Complete! 🎉

### What's Working ✅
- Full V2 stack deployed and operational
- Smart contracts on Aurora testnet (upgradeable UUPS pattern)
- Backend running with AI moderation (GPT-4)
- Frontend with full petition/comment UI
- **CLIENT-SIDE ZK PROOF GENERATION WORKING!**
  - Proof generates in browser (5,920 bytes)
  - Uses Noir 1.0.0-beta.18 + bb.js with keccak
  - **Local verification passes!**
  - Public inputs correct
  
### Deployed Addresses (Aurora Testnet)
- PetitionRegistryV2 Proxy: `0x13A66f2b7FaC2C0afC34E1Cf944f710F342F7034`
- HonkVerifier (OLD): `0x716e2C0e1Aa76aA4bAa2871273eA44FbC2F83Da3`
- Implementation: `0x4E16F198105A43C9Cf4380F78C7E752C1Ef100aB`

### Final Blocker ⏳
On-chain verification failing with `0xed74ac0a` (likely proof format mismatch between nightly builds).

**Root cause:** Deployed verifier generated with different bb nightly than current bb.js version.

### Next Session - The Summit Push 🚀
1. Match exact bb/bb.js versions from noir-examples
2. Regenerate verifier with matching nightly
3. Deploy new verifier (or upgrade existing contract)
4. **CLAIM VICTORY** 🏆

