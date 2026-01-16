// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VotingCredential.sol";
import "../src/PetitionRegistry.sol";

contract PetitionRegistryTest is Test {
    VotingCredential credential;
    PetitionRegistry registry;
    
    address owner = address(1);
    address user1 = address(2);
    address user2 = address(3);
    
    function setUp() public {
        vm.startPrank(owner);
        
        credential = new VotingCredential();
        registry = new PetitionRegistry(address(credential));
        
        // Grant credentials to test users
        credential.grantCredential(user1);
        credential.grantCredential(user2);
        
        vm.stopPrank();
    }
    
    function testCreatePetition() public {
        vm.prank(user1);
        
        uint256 petitionId = registry.createPetition(
            "Test Petition",
            "This is a test",
            30 // 30 days
        );
        
        (address creator, string memory title,,,, bool active) = registry.petitions(petitionId);
        
        assertEq(creator, user1);
        assertEq(title, "Test Petition");
        assertTrue(active);
    }
    
    function testSignPetition() public {
        // User1 creates petition
        vm.prank(user1);
        uint256 petitionId = registry.createPetition("Test", "Description", 30);
        
        // User2 signs it
        vm.prank(user2);
        registry.signPetition(petitionId);
        
        assertTrue(registry.hasSigned(petitionId, user2));
        
        (,,,, uint256 count,) = registry.petitions(petitionId);
        assertEq(count, 1);
    }
    
    function testCannotSignTwice() public {
        vm.prank(user1);
        uint256 petitionId = registry.createPetition("Test", "Description", 30);
        
        vm.prank(user2);
        registry.signPetition(petitionId);
        
        // Try to sign again - should fail
        vm.prank(user2);
        vm.expectRevert("Already signed");
        registry.signPetition(petitionId);
    }
}