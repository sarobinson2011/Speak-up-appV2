use dep::std;
use dep::poseidon::poseidon::bn254;

fn main(credential_secret: Field, petition_id: pub Field, nullifier: pub Field) {
    let credential_hash = bn254::hash_1([credential_secret]);
    let computed_nullifier = bn254::hash_2([credential_secret, petition_id]);

    std::println(computed_nullifier);
    assert(computed_nullifier == nullifier);

    let _ = credential_hash;
}
