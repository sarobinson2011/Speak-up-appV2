# Speak Up V2 - Backend API

Express.js backend server for the Speak Up petition platform.

## Structure

```
backend/
├── src/
│   ├── index.ts          # Main server file
│   ├── routes/           # API route handlers
│   └── services/         # Business logic and blockchain interaction
├── package.json
└── tsconfig.json
```

## Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Run production
npm start
```

## Environment Variables

Create `.env` file:
```
PORT=3001
NODE_ENV=development
AURORA_RPC_URL=https://testnet.aurora.dev
CONTRACT_ADDRESS=your_deployed_contract_address
```

## API Endpoints

### Petitions
- `GET /api/petitions` - List all petitions
- `GET /api/petitions/:id` - Get specific petition
- `POST /api/petitions` - Create new petition (optional backend creation)

### ZK Proofs (Optional - if doing server-side generation)
- `POST /api/proofs/generate` - Generate ZK proof server-side
- `POST /api/proofs/verify` - Verify ZK proof

### Health
- `GET /health` - Health check endpoint

## Architecture

### Services Layer
Handles blockchain interaction, proof verification, and business logic.

### Routes Layer
HTTP request handling and response formatting.

## Development

```bash
# Watch mode
npm run dev

# Linting
npm run lint

# Tests
npm test
```

## Deployment

Backend can be deployed to:
- Railway
- Render
- AWS/GCP/Azure
- Self-hosted VPS

Keep private keys and RPC URLs secure in production environment variables.
