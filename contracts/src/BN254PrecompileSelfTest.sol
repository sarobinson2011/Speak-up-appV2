// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

contract BN254PrecompileSelfTest {
    uint256 constant P = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    uint256 constant G1X = 1;
    uint256 constant G1Y = 2;
    uint256 constant G2_X_IM = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant G2_X_RE = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant G2_Y_IM = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant G2_Y_RE = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    function ecAdd(uint256 x1, uint256 y1, uint256 x2, uint256 y2) public view returns (uint256 x3, uint256 y3) {
        bytes memory input = abi.encodePacked(x1, y1, x2, y2);
        bytes memory out = new bytes(64);
        bool ok;
        assembly {
            ok := staticcall(gas(), 0x06, add(input, 0x20), 0x80, add(out, 0x20), 0x40)
        }
        require(ok, "ECADD failed");
        assembly {
            x3 := mload(add(out, 0x20))
            y3 := mload(add(out, 0x40))
        }
    }

    function ecMul(uint256 x1, uint256 y1, uint256 s) public view returns (uint256 x2, uint256 y2) {
        bytes memory input = abi.encodePacked(x1, y1, s);
        bytes memory out = new bytes(64);
        bool ok;
        assembly {
            ok := staticcall(gas(), 0x07, add(input, 0x20), 0x60, add(out, 0x20), 0x40)
        }
        require(ok, "ECMUL failed");
        assembly {
            x2 := mload(add(out, 0x20))
            y2 := mload(add(out, 0x40))
        }
    }

    function pairing(bytes memory input) public view returns (bool) {
        bytes memory out = new bytes(32);
        bool ok;
        assembly {
            ok := staticcall(gas(), 0x08, add(input, 0x20), mload(input), add(out, 0x20), 0x20)
        }
        require(ok, "PAIRING call failed");
        uint256 r;
        assembly {
            r := mload(add(out, 0x20))
        }
        return (r == 1);
    }

    function testAddMulConsistency() external view returns (bool ok, uint256 ax, uint256 ay, uint256 mx, uint256 my) {
        (ax, ay) = ecAdd(G1X, G1Y, G1X, G1Y);
        (mx, my) = ecMul(G1X, G1Y, 2);
        ok = (ax == mx && ay == my);
    }

    function testPairingTrivialIdentity() external view returns (bool ok) {
        uint256 negY = P - G1Y;
        bytes memory input = abi.encodePacked(
            G1X, G1Y, G2_X_IM, G2_X_RE, G2_Y_IM, G2_Y_RE,
            G1X, negY, G2_X_IM, G2_X_RE, G2_Y_IM, G2_Y_RE
        );
        ok = pairing(input);
    }
}
