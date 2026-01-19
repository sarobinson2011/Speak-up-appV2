import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend, Barretenberg } from '@aztec/bb.js';
import { poseidon2 } from 'poseidon-lite';
import circuit from './speak_up_zk.json';

export interface ProofData {
  proof: Uint8Array;
  publicInputs: string[];
}

function computeNullifier(credentialSecret: string, petitionId: string): string {
  const secret = BigInt(credentialSecret);
  const petition = BigInt(petitionId);
  const nullifier = poseidon2([secret, petition]);
  return '0x' + nullifier.toString(16).padStart(64, '0');
}

export async function generateSignatureProof(
  credentialSecret: string,
  petitionId: number
): Promise<ProofData> {
  try {
    const api = await Barretenberg.new();
    const backend = new UltraHonkBackend(circuit.bytecode as any, api);

    const noir = new Noir(circuit as any);

    const nullifier = computeNullifier(credentialSecret, petitionId.toString());

    const inputs = {
      credential_secret: credentialSecret,
      petition_id: petitionId.toString(),
      nullifier: nullifier
    };

    console.log('Generating proof with inputs:', inputs);

    const { witness } = await noir.execute(inputs);

    // CRITICAL: Use keccak option to match on-chain verifier
    const proof = await backend.generateProof(witness, { keccak: true });

    console.log('Proof generated successfully');
    console.log('Verifying proof locally with keccak...');

    // Verify locally before sending to chain
    const verified = await backend.verifyProof(proof, { keccak: true });
    if (!verified) {
      throw new Error('Proof failed local verification!');
    }

    console.log('✅ Proof verified locally');

    return {
      proof: proof.proof,
      publicInputs: proof.publicInputs
    };
  } catch (error) {
    console.error('Proof generation failed:', error);
    throw new Error(`Failed to generate proof: ${error}`);
  }
}

export function getCredentialSecret(): string {
  const stored = localStorage.getItem('petition_credential_secret');
  if (stored) return stored;

  const secret = Math.floor(Math.random() * 1000000).toString();
  localStorage.setItem('petition_credential_secret', secret);
  console.log('Generated new credential secret:', secret);
  return secret;
}