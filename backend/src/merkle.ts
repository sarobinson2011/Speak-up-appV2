import { buildPoseidon } from 'circomlibjs';

const approvedHashes: string[] = [];
let poseidon: any = null;

async function initPoseidon() {
    if (!poseidon) {
        poseidon = await buildPoseidon();
    }
    return poseidon;
}

function hashSecret(secret: string): string {
    if (!poseidon) throw new Error('Poseidon not initialized');

    // Convert secret to BigInt
    const buf = Buffer.from(secret);
    const bigInt = BigInt('0x' + buf.toString('hex'));

    // Hash with Poseidon
    const hash = poseidon.F.toString(poseidon([bigInt]));
    return hash;
}

export async function addVerifiedUser(secret: string) {
    await initPoseidon();

    const hash = hashSecret(secret);

    if (!approvedHashes.includes(hash)) {
        approvedHashes.push(hash);
        console.log(`Added approved hash: ${hash}`);
    }
}

export function getApprovedHashes(): string[] {
    return [...approvedHashes];
}

export async function isApproved(secret: string): Promise<boolean> {
    await initPoseidon();
    const hash = hashSecret(secret);
    return approvedHashes.includes(hash);
}