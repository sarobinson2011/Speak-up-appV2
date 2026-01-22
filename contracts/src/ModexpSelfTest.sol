// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

contract ModexpSelfTest {
    uint256 constant MODULUS =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    function modexp(uint256 base, uint256 exponent, uint256 mod_) public view returns (uint256 result) {
        assembly {
            let free := mload(0x40)
            mstore(free, 0x20)                 // baseLen
            mstore(add(free, 0x20), 0x20)      // expLen
            mstore(add(free, 0x40), 0x20)      // modLen
            mstore(add(free, 0x60), base)
            mstore(add(free, 0x80), exponent)
            mstore(add(free, 0xa0), mod_)

            if iszero(staticcall(gas(), 0x05, free, 0xc0, 0x00, 0x20)) {
                revert(0, 0)
            }
            result := mload(0x00)
        }
    }

    function inv(uint256 a) public view returns (uint256) {
        require(a != 0, "zero");
        return modexp(a, MODULUS - 2, MODULUS);
    }

    function check(uint256 a) external view returns (bool ok, uint256 invA, uint256 prod) {
        invA = inv(a);
        prod = mulmod(a, invA, MODULUS);
        ok = (prod == 1);
    }
}