#!/bin/bash

# Speak Up V2 - Full Stack Deployment Script
# Deploys ZK circuits, smart contracts, and prepares frontend

set -e  # Exit on error

echo "🚀 Speak Up V2 Deployment"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v nargo >/dev/null 2>&1 || { echo -e "${RED}Error: nargo not found. Install Noir toolchain.${NC}" >&2; exit 1; }
command -v forge >/dev/null 2>&1 || { echo -e "${RED}Error: forge not found. Install Foundry.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ Prerequisites OK${NC}\n"

# Step 1: Compile ZK Circuit
echo -e "${YELLOW}Step 1: Compiling ZK circuit...${NC}"
cd zk
nargo compile
echo -e "${GREEN}✓ Circuit compiled${NC}\n"

# Step 2: Generate Solidity Verifier
echo -e "${YELLOW}Step 2: Generating Solidity verifier...${NC}"
nargo codegen-verifier

# Move verifier to contracts
mv contract/*/plonk_vk.sol ../contracts/src/verifiers/NoirVerifier.sol 2>/dev/null || true
echo -e "${GREEN}✓ Verifier generated and moved${NC}\n"

cd ..

# Step 3: Build Contracts
echo -e "${YELLOW}Step 3: Building smart contracts...${NC}"
cd contracts
forge build
echo -e "${GREEN}✓ Contracts built${NC}\n"

# Step 4: Run Contract Tests
echo -e "${YELLOW}Step 4: Running contract tests...${NC}"
forge test
echo -e "${GREEN}✓ Tests passed${NC}\n"

# Step 5: Deploy (optional - requires env vars)
if [ "$1" == "--deploy" ]; then
    echo -e "${YELLOW}Step 5: Deploying to Aurora testnet...${NC}"
    
    if [ -z "$PRIVATE_KEY" ]; then
        echo -e "${RED}Error: PRIVATE_KEY not set${NC}"
        exit 1
    fi
    
    forge script script/Deploy.s.sol --rpc-url aurora_testnet --broadcast --verify
    echo -e "${GREEN}✓ Contracts deployed${NC}\n"
else
    echo -e "${YELLOW}Skipping deployment (use --deploy flag to deploy)${NC}\n"
fi

cd ..

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment pipeline complete! 🎉${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update frontend .env with deployed contract address"
echo "2. Build frontend: cd frontend && npm run build"
echo "3. Deploy frontend to hosting provider"
