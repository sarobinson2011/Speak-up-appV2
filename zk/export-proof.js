const fs = require('fs');
const path = require('path');

// Read proof (raw bytes)
const proofBytes = fs.readFileSync(path.join(__dirname, 'target', 'proof'));
const proofHex = '0x' + proofBytes.toString('hex');

// Read the actual public_inputs file (this is what the circuit computed)
const publicInputsBytes = fs.readFileSync(path.join(__dirname, 'target', 'public_inputs'));

// Parse public inputs - each field is 32 bytes
const FIELD_SIZE = 32;
const numFields = publicInputsBytes.length / FIELD_SIZE;

const publicInputsArray = [];
for (let i = 0; i < numFields; i++) {
    const start = i * FIELD_SIZE;
    const end = start + FIELD_SIZE;
    const fieldBytes = publicInputsBytes.slice(start, end);
    const fieldHex = '0x' + fieldBytes.toString('hex');
    publicInputsArray.push(fieldHex);
}

console.log('\n=== Proof Data ===');
console.log('Proof length:', proofHex.length, 'chars');
console.log('Proof bytes:', proofBytes.length, 'bytes');

console.log('\n=== Public Inputs (' + numFields + ' fields) ===');
publicInputsArray.forEach((input, i) => {
    console.log(`[${i}]:`, input);
});

// Save
const output = {
    proof: proofHex,
    publicInputs: publicInputsArray
};

fs.writeFileSync(
    path.join(__dirname, 'target', 'proof-data.json'),
    JSON.stringify(output, null, 2)
);

console.log('\n✅ Saved to target/proof-data.json');