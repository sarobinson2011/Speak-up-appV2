import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI } from '../lib/contracts'
import { generateSignatureProof, getCredentialSecret } from '../lib/noir/prover';

interface Petition {
  id: number
  creator: string
  title: string
  description: string
  deadline: bigint
  signatureCount: bigint
  active: boolean
}

interface Comment {
  author: string
  content: string
  approved: boolean
  timestamp: bigint
}

function App() {
  const [account, setAccount] = useState<string>('')
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('30')
  const [selectedPetition, setSelectedPetition] = useState<number | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const newProvider = new ethers.BrowserProvider(window.ethereum!)
          setProvider(newProvider)
          await loadPetitions(newProvider)
        } else {
          // Disconnected
          setAccount('')
          setProvider(null)
          setPetitions([])
        }
      })
    }
  }, [])

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!)
        const accounts = await provider.send('eth_requestAccounts', [])
        setAccount(accounts[0])
        setProvider(provider)
        await loadPetitions(provider)
      } catch (error) {
        console.error('Error connecting:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  async function loadPetitions(prov: ethers.BrowserProvider) {
    try {
      const contract = new ethers.Contract(PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI, prov)
      const count = await contract.petitionCounter()
      const loadedPetitions: Petition[] = []

      for (let i = 0; i < count; i++) {
        const result = await contract.getPetition(i)
        loadedPetitions.push({
          id: i,
          creator: result[0],
          title: result[1],
          description: result[2],
          deadline: result[4], // expiresAt in V2
          signatureCount: result[5],
          active: result[6]
        })
      }

      setPetitions(loadedPetitions)
    } catch (error) {
      console.error('Error loading petitions:', error)
    }
  }

  async function loadComments(petitionId: number, prov: ethers.BrowserProvider) {
    try {
      const contract = new ethers.Contract(PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI, prov)
      const count = await contract.getCommentCount(petitionId)
      const loadedComments: Comment[] = []

      for (let i = 0; i < count; i++) {
        const result = await contract.getComment(petitionId, i)
        loadedComments.push({
          author: result[0],
          content: result[1],
          approved: result[2],
          timestamp: result[3]
        })
      }

      setComments(loadedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  async function createPetition() {
    if (!provider) return

    try {
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI, signer)

      const tx = await contract.createPetition(title, description, duration)
      await tx.wait()

      alert('Petition created!')
      setShowCreate(false)
      setTitle('')
      setDescription('')
      await loadPetitions(provider)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  async function signPetition(petitionId: number) {
    if (!provider) return

    try {
      const credentialSecret = getCredentialSecret();
      console.log('Using credential secret:', credentialSecret);

      alert('Generating ZK proof... This may take 10-30 seconds.');
      const { proof, publicInputs } = await generateSignatureProof(
        credentialSecret,
        petitionId
      );

      console.log('Proof generated!');
      console.log('Proof length:', proof.length);
      console.log('Public inputs from proof:', publicInputs);

      // Fix public inputs - the proof returns them in wrong format
      const correctedPublicInputs = [
        '0x' + petitionId.toString(16).padStart(64, '0'),
        publicInputs[1] // Keep the nullifier
      ];

      console.log('Corrected public inputs:', correctedPublicInputs);

      const proofHex = '0x' + Array.from(proof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PETITION_REGISTRY_ADDRESS,
        PETITION_REGISTRY_ABI,
        signer
      );

      const tx = await contract.signPetition(
        petitionId,
        proofHex,
        correctedPublicInputs
      );

      alert('Submitting proof to blockchain...');
      await tx.wait();

      alert('Petition signed anonymously with ZK proof! ✅');
      await loadPetitions(provider);
    } catch (error: any) {
      console.error('ZK signing error:', error);
      alert('Error: ' + error.message);
    }
  }

  async function submitComment(petitionId: number) {
    if (!provider || !newComment.trim()) return

    try {
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PETITION_REGISTRY_ADDRESS, PETITION_REGISTRY_ABI, signer)

      // Submit comment to blockchain
      const tx = await contract.submitComment(petitionId, newComment)
      await tx.wait()

      // Get the comment index (count - 1)
      const commentCount = await contract.getCommentCount(petitionId)
      const commentIndex = Number(commentCount) - 1

      // Send to backend for AI moderation
      const response = await fetch('http://localhost:3001/api/moderate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petitionId,
          commentIndex,
          content: newComment
        })
      })

      const result = await response.json()

      if (result.status === 'approved') {
        alert('Comment approved and posted!')
      } else if (result.status === 'pending_review') {
        alert('Comment submitted for manual review')
      } else {
        alert('Comment rejected: ' + result.reason)
      }

      setNewComment('')
      await loadComments(petitionId, provider)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Speak Up - Anonymous Petitions</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>

          <button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : 'Create Petition'}
          </button>

          {showCreate && (
            <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
              <h3>Create New Petition</h3>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '100px' }}
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <button onClick={createPetition}>Submit Petition</button>
            </div>
          )}

          <h2>Petitions ({petitions.length})</h2>

          {petitions.length === 0 ? (
            <p>No petitions yet. Create the first one!</p>
          ) : (

            petitions.map((p) => (
              <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <p>Signatures: {p.signatureCount.toString()}</p>
                <button onClick={() => signPetition(p.id)}>Sign Petition</button>
                <button
                  onClick={() => {
                    if (selectedPetition === p.id) {
                      setSelectedPetition(null)  // Hide
                    } else {
                      setSelectedPetition(p.id)   // Show
                      if (provider) loadComments(p.id, provider)
                    }
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  {selectedPetition === p.id ? 'Hide Comments' : 'View Comments'}
                </button>

                {selectedPetition === p.id && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h4>Comments ({comments.length})</h4>

                    <div style={{ marginBottom: '20px' }}>
                      <textarea
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                      />
                      <button onClick={() => submitComment(p.id)}>Submit Comment</button>
                    </div>

                    {comments.length === 0 ? (
                      <p>No comments yet.</p>
                    ) : (
                      comments.filter(c => c.approved).map((c, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                          <p style={{ margin: '5px 0' }}>{c.content}</p>
                          <small style={{ color: '#666' }}>
                            By: {c.author.slice(0, 6)}...{c.author.slice(-4)}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))

          )}
        </div>
      )}
    </div>
  )
}

export default App