use dep::std;
use dep::poseidon::poseidon::bn254;

fn main(credential_secret: Field, petition_id: pub Field) -> pub Field {
    let credential_hash = bn254::hash_1([credential_secret]);
    let nullifier = bn254::hash_2([credential_secret, petition_id]);
    
    std::println(nullifier);
    
    let _ = credential_hash; // Reserved for future Merkle tree
    
    nullifier
}
