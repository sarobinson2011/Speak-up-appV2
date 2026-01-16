const { BarretenbergBackend } = require('@noir-lang/backend_barretenberg');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

async function generateVerifier() {
    console.log('🔧 Generating Solidity verifier from Noir circuit...\n');

    try {
        // Read the compiled circuit
        const circuitPath = path.join(__dirname, 'target', 'speak_up_zk.json');
        console.log('📖 Reading circuit from:', circuitPath);

        const circuitData = JSON.parse(readFileSync(circuitPath, 'utf-8'));

        // Create backend
        console.log('⚙️  Initializing Barretenberg backend...');
        const backend = new BarretenbergBackend(circuitData);

        // Check available methods
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(backend)));

        // Try different method names
        if (typeof backend.getSolidity === 'function') {
            const verifier = await backend.getSolidity();
            console.log('✅ Used getSolidity()');
            writeFileSync(path.join(__dirname, '..', 'contracts', 'src', 'verifiers', 'NoirVerifier.sol'), verifier);
        } else if (typeof backend.getVerifier === 'function') {
            const verifier = await backend.getVerifier();
            console.log('✅ Used getVerifier()');
            writeFileSync(path.join(__dirname, '..', 'contracts', 'src', 'verifiers', 'NoirVerifier.sol'), verifier);
        } else {
            console.log('❌ No verifier generation method found');
            console.log('Try installing bb CLI tool instead');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

generateVerifier();