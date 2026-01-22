export interface ProofData {
  proof: Uint8Array;
  publicInputs: string[];
}

export async function generateSignatureProof(
  credentialSecret: string,
  petitionId: number
): Promise<ProofData> {
  try {
    const response = await fetch('http://localhost:3001/api/generate-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialSecret, petitionId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Proof generation failed');
    }

    const data = await response.json();

    return {
      proof: hexToUint8Array(data.proof),
      publicInputs: data.publicInputs
    };
  } catch (error: any) {
    console.error('Proof generation failed:', error);
    throw new Error(`Failed to generate proof: ${error.message}`);
  }
}

function hexToUint8Array(hex: string): Uint8Array {
  const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) throw new Error("Invalid hex length.");

  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0, j = 0; i < cleaned.length; i += 2, j++) {
    bytes[j] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

export function getCredentialSecret(): string {
  const stored = localStorage.getItem('petition_credential_secret');
  if (stored) return stored;

  const secret = Math.floor(Math.random() * 1000000).toString();
  localStorage.setItem('petition_credential_secret', secret);
  console.log('Generated new credential secret:', secret);
  return secret;
}