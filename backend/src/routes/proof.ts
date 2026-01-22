import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const execAsync = promisify(exec);

const ZK_DIR = path.join(__dirname, '../../../zk');
const TEMP_DIR = path.join(__dirname, '../../../temp');

fs.mkdir(TEMP_DIR, { recursive: true });

interface ProofRequest {
    credentialSecret: string;
    petitionId: number;
}

router.post('/generate-proof', async (req, res) => {
    const { credentialSecret, petitionId }: ProofRequest = req.body;

    if (!credentialSecret || typeof petitionId !== 'number') {
        return res.status(400).json({ error: 'Invalid inputs' });
    }

    const tempId = crypto.randomBytes(8).toString('hex');
    const proverPath = path.join(ZK_DIR, `Prover_${tempId}.toml`);
    const witnessPath = path.join(TEMP_DIR, `witness_${tempId}.gz`);
    const proofPath = path.join(TEMP_DIR, `proof_${tempId}`);

    try {
        await fs.writeFile(proverPath, `credential_secret = "${credentialSecret}"\npetition_id = "${petitionId}"\n`);

        await execAsync(`cd ${ZK_DIR} && nargo execute --prover-name Prover_${tempId}`, { shell: '/bin/bash' });

        await execAsync(`mv ${ZK_DIR}/target/speak_up_zk.gz ${witnessPath}`, { shell: '/bin/bash' });

        await execAsync(`cd ${ZK_DIR} && bb prove --scheme ultra_honk --oracle_hash keccak -b ./target/speak_up_zk.json -w ${witnessPath} -k ./target/vk_new/vk -o ${proofPath}`, { shell: '/bin/bash' });

        const proofHex = await fs.readFile(`${proofPath}/proof`, 'hex');
        const publicInputsBinary = await fs.readFile(`${proofPath}/public_inputs`);

        // Parse binary public inputs (32 bytes each)
        const publicInputs: string[] = [];
        for (let i = 0; i < publicInputsBinary.length; i += 32) {
            const chunk = publicInputsBinary.subarray(i, i + 32);
            publicInputs.push('0x' + chunk.toString('hex'));
        }

        await Promise.all([
            fs.unlink(proverPath).catch(() => { }),
            fs.unlink(witnessPath).catch(() => { }),
            fs.rm(proofPath, { recursive: true, force: true }).catch(() => { })
        ]);

        res.json({ proof: '0x' + proofHex, publicInputs });

    } catch (error: any) {
        console.error('Proof generation error:', error);
        res.status(500).json({ error: 'Proof generation failed', details: error.message });
    }
});

export default router;