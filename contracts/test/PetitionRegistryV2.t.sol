// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

import "forge-std/Test.sol";
import "../src/PetitionRegistryV2.sol";
import "../src/verifiers/NoirVerifier.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract PetitionRegistryV2Test is Test {
    PetitionRegistryV2 public registry;
    HonkVerifier public verifier;
    
    address public owner = address(1);
    address public user1 = address(2);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy verifier
        verifier = new HonkVerifier();
        
        // Deploy implementation
        PetitionRegistryV2 implementation = new PetitionRegistryV2();
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            PetitionRegistryV2.initialize.selector,
            address(verifier)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        
        registry = PetitionRegistryV2(address(proxy));
        
        vm.stopPrank();
    }
    
    function testCreatePetition() public {
        vm.prank(user1);
        uint256 petitionId = registry.createPetition(
            "Test Petition",
            "This is a test",
            30
        );
        
        assertEq(petitionId, 0);
        
        (
            address creator,
            string memory title,
            ,
            ,
            ,
            uint256 signatureCount,
            bool active
        ) = registry.getPetition(0);
        
        assertEq(creator, user1);
        assertEq(title, "Test Petition");
        assertEq(signatureCount, 0);
        assertTrue(active);
    }
    
    function testSubmitComment() public {
        vm.prank(user1);
        registry.createPetition("Test", "Description", 30);
        
        vm.prank(user1);
        uint256 commentIndex = registry.submitComment(0, "Great petition!");
        
        assertEq(commentIndex, 0);
        assertEq(registry.getCommentCount(0), 1);
        
        (address commenter, string memory content, bool approved,) = registry.getComment(0, 0);
        assertEq(commenter, user1);
        assertEq(content, "Great petition!");
        assertFalse(approved);
    }
    
    function testApproveComment() public {
        vm.prank(user1);
        registry.createPetition("Test", "Description", 30);
        
        vm.prank(user1);
        registry.submitComment(0, "Great petition!");
        
        vm.prank(owner);
        registry.approveComment(0, 0);
        
        (,, bool approved,) = registry.getComment(0, 0);
        assertTrue(approved);
    }
}