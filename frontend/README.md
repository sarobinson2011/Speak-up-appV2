# Speak Up V2 - Frontend

Modern React frontend for the Speak Up petition platform with zero-knowledge proof integration.

## Structure

```
frontend/
├── src/
│   ├── app/              # Main app component and routing
│   ├── components/       # Reusable UI components
│   ├── lib/
│   │   ├── contracts/    # Smart contract ABIs and addresses
│   │   └── noir/         # ZK proof generation utilities
│   ├── hooks/            # Custom React hooks
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── index.html            # HTML template
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router** - Client-side routing
- **ethers.js** - Blockchain interaction
- **@noir-lang/noir_js** - ZK proof generation

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

Development server runs on `http://localhost:5173`

### Environment Variables

Create `.env` file:
```
VITE_AURORA_RPC_URL=https://testnet.aurora.dev
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### ZK Proof Integration

Proofs are generated client-side using `@noir-lang/noir_js`:

```typescript
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

// Load circuit
const circuit = await fetch('/circuit.json').then(r => r.json());
const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit, backend);

// Generate proof
const inputs = { user_secret: '0x...', petition_id: 1 };
const proof = await noir.generateProof(inputs);
```

## Component Structure (Stage 3)

Will be organized with:
- UI components (shadcn/ui or similar)
- Wallet connection
- Petition creation/signing flows
- ZK proof generation UI
- Loading states and error handling

## Build Optimization

- Code splitting by route
- Lazy loading for heavy components
- WASM caching for proof generation
- Production builds are optimized and minified

## Deployment

Can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting

```bash
npm run build
# Upload dist/ folder to hosting provider
```
