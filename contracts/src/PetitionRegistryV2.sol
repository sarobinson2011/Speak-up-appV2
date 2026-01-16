// SPDX-License-Identifier: MIT
pragma solidity =0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./verifiers/NoirVerifier.sol";

/// @title PetitionRegistryV2
/// @notice Petition platform with ZK proof-based anonymous signing
contract PetitionRegistryV2 is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    // ============ State Variables ============
    
    HonkVerifier public verifier;
    
    struct Petition {
        address creator;
        string title;
        string description;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 signatureCount;
        bool active;
    }
    
    struct Comment {
        address commenter;
        string content;
        bool approved;
        uint256 timestamp;
    }
    
    uint256 public petitionCounter;
    
    mapping(uint256 => Petition) public petitions;
    mapping(uint256 => mapping(bytes32 => bool)) public nullifiersUsed; // petitionId => nullifier => used
    mapping(uint256 => Comment[]) public petitionComments;
    
    // ============ Events ============
    
    event PetitionCreated(
        uint256 indexed petitionId,
        address indexed creator,
        string title,
        uint256 expiresAt
    );
    
    event PetitionSigned(
        uint256 indexed petitionId,
        bytes32 indexed nullifier
    );
    
    event CommentSubmitted(
        uint256 indexed petitionId,
        uint256 commentIndex,
        address commenter
    );
    
    event CommentApproved(
        uint256 indexed petitionId,
        uint256 commentIndex
    );
    
    event VerifierUpdated(address newVerifier);
    
    // ============ Errors ============
    
    error PetitionNotActive();
    error PetitionExpired();
    error InvalidProof();
    error NullifierAlreadyUsed();
    error Unauthorized();
    
    // ============ Initialization ============
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _verifier) public initializer {
        __Ownable_init(msg.sender);
        
        verifier = HonkVerifier(_verifier);
    }
    
    // ============ Admin Functions ============
    
    function setVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier");
        verifier = HonkVerifier(_newVerifier);
        emit VerifierUpdated(_newVerifier);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // ============ Petition Functions ============
    
    function createPetition(
        string calldata _title,
        string calldata _description,
        uint256 _durationDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        
        uint256 petitionId = petitionCounter++;
        uint256 expiresAt = block.timestamp + (_durationDays * 1 days);
        
        petitions[petitionId] = Petition({
            creator: msg.sender,
            title: _title,
            description: _description,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            signatureCount: 0,
            active: true
        });
        
        emit PetitionCreated(petitionId, msg.sender, _title, expiresAt);
        return petitionId;
    }
    
    /// @notice Sign petition with ZK proof
    /// @param _petitionId Which petition to sign
    /// @param _proof ZK proof bytes
    /// @param _publicInputs Public inputs [petition_id, nullifier]
    function signPetition(
        uint256 _petitionId,
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        Petition storage petition = petitions[_petitionId];
        
        if (!petition.active) revert PetitionNotActive();
        if (block.timestamp > petition.expiresAt) revert PetitionExpired();
        
        // Verify proof
        bool valid = verifier.verify(_proof, _publicInputs);
        if (!valid) revert InvalidProof();
        
        // Extract nullifier from public inputs (index 1)
        require(_publicInputs.length >= 2, "Missing public inputs");
        bytes32 nullifier = _publicInputs[1];
        
        // Check nullifier not used
        if (nullifiersUsed[_petitionId][nullifier]) revert NullifierAlreadyUsed();
        
        // Mark nullifier as used
        nullifiersUsed[_petitionId][nullifier] = true;
        petition.signatureCount++;
        
        emit PetitionSigned(_petitionId, nullifier);
    }
    
    // ============ Comment Functions ============
    
    function submitComment(
        uint256 _petitionId,
        string calldata _content
    ) external returns (uint256) {
        require(petitions[_petitionId].active, "Petition not active");
        require(bytes(_content).length > 0, "Empty comment");
        
        uint256 commentIndex = petitionComments[_petitionId].length;
        
        petitionComments[_petitionId].push(Comment({
            commenter: msg.sender,
            content: _content,
            approved: false,
            timestamp: block.timestamp
        }));
        
        emit CommentSubmitted(_petitionId, commentIndex, msg.sender);
        return commentIndex;
    }
    
    function approveComment(
        uint256 _petitionId,
        uint256 _commentIndex
    ) external onlyOwner {
        require(_commentIndex < petitionComments[_petitionId].length, "Invalid index");
        petitionComments[_petitionId][_commentIndex].approved = true;
        emit CommentApproved(_petitionId, _commentIndex);
    }
    
    // ============ View Functions ============
    
    function getPetition(uint256 _petitionId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 createdAt,
        uint256 expiresAt,
        uint256 signatureCount,
        bool active
    ) {
        Petition memory p = petitions[_petitionId];
        return (p.creator, p.title, p.description, p.createdAt, p.expiresAt, p.signatureCount, p.active);
    }
    
    function getComment(uint256 _petitionId, uint256 _commentIndex) external view returns (
        address commenter,
        string memory content,
        bool approved,
        uint256 timestamp
    ) {
        require(_commentIndex < petitionComments[_petitionId].length, "Invalid index");
        Comment memory c = petitionComments[_petitionId][_commentIndex];
        return (c.commenter, c.content, c.approved, c.timestamp);
    }
    
    function getCommentCount(uint256 _petitionId) external view returns (uint256) {
        return petitionComments[_petitionId].length;
    }
}