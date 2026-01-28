// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISlice {
    // --- Enums & Structs ---
    enum DisputeStatus {
        Created,
        Commit,
        Reveal,
        Finished
    }

    struct CourtConfig {
        bool active;
        uint256 feePerJuror;
        uint256 partyStake;
        uint256 jurorRewardShare;
        uint256 minJurorStake;
        uint256 maxJurorStake;
        uint256 minVoteDuration;
        uint256 maxVoteDuration;
        uint256 alpha;
    }

    struct Dispute {
        uint256 id;
        address arbitrated;
        address claimer;
        address defender;
        string category;
        // Economic Snapshot
        uint256 feePerJuror;
        uint256 partyStake;
        uint256 jurorRewardShare;
        uint256 jurorsRequired;
        uint256 alpha;
        // State
        string ipfsHash;
        uint256 commitsCount;
        uint256 revealsCount;
        DisputeStatus status;
        bool claimerPaid;
        bool defenderPaid;
        address winner;
        // Phase Durations
        uint256 evidenceDuration;
        uint256 commitDuration;
        uint256 revealDuration;
        // Timestamps
        uint256 payDeadline;
        uint256 evidenceDeadline;
        uint256 commitDeadline;
        uint256 revealDeadline;
    }

    struct JurorStats {
        uint256 totalDisputes;
        uint256 coherentVotes;
        uint256 totalEarnings;
    }

    struct CreateDisputeParams {
        address claimer;
        address defender;
        string category;
        string ipfsHash;
        uint256 jurorsRequired;
        uint256 paySeconds;
        uint256 evidenceSeconds;
        uint256 commitSeconds;
        uint256 revealSeconds;
    }

    // --- Events ---
    event DisputeCreated(uint256 indexed id, address indexed arbitrated, address claimer, address defender);
    event CourtUpdated(string category, uint256 feePerJuror, uint256 alpha);
    event FundsDeposited(uint256 indexed id, address role, uint256 amount);
    event JurorJoined(uint256 indexed id, address juror, string category);
    event StatusChanged(uint256 indexed id, DisputeStatus newStatus);
    event VoteCommitted(uint256 indexed id, address juror);
    event VoteRevealed(uint256 indexed id, address juror, uint256 vote);
    event RulingExecuted(uint256 indexed id, address winner, uint256 amountWon);
    event RulingSent(address indexed arbitrated, uint256 indexed disputeId, uint256 ruling);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // --- State Variable Getters ---
    function disputeCount() external view returns (uint256);
    function stakingToken() external view returns (IERC20);
    function treasury() external view returns (address);
    function MAX_JURORS() external view returns (uint256);

    // --- Court & Queue Getters ---
    function courtConfigs(string memory _category) external view returns (CourtConfig memory);
    function courtQueues(string memory _category, uint256 _index) external view returns (uint256);
    function idToQueueIndex(uint256 _id) external view returns (uint256);

    // --- Mapping Getters ---
    function disputeJurors(uint256 _id, uint256 _index) external view returns (address);
    function commitments(uint256 _id, address _juror) external view returns (bytes32);
    function revealedVotes(uint256 _id, address _juror) external view returns (uint256);
    function hasRevealed(uint256 _id, address _juror) external view returns (bool);
    function jurorStakes(uint256 _id, address _juror) external view returns (uint256);
    function balances(address _user) external view returns (uint256);
    function jurorStats(address _juror) external view returns (uint256 totalDisputes, uint256 coherentVotes, uint256 totalEarnings);

    // --- View Functions ---
    function disputes(uint256 _id) external view returns (Dispute memory);
    function getDisputeCost(uint256 _id) external view returns (uint256);

    // --- Admin Functions ---
    function setCourt(string memory _category, CourtConfig memory _config) external;
    function setTreasury(address _treasury) external;

    // --- Core Functions ---
    function createDispute(CreateDisputeParams calldata _params) external returns (uint256);

    function payDispute(uint256 _id) external;
    function drawDispute(uint256 _amount, string calldata _category) external;
    function commitVote(uint256 _id, bytes32 _commitment) external;
    function revealVote(uint256 _id, uint256 _vote, uint256 _salt) external;
    function executeRuling(uint256 _id) external;
    function withdraw(address _token) external;
}
