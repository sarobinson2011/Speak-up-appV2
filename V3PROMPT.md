You’re helping me design and implement Speak-Up-appV3 from scratch (brand new architecture). Do NOT assume any existing contracts/code from V2. We previously attempted full on-chain ZK verification (Noir + bb UltraHonk) and learned it’s high-friction (verifier size limits, library linking, toolchain sync). For V3 we want a clean, modular design that ships an MVP quickly using attestations, but is engineered so “full private ZK mode” can be added later as an add-on (one toggle / one module swap), without rewriting core storage or events.

PROJECT GOAL
An anonymous petition platform for institutions (universities/companies/government offices):
- Members can create petitions
- Members can sign petitions anonymously (no public link to identity)
- Members can post ONE comment per petition anonymously
- Comments are AI-moderated off-chain
Threat model: operator is not strongly adversarial; users want social anonymity, not “operator-proof” anonymity. However, we want an optional “strong private mode” for exceptional cases later.

KEY PRODUCT DECISION
Build in 2 milestones:
M1 (MVP, “Standard Privacy”): Attestation-based authorization (cheap, simple, reliable)
M2 (“Strong Privacy” add-on): Full ZK proof verification path (Noir + bb verifier) plugged into the same contract/state model

CRITICAL ENGINEERING PRINCIPLE
Freeze the on-chain state model and event model so both modes produce the same on-chain artifacts:
- nullifier-based one-per-petition enforcement
- identical events for “Signed” and “Commented”
Only the authorization mechanism changes:
- M1: ECDSA attestation signature verification
- M2: ZK verifier.verify(proof, publicInputs)

========================
MILESTONE 1 (ATTESTATIONS MVP) — SPEC
========================

1) Core objects
- Petition: created on-chain (store minimal metadata or pointer)
- Signature: anonymous; record only a nullifier and timestamp/block
- Comment: store off-chain content; on-chain store only commentHash + nullifier

2) Nullifier design (must remain stable into ZK milestone)
Use a nullifier that is unique per (member, petition, action):
- nullifierSign   = H(memberSecret, petitionId, "SIGN")
- nullifierComment= H(memberSecret, petitionId, "COMMENT")
Where H can be keccak256 for MVP; later ZK circuit can use Poseidon/field hash but should output the same 32-byte nullifier format (bytes32). Domain separation is essential.

3) On-chain storage (stable across both milestones)
- mapping(uint256 => mapping(bytes32 => bool)) usedSignNullifier;
- mapping(uint256 => mapping(bytes32 => bool)) usedCommentNullifier;
- petition storage (title/uri/creator/etc.)
- (optional) mapping for commentHash anchored on-chain if desired

4) Events (stable across both milestones)
- PetitionCreated(petitionId, creator, metadataPtr)
- PetitionSigned(petitionId, nullifier)
- PetitionCommented(petitionId, nullifier, commentHash)
No identity info in events.

5) Attestation authorization model (MVP)
We introduce an Authorizer abstraction:
- interface IAuthorizer { 
    function authorizeSign(uint256 petitionId, bytes32 nullifier, bytes calldata authData) external view returns (bool);
    function authorizeComment(uint256 petitionId, bytes32 nullifier, bytes32 commentHash, bytes calldata authData) external view returns (bool);
  }
In M1 we implement:
- AttestationAuthorizer: validates an ECDSA signature from an approved attester key (or multisig) over a structured message:
  - action (SIGN/COMMENT)
  - petitionId
  - nullifier
  - (commentHash if comment)
  - expiry (timestamp)
  - chainId + contract address (domain separation)
This prevents replay and cross-chain misuse.

Core contract (PetitionRegistry) should:
- call authorizer.authorizeSign/authorizeComment
- enforce nullifier uniqueness
- emit events
- NOT know anything about membership systems

6) UX/Backend in MVP
- Membership verification happens off-chain (SSO/email/etc.)
- Backend issues attestations (signed permits) to eligible users
- User submits transaction with attestation to sign/comment
- Comments: user submits comment to backend; backend moderates; backend returns commentHash/permit; user anchors commentHash on-chain (or backend anchors it)

Milestone 1 success criteria:
- Any member can sign anonymously with a backend-issued permit
- One sign + one comment per petition enforced by nullifiers
- No public identity linkage on-chain
- Clean contracts and interfaces that won’t change later

========================
MILESTONE 2 (FULL ZK ADD-ON) — SPEC
========================

Goal: add a “Strong Privacy” mode that removes reliance on the attester for correctness (attester can’t forge). This should be a plug-in module, not a rewrite.

Approach:
- Implement a new ZKAuthorizer contract that also satisfies IAuthorizer.
- ZKAuthorizer holds a verifier address (UltraHonk verifier) and public input format.
- authorizeSign/authorizeComment in ZKAuthorizer:
  - decode authData into (proof, publicInputs)
  - call verifier.verify(proof, publicInputs)
  - check that publicInputs contain:
    - petitionId
    - nullifier
    - (commentHash if comment)
  - return true if valid

Important: PetitionRegistry should not change. Only:
- deploy ZKAuthorizer
- set PetitionRegistry.authorizer = ZKAuthorizer (admin-only, potentially timelocked)
Frontend:
- add a single toggle “Standard” vs “Private”
- Standard: request attestation from backend, submit sign/comment with attestation
- Private: generate proof client-side or server-side, submit sign/comment with proof

ZK Engineering notes (for later, not MVP):
- Noir + bb UltraHonk on EVM is high friction:
  - verifier size must be below EIP-170, often requires library split
  - toolchain must be consistent: Noir version, bb nightly, bb.js if browser
  - Solidity verifier generation sometimes needs small patches (pragmas, custom error patterns)
So keep ZK isolated to ZKAuthorizer module + verifier deployment tooling.

Milestone 2 success criteria:
- Switching authorizer enables proof-based signing/commenting
- Nullifier/state/event model unchanged
- Works on target EVM chain with deployed verifier

========================
REQUEST TO YOU (CLAUDE)
========================

Please design and implement Speak-up-appV3 contracts from scratch following the above milestone plan:

1) Write PetitionRegistry.sol that depends only on IAuthorizer and enforces:
- petition creation
- sign + comment with nullifiers
- emits stable events
- admin function to set authorizer

2) Implement AttestationAuthorizer.sol (MVP)
- EIP-712 preferred (or EIP-191 if simpler) but must include:
  - chainId + verifying contract
  - action + petitionId + nullifier + optional commentHash + expiry
- support rotating attester key (admin controlled)
- support multisig address as attester if possible

3) Provide minimal backend message format examples + frontend call expectations (only interfaces, not full app code unless requested).

4) Leave a clean seam for Milestone 2:
- implement ZKAuthorizer skeleton with the expected authData encoding, but can stub verifier call for now
- document the exact public input layout so the later Noir circuit matches it

The goal is least friction MVP now, with a clear “upgrade path” to strong ZK mode later without breaking storage/events.
