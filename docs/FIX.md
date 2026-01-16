# Noir → UltraHonk → Solidity Verifier (EVM / keccak)

This document is a **complete, reproducible walkthrough** for generating an
**EVM-compatible Solidity verifier** from a Noir circuit using **UltraHonk** and
**Barretenberg (`bb`)**.

It records the **exact steps taken**, starting from a broken, misaligned setup and
ending with a working on-chain verifier, including all fixes for version mismatches,
stdlib breaking changes, and CLI pitfalls.

You can drop this file directly into your project’s `docs/` folder.

---

## Environment Assumptions

- Linux / WSL
- Node.js + npm installed
- Solidity ≥ 0.8.21
- Target chain: EVM (Ethereum-compatible)
- Proof system: UltraHonk
- Oracle hash: keccak (required for EVM verification)

---

## 1. Initial State (What Was Broken)

The original setup failed due to **toolchain misalignment** and breaking changes:

- `nargo 0.36.0`
- Multiple incompatible `bb` versions (`0.58.x`, `0.61.x`, `0.82.x`)
- Errors encountered:
  - `Unknown variant index for enum`
  - Missing `write_solidity_verifier`
  - `barretenberg version null` from `bbup`
  - `std::hash::poseidon` no longer available
  - Flag mismatch: `--oracle-hash` vs `--oracle_hash`

### Root Cause

> **Noir, ACIR, and Barretenberg must be version-aligned.**  
Mixing old Noir with newer `bb` (or vice versa) is unsupported and will fail.

---

## 2. Install `noirup` (Noir Version Manager)

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
source ~/.bashrc
Verify installation:

bash
Copy code
which noirup
3. Upgrade Noir to a Compatible Version
Install a modern beta release compatible with current Barretenberg:

bash
Copy code
noirup -v 1.0.0-beta.9
hash -r
nargo --version
Expected output:

java
Copy code
nargo version = 1.0.0-beta.9
4. Install Matching Barretenberg (bb)
Let bbup automatically resolve the correct Barretenberg version based on Noir:

bash
Copy code
bbup
hash -r
bb --version
At this point, the following commands must exist:

bb prove

bb write_vk

bb write_solidity_verifier

5. Fix Poseidon Hash Usage (Breaking Change)
Poseidon hashing was removed from the Noir stdlib and moved to an external library.

❌ Old (no longer valid)
rust
Copy code
std::hash::poseidon::bn254::hash_1(...)
✅ New: External Poseidon Library
Nargo.toml
toml
Copy code
[dependencies]
poseidon = { git = "https://github.com/noir-lang/poseidon", tag = "v0.2.0" }
src/main.nr
rust
Copy code
use dep::std;
use dep::poseidon::bn254;

fn main(credential_secret: Field, petition_id: pub Field, nullifier: pub Field) {
    let credential_hash = bn254::hash_1([credential_secret]);
    let computed_nullifier = bn254::hash_2([credential_secret, petition_id]);

    std::println(computed_nullifier);
    assert(computed_nullifier == nullifier);

    let _ = credential_hash;
}
6. Compile the Circuit
bash
Copy code
rm -rf target
nargo compile
Expected artifact:

bash
Copy code
target/speak_up_zk.json
7. Generate a Witness
bash
Copy code
nargo execute --force
Expected output:

bash
Copy code
target/speak_up_zk.gz
8. Generate Proof + Verification Key (EVM / keccak)
This is the canonical and recommended flow.

bash
Copy code
bb prove \
  --scheme ultra_honk \
  --oracle_hash keccak \
  -b ./target/speak_up_zk.json \
  -w ./target/speak_up_zk.gz \
  --write_vk \
  -o ./target
Generated files:

target/proof

target/public_inputs

target/vk

9. Generate the Solidity Verifier
bash
Copy code
mkdir -p ../contracts/src/verifiers

bb write_solidity_verifier \
  -k ./target/vk \
  -o ../contracts/src/verifiers/NoirVerifier.sol
Success message:

css
Copy code
Solidity verifier saved to "../contracts/src/verifiers/NoirVerifier.sol"
10. Solidity Verifier Interface
The generated Solidity file contains the deployable verifier contract:

solidity
Copy code
contract HonkVerifier
Verification Entry Point
solidity
Copy code
function verify(
    bytes calldata proof,
    bytes32[] calldata publicInputs
) public view returns (bool)
Important Constants
solidity
Copy code
NUMBER_OF_PUBLIC_INPUTS = 18
Even if only two inputs are marked pub in the Noir circuit, UltraHonk adds
additional public metadata inputs. This is expected behavior.

11. Artifacts That Must Stay in Sync
These artifacts must always be regenerated together:

target/speak_up_zk.json

target/vk

NoirVerifier.sol

Proofs generated with bb prove

If any of these change, regenerate all of them.

12. Common Failure Causes (Avoid These)
Mixing Noir 0.x with modern Barretenberg

Manually pinning incompatible bb versions

Using --oracle-hash instead of --oracle_hash

Using removed std::hash::poseidon

Regenerating proofs without regenerating the verifier

Passing uint256[] instead of bytes32[] to the verifier

13. Final Result
You now have:

A modern Noir circuit

UltraHonk proof system

keccak-based EVM verifier

Deployable Solidity verifier contract

Valid proof and public inputs

This setup is production-correct, EVM-compatible, and fully reproducible.

14. Suggested Next Steps
Export public_inputs as bytes32[] for Solidity calls

Add Foundry or Hardhat deployment and verification scripts

Benchmark verifier gas costs

Explore recursive verification or proof aggregation

