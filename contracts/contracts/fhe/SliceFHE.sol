// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { FHE, ebool, externalEbool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";


contract SliceFHE is ZamaEthereumConfig, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    uint256 public stakePerJuror; // This is the stake required when creating a dispute to ask for a certain number of jurors (ej this is 5usd you need it to be 10 to ask for 2 jurors)
    uint256 public disputeCount;

    enum DisputeStatus {
        Created, // Uploading evidence
        Voting, // Voting
        Revealing, // Revealing
        Finished // Finished
    }

    struct Dispute {
        address claimer;
        address defender;
        address[] jurors;
        string ipfsHash;
        DisputeStatus status;
        uint256 stakeRequired;
        uint256 jurorsRequired;
        uint256 payDeadline;
        uint256 evidenceDeadline;
        uint256 commitDeadline;
        uint256 revealDeadline;
        bool majorityWinner;
        uint256 commitmentCount;
        // Vote tracking mappings stored within dispute
        mapping(address => ebool) commitments;
        mapping(address => uint256) revealedVotes;
        // Storage array for jurors who voted with majority (for reward distribution)
        address[] winners;
    }

    struct DisputeConfig {
        address claimer;
        address defender;
        uint256 jurorsRequired;
        uint256 paySeconds;
        uint256 evidenceSeconds;
        uint256 commitSeconds;
        uint256 revealSeconds;
    }

    struct UserStats {
        uint256 totalStaked;
        uint256 stakeInDisputes;
        uint256[] activeDisputes;
        uint256[] finishedDisputes; // This can be read from indexer it is not needed on chian
    }

    // Event declarations
    event DisputeCreated(uint256 indexed id, address claimer, address defender);
    event EvidenceSubmitted(uint256 indexed id, address indexed party, string ipfsHash);
    event JurorJoined(uint256 indexed id, address juror);
    event VoteCommitted(uint256 indexed id, address juror);
    event StatusChanged(uint256 indexed id, DisputeStatus newStatus);
    event VoteRevealed(uint256 indexed id, address juror, uint256 vote);
    event Withdrawn(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 indexed id, address[] jurors, uint256 totalReward);

    mapping(uint256 => Dispute) public disputes; // Dispute id => Dispute
    mapping(address => UserStats) public userStats; // Address => UserStats

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    // ===============================
    // =       Core Functions       =
    // ===============================

    function createDispute(DisputeConfig calldata _config) external nonReentrant returns (uint256) {
        require(_config.claimer != address(0), "Claimer cannot be 0 address");
        require(_config.defender != address(0), "Defender cannot be 0 address");
        require(_config.paySeconds > 0, "Pay seconds must be greater than 0");
        require(_config.evidenceSeconds > 0, "Evidence seconds must be greater than 0");
        require(_config.commitSeconds > 0, "Commit seconds must be greater than 0");
        require(_config.revealSeconds > 0, "Reveal seconds must be greater than 0");
        require(msg.sender != _config.defender, "Self-dispute not allowed");
        require(_config.claimer != _config.defender, "Claimer cannot be Defender");
        require(_config.jurorsRequired > 0, "Jurors required must be greater than 0");

        uint256 stakeRequired = stakePerJuror * _config.jurorsRequired;

        // Transfer the stake to the contract
        stakingToken.safeTransferFrom(msg.sender, address(this), stakeRequired);

        disputeCount++;

        // Create the dispute - use storage pointer to initialize nested mappings
        Dispute storage newDispute = disputes[disputeCount];
        newDispute.claimer = _config.claimer;
        newDispute.defender = _config.defender;
        newDispute.ipfsHash = "";
        newDispute.status = DisputeStatus.Created;
        newDispute.stakeRequired = stakeRequired;
        newDispute.jurorsRequired = _config.jurorsRequired;
        newDispute.payDeadline = block.timestamp + _config.paySeconds;
        newDispute.evidenceDeadline = block.timestamp + _config.evidenceSeconds;
        newDispute.commitDeadline = block.timestamp + _config.commitSeconds;
        newDispute.revealDeadline = block.timestamp + _config.revealSeconds;

        userStats[_config.claimer].activeDisputes.push(disputeCount);
        userStats[_config.defender].activeDisputes.push(disputeCount);

        emit DisputeCreated(disputeCount, _config.claimer, _config.defender);

        return disputeCount;
    }

    function submitEvidence(uint256 _id, string calldata _ipfsHash) external {
        Dispute storage dispute = disputes[_id];
        require(dispute.status == DisputeStatus.Created, "Dispute not created");
        require(block.timestamp < dispute.evidenceDeadline, "Evidence deadline passed");
        require(msg.sender == dispute.claimer || msg.sender == dispute.defender, "Not allowed to submit evidence");

        dispute.ipfsHash = _ipfsHash;

        emit EvidenceSubmitted(_id, msg.sender, _ipfsHash);
    }

    function payDispute(uint256 _id) external nonReentrant {}

    function joinDispute(uint256 _id, uint256 /* _amount */) external nonReentrant {
        Dispute storage dispute = disputes[_id];

        require(dispute.status == DisputeStatus.Created, "Dispute not created");
        require(dispute.jurors.length < dispute.jurorsRequired, "Jurors required reached");
        require(msg.sender != dispute.claimer && msg.sender != dispute.defender, "Not allowed to join dispute");

        // Renamed from 'userStats' to 'stats' to avoid shadowing the state variable
        UserStats storage stats = userStats[msg.sender];

        uint256 totalToStake = dispute.stakeRequired;
        require(stats.totalStaked - stats.stakeInDisputes >= totalToStake, "Not enough staked"); // Check if the user has enough staked to join the dispute
        stats.stakeInDisputes += totalToStake;
        stats.activeDisputes.push(_id);

        dispute.jurors.push(msg.sender);
        emit JurorJoined(_id, msg.sender);
    }

    function commitVote(uint256 _id, externalEbool vote, bytes calldata voteProof) external {
        Dispute storage dispute = disputes[_id];

        require(dispute.status == DisputeStatus.Voting, "Dispute not voting");
        require(block.timestamp < dispute.commitDeadline, "Commit deadline passed");
        // The dispute jurors must include the voter

        bool found = false;
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == msg.sender) {
                found = true;
                break;
            }
        }

        require(found, "Not a juror");
        require(!FHE.isInitialized(dispute.commitments[msg.sender]), "Already voted");

        ebool encryptedVote = FHE.fromExternal(vote, voteProof);
        FHE.allowThis(encryptedVote);  // Grant contract permission for future decryption
        dispute.commitments[msg.sender] = encryptedVote;
        dispute.commitmentCount++;

        emit VoteCommitted(_id, msg.sender);
    }

    /// @notice Transition dispute to revealing phase and make votes publicly decryptable
    /// @dev Called after commit deadline passes. Makes all encrypted votes publicly decryptable
    ///      so that any client can decrypt them off-chain using the relayer-sdk
    /// @param _id The dispute ID
    function startRevealPhase(uint256 _id) external nonReentrant {
        Dispute storage dispute = disputes[_id];

        require(dispute.status == DisputeStatus.Voting, "Dispute not in voting");
        require(block.timestamp >= dispute.commitDeadline, "Commit deadline not passed");
        require(dispute.commitmentCount > 0, "No commitments to decrypt");

        // Transition to Revealing status
        dispute.status = DisputeStatus.Revealing;
        emit StatusChanged(_id, DisputeStatus.Revealing);

        // Mark all commitments as publicly decryptable
        // This allows any client to decrypt them off-chain using relayer-sdk
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (FHE.isInitialized(dispute.commitments[dispute.jurors[i]])) {
                FHE.makePubliclyDecryptable(dispute.commitments[dispute.jurors[i]]);
            }
        }
    }

    /// @notice Get the commitment handles for a dispute (for off-chain decryption)
    /// @param _id The dispute ID
    /// @return handles Array of bytes32 handles for use with relayer-sdk publicDecrypt
    function getCommitmentHandles(uint256 _id) external view returns (bytes32[] memory handles) {
        Dispute storage dispute = disputes[_id];
        
        // Count initialized commitments
        uint256 count = 0;
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (FHE.isInitialized(dispute.commitments[dispute.jurors[i]])) {
                count++;
            }
        }
        
        // Build handles array
        handles = new bytes32[](count);
        uint256 idx = 0;
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (FHE.isInitialized(dispute.commitments[dispute.jurors[i]])) {
                handles[idx] = FHE.toBytes32(dispute.commitments[dispute.jurors[i]]);
                idx++;
            }
        }
    }

    /// @notice Execute ruling with decrypted votes (client submits after off-chain decryption)
    /// @dev Client must first call relayer-sdk publicDecrypt() with handles from getCommitmentHandles()
    ///      then submit the abiEncodedCleartexts and decryptionProof here
    /// @param _id The dispute ID  
    /// @param abiEncodedCleartexts ABI-encoded decrypted vote values from relayer-sdk
    /// @param decryptionProof Cryptographic proof from KMS via relayer-sdk
    function executeRuling(
        uint256 _id,
        bytes calldata abiEncodedCleartexts,
        bytes calldata decryptionProof
    ) external nonReentrant {
        Dispute storage dispute = disputes[_id];

        require(dispute.status == DisputeStatus.Revealing, "Dispute not in revealing");
        require(block.timestamp < dispute.revealDeadline, "Reveal deadline passed");
        
        // Build handles array for signature verification
        bytes32[] memory handles = new bytes32[](dispute.jurors.length);
        uint256 handleCount = 0;
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (FHE.isInitialized(dispute.commitments[dispute.jurors[i]])) {
                handles[handleCount] = FHE.toBytes32(dispute.commitments[dispute.jurors[i]]);
                handleCount++;
            }
        }
        bytes32[] memory actualHandles = new bytes32[](handleCount);
        for (uint i = 0; i < handleCount; i++) {
            actualHandles[i] = handles[i];
        }
        
        // Verify the decryption proof from KMS
        FHE.checkSignatures(actualHandles, abiEncodedCleartexts, decryptionProof);

        // Decode the decrypted votes
        bool[] memory votes = abi.decode(abiEncodedCleartexts, (bool[]));
        require(votes.length == handleCount, "Vote count mismatch");

        // Tally votes
        uint256 trueVotes = 0;
        uint256 falseVotes = 0;
        for (uint i = 0; i < votes.length; i++) {
            if (votes[i]) trueVotes++;
            else falseVotes++;
        }

        // Determine majority winner
        dispute.majorityWinner = trueVotes > falseVotes;

        // Distribute rewards based on decrypted votes
        _distributeRewards(_id, votes);

        // Finalize dispute
        dispute.status = DisputeStatus.Finished;
        emit StatusChanged(_id, DisputeStatus.Finished);
    }

    // Leaving legacy function for compatibility - redirects to new flow
    function revealVote(uint256 /* _id */, uint256 /* _vote */, uint256 /* _salt */) external pure {
        revert("Use startRevealPhase() then executeRuling() with decrypted votes");
    }

    /// @notice Internal function to distribute rewards after decryption
    /// @param _id The dispute ID
    /// @param votes Array of decrypted vote values
    function _distributeRewards(uint256 _id, bool[] memory votes) internal {
        Dispute storage dispute = disputes[_id];
        
        uint256 totalReward = 0;
        uint256 voteIndex = 0;

        // Iterate through the jurors and distribute the rewards or slash the stake
        for (uint i = 0; i < dispute.jurors.length; i++) {
            if (FHE.isInitialized(dispute.commitments[dispute.jurors[i]])) {
                bool vote = votes[voteIndex];
                voteIndex++;
                
                if (vote == dispute.majorityWinner) {
                    // Add to winners array (storage - supports .push())
                    dispute.winners.push(dispute.jurors[i]);
                } else {
                    // Slash the stake and add to total reward pool
                    uint256 requiredStake = dispute.stakeRequired;
                    UserStats storage stats = userStats[dispute.jurors[i]];
                    stats.totalStaked -= requiredStake;
                    stats.stakeInDisputes -= requiredStake;
                    totalReward += requiredStake;
                }
            }
        }

        // Distribute rewards to winners
        if (dispute.winners.length > 0) {
            uint256 rewardPerWinner = totalReward / dispute.winners.length;
            for (uint i = 0; i < dispute.winners.length; i++) {
                UserStats storage stats = userStats[dispute.winners[i]];
                stats.totalStaked += rewardPerWinner;
            }
        }

        // Emit the event
        emit RewardsDistributed(_id, dispute.winners, totalReward);
    }

    function withdraw() external nonReentrant {
        // Renamed from 'userStats' to 'stats' to avoid shadowing the state variable
        UserStats storage stats = userStats[msg.sender];
        require(stats.totalStaked > 0, "No staked");

        // The user can withdraw the amount he has not staked in disputes
        uint256 amountToWithdraw = stats.totalStaked - stats.stakeInDisputes;
        stakingToken.safeTransfer(msg.sender, amountToWithdraw);
        stats.totalStaked = stats.stakeInDisputes;
        emit Withdrawn(msg.sender, amountToWithdraw);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");

        // Renamed from 'userStats' to 'stats' to avoid shadowing the state variable
        UserStats storage stats = userStats[msg.sender];

        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);

        stats.totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    // ===============================
    // =       Admin Functions       =
    // ===============================

    /// @notice Set the stake required per juror for disputes
    /// @param _stakePerJuror The amount of tokens required per juror
    function setStakePerJuror(uint256 _stakePerJuror) external onlyOwner {
        stakePerJuror = _stakePerJuror;
    }

    /// @notice Transition dispute from Created to Voting status
    /// @dev Can only be called when all required jurors have joined
    /// @param _id The dispute ID
    function startVotingPhase(uint256 _id) external {
        Dispute storage dispute = disputes[_id];
        
        require(dispute.status == DisputeStatus.Created, "Dispute not in created status");
        require(dispute.jurors.length == dispute.jurorsRequired, "Not all jurors joined");
        
        dispute.status = DisputeStatus.Voting;
        emit StatusChanged(_id, DisputeStatus.Voting);
    }

    // ===============================
    // =       View Functions        =
    // ===============================

    /// @notice Get the jurors for a dispute
    /// @param _id The dispute ID
    /// @return Array of juror addresses
    function getJurors(uint256 _id) external view returns (address[] memory) {
        return disputes[_id].jurors;
    }

    /// @notice Get the winners of a dispute
    /// @param _id The dispute ID
    /// @return Array of winner addresses
    function getWinners(uint256 _id) external view returns (address[] memory) {
        return disputes[_id].winners;
    }
}

