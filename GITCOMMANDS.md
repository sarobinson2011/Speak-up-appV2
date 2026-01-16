# Navigate to project root
cd ~/Documents/Coding/Speak-up-appV2

# Configure git user (one-time setup)
git config --global user.name "sarobinson2011"
git config --global user.email "sarobinson2011@gmail.com"

# Initialize git repo
git init

# Add remote
git remote add origin https://github.com/sarobinson2011/Speak-up-appV2.git

# Create .gitignore if needed (exclude build artifacts)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
**/node_modules/

# Build outputs
target/
**/target/
dist/
**/dist/
out/
**/out/
cache/
**/cache/

# Environment
.env
.env.local
**/.env

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
EOF

# Stage all files
git add .

# First commit
git commit -m "Initial v2 setup: Noir 1.0.0-beta.9 + UltraHonk + Solidity verifier generated"

# Push to main branch
git branch -M main
git push -u origin main