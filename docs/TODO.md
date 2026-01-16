## Required tooling steps/set-up fixes

xxx

## where we are:
Great — this gives us the exact on-chain interface:

The deployable contract is HonkVerifier

The entry point is:

function verify(bytes calldata proof, bytes32[] calldata publicInputs) public view returns (bool)


So you do not want uint256[]. You want a bytes32[], length 18.

Also, note it’s view (not pure) because it uses precompiles.

1) Deploy HonkVerifier

You can deploy HonkVerifier directly (no wrapper needed).

Foundry (example)

From your contracts/ project:

forge build
forge create --rpc-url <RPC> --private-key <KEY> src/verifiers/NoirVerifier.sol:HonkVerifier


(Adjust path to match your repo layout; your file is in src/verifiers/NoirVerifier.sol.)

2) Convert target/public_inputs into bytes32[]

Your ./target/public_inputs file is 64 bytes total, so it’s not 18 newline numbers. It’s almost certainly 18 field elements packed (or encoded) in a binary format for bb’s internal tooling.

You need them in a Solidity-callable list of bytes32 values.

Easiest way (bb has an export command)

Your bb version typically has commands like “write proof/public inputs as fields/hex”. Run:

bb --help | grep -E "public|inputs|field|hex|write" -n


Look for something like:

write_public_inputs

write_public_inputs_as_fields

write_proof_as_fields

If you paste that grep output, I’ll tell you the exact command.

If you want an immediate workaround (no extra bb commands)

We can parse the public_inputs binary into 18 bytes32 values in Node, then call the contract.

First, inspect what bb wrote:

xxd -p ./target/public_inputs | head


If it’s exactly 18 * 32 = 576 bytes, it would be 576 bytes — but yours is 64 bytes, so it’s not raw bytes32 array. That means it’s likely a compact encoding (msgpack, header + bytes, etc.).

So: don’t guess the format. Use bb’s “fields” output if available.

3) Also export the proof into a Solidity-friendly bytes

Your ./target/proof is 14,592 bytes, which is plausible as raw proof bytes to pass as bytes.

But again: depending on bb output format, you may need a 0x... hex string.

The clean flow

Export proof as a hex string (0x...)

Export public inputs as an array of 18 bytes32 (hex strings)

Call HonkVerifier.verify(proofHex, publicInputsBytes32[])

Do this next (one command, then paste output)

Run:

bb --help | head -n 220


I’ll look at the available “export” subcommands on your installed bb and give you the exact commands to produce:

proof.hex (or proof.json)

public_inputs.json as 18 bytes32

Then I’ll give you a minimal Hardhat script (since you’re already in a Node-heavy repo) that reads those files and calls verify() and prints true.
## Deployed Contracts (Aurora Testnet)

- PetitionRegistryV2 Proxy: 0x13A66f2b7FaC2C0afC34E1Cf944f710F342F7034
- HonkVerifier: 0x716e2C0e1Aa76aA4bAa2871273eA44FbC2F83Da3
- Implementation: 0x4E16F198105A43C9Cf4380F78C7E752C1Ef100aB


