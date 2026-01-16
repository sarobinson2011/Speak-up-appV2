import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { moderateComment } from './moderation.js';
import { addVerifiedUser, getApprovedHashes, isApproved } from './merkle.js';

dotenv.config();

// Validate environment variables
if (!process.env.MODERATOR_PRIVATE_KEY) {
  throw new Error('MODERATOR_PRIVATE_KEY not set in .env');
}
if (!process.env.PETITION_REGISTRY_ADDRESS) {
  throw new Error('PETITION_REGISTRY_ADDRESS not set in .env');
}
if (!process.env.AURORA_TESTNET_RPC) {
  throw new Error('AURORA_TESTNET_RPC not set in .env');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Contract setup
const PETITION_REGISTRY_ADDRESS = process.env.PETITION_REGISTRY_ADDRESS;
const PETITION_REGISTRY_ABI = [
  'function approveComment(uint256 petitionId, uint256 commentIndex)',
  'function petitionComments(uint256 petitionId, uint256 index) view returns (address author, string content, bool approved, uint256 timestamp)',
  'function getCommentCount(uint256 petitionId) view returns (uint256)'
];

const provider = new ethers.JsonRpcProvider(process.env.AURORA_TESTNET_RPC);
const wallet = new ethers.Wallet(process.env.MODERATOR_PRIVATE_KEY, provider);
const contract = new ethers.Contract(PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI, wallet) as ethers.Contract & {
  approveComment: (petitionId: number, commentIndex: number) => Promise<ethers.ContractTransactionResponse>;
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Admin: Add approved credential
app.post('/api/admin/add-credential', async (req, res) => {
  const { secret } = req.body;

  if (!secret) {
    return res.status(400).json({ error: 'secret required' });
  }

  await addVerifiedUser(secret);

  res.json({
    success: true,
    totalCredentials: getApprovedHashes().length
  });
});

// Get all approved hashes (public)
app.get('/api/approved-hashes', (req, res) => {
  res.json({ hashes: getApprovedHashes() });
});

// Check if secret is approved
app.post('/api/check-credential', async (req, res) => {
  const { secret } = req.body;

  if (!secret) {
    return res.status(400).json({ error: 'secret required' });
  }

  const approved = await isApproved(secret);
  res.json({ approved });
});

// Moderate and approve comment
app.post('/api/moderate-comment', async (req, res) => {
  const { petitionId, commentIndex, content } = req.body;

  if (petitionId === undefined || commentIndex === undefined || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log(`Moderating comment ${commentIndex} on petition ${petitionId}`);

    // AI moderation
    const modResult = await moderateComment(content, process.env.OPENAI_API_KEY!);
    console.log('Moderation result:', modResult);

    if (modResult.approved && modResult.confidence >= 0.7) {
      // Auto-approve
      console.log('Auto-approving comment...');
      const tx = await contract.approveComment(petitionId, commentIndex);
      await tx.wait();

      res.json({
        status: 'approved',
        reason: modResult.reason,
        txHash: tx.hash
      });
    } else if (modResult.confidence < 0.7) {
      // Low confidence - flag for manual review
      res.json({
        status: 'pending_review',
        reason: 'Flagged for manual review',
        confidence: modResult.confidence
      });
    } else {
      // Rejected
      res.json({
        status: 'rejected',
        reason: modResult.reason
      });
    }
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});