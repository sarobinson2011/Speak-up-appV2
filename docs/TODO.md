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

