// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Slice Protocol
 * @notice Decentralized dispute resolution via random juror drafting.
 */
contract Slice {
    // ============================================
    // DATA STRUCTURES
    // ============================================

    enum DisputeStatus {
        Created,
        Commit,
        Reveal,
        Finished
    }

    struct DisputeConfig {
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

    struct Dispute {
        uint256 id;
        address claimer;
        address defender;
        string category;
        uint256 requiredStake;
        uint256 jurorsRequired;
        string ipfsHash;
        uint256 commitsCount;
        uint256 revealsCount;
        DisputeStatus status;
        bool claimerPaid;
        bool defenderPaid;
        address winner;
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

    // ============================================
    // STATE VARIABLES
    // ============================================

    uint256 public disputeCount;
    IERC20 public immutable stakingToken;

    // Limits: 1 USDC min, 100 USDC max
    uint256 public constant MIN_STAKE = 1000000;
    uint256 public constant MAX_STAKE = 100000000;

    // Draft Queue: List of open disputes waiting for jurors
    uint256[] public openDisputeIds;
    mapping(uint256 => uint256) public idToQueueIndex;

    // ============================================
    // MAPPINGS
    // ============================================

    mapping(uint256 => Dispute) internal disputeStore;
    mapping(uint256 => address[]) public disputeJurors;

    // Voting State
    mapping(uint256 => mapping(address => bytes32)) public commitments;
    mapping(uint256 => mapping(address => uint256)) public revealedVotes;
    mapping(uint256 => mapping(address => bool)) public hasRevealed;

    // Financials
    mapping(uint256 => mapping(address => uint256)) public jurorStakes;
    mapping(address => uint256) public balances;
    mapping(address => JurorStats) public jurorStats;

    // User Indexing
    mapping(address => uint256[]) private jurorDisputes;
    mapping(address => uint256[]) private userDisputes;

    // ============================================
    // EVENTS
    // ============================================

    event DisputeCreated(uint256 indexed id, address claimer, address defender);
    event FundsDeposited(uint256 indexed id, address role, uint256 amount);
    event EvidenceSubmitted(uint256 indexed id, address indexed party, string ipfsHash);
    event JurorJoined(uint256 indexed id, address juror);
    event StatusChanged(uint256 indexed id, DisputeStatus newStatus);
    event VoteCommitted(uint256 indexed id, address juror);
    event VoteRevealed(uint256 indexed id, address juror, uint256 vote);
    event RulingExecuted(uint256 indexed id, address winner);
    event FundsWithdrawn(address indexed user, uint256 amount);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    // ============================================
    // 1. DISPUTE CREATION
    // ============================================

    function createDispute(DisputeConfig calldata _config) external returns (uint256) {
        require(msg.sender != _config.defender, "Self-dispute not allowed");
        require(_config.claimer != _config.defender, "Claimer cannot be Defender");

        disputeCount++;
        uint256 id = disputeCount;

        Dispute storage d = disputeStore[id];
        d.id = id;
        d.claimer = _config.claimer;
        d.defender = _config.defender;
        d.category = _config.category;
        d.requiredStake = 1000000; // Fixed 1 USDC per juror slot
        d.jurorsRequired = _config.jurorsRequired;
        d.ipfsHash = _config.ipfsHash;
        d.status = DisputeStatus.Created;

        // Set deadlines relative to now
        d.payDeadline = block.timestamp + _config.paySeconds;
        d.evidenceDeadline = d.payDeadline + _config.evidenceSeconds;
        d.commitDeadline = d.payDeadline + _config.commitSeconds;
        d.revealDeadline = d.commitDeadline + _config.revealSeconds;

        userDisputes[_config.claimer].push(id);
        userDisputes[_config.defender].push(id);

        if (d.claimerPaid && d.defenderPaid) {
            d.status = DisputeStatus.Commit;
            _addToQueue(id);
            emit StatusChanged(id, DisputeStatus.Commit);
        }

        emit DisputeCreated(id, _config.claimer, _config.defender);
        return id;
    }

    function payDispute(uint256 _id) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Created, "Payment closed");
        require(block.timestamp <= d.payDeadline, "Deadline passed");

        if (msg.sender == d.claimer) {
            require(!d.claimerPaid, "Already paid");
            d.claimerPaid = true;
        } else if (msg.sender == d.defender) {
            require(!d.defenderPaid, "Already paid");
            d.defenderPaid = true;
        } else {
            revert("Only disputants can pay");
        }

        bool success = stakingToken.transferFrom(msg.sender, address(this), d.requiredStake);
        require(success, "Transfer failed");

        emit FundsDeposited(_id, msg.sender, d.requiredStake);

        // Advance to Commit phase only when both sides have paid
        if (d.claimerPaid && d.defenderPaid) {
            d.status = DisputeStatus.Commit;
            _addToQueue(_id);

            emit StatusChanged(_id, DisputeStatus.Commit);
        }
    }

    function submitEvidence(uint256 _id, string calldata _ipfsHash) external {
        Dispute storage d = disputeStore[_id];
        require(d.status != DisputeStatus.Finished, "Dispute finished");
        require(d.status != DisputeStatus.Reveal, "Evidence closed");
        require(block.timestamp <= d.evidenceDeadline, "Deadline passed");
        require(msg.sender == d.claimer || msg.sender == d.defender, "Only parties can submit");

        emit EvidenceSubmitted(_id, msg.sender, _ipfsHash);
    }

    // ============================================
    // 2. MATCHMAKING (RANDOM DRAFT)
    // ============================================

    /**
     * @notice Jurors stake tokens to be randomly assigned a valid dispute.
     * @dev Uses block.prevrandao + sender address for uniqueness.
     */
    function drawDispute(uint256 _amount) external {
        require(openDisputeIds.length > 0, "No disputes available");
        require(_amount >= MIN_STAKE, "Stake too low");
        require(_amount <= MAX_STAKE, "Stake too high");

        // 1. Random Selection
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        uint256 index = seed % openDisputeIds.length;
        uint256 id = openDisputeIds[index];

        Dispute storage d = disputeStore[id];

        // 2. Safety Checks (Expired, Finished, or Conflict of Interest)
        require(block.timestamp < d.commitDeadline, "Dispute expired");
        require(d.status != DisputeStatus.Finished, "Dispute finished");
        require(msg.sender != d.claimer && msg.sender != d.defender, "Conflict: Party cannot be juror");
        require(!_isJuror(id, msg.sender), "Already a juror");

        // 3. Stake Transfer
        bool success = stakingToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer failed");

        // 4. Assign Juror
        disputeJurors[id].push(msg.sender);
        jurorStakes[id][msg.sender] = _amount;
        jurorDisputes[msg.sender].push(id);

        emit JurorJoined(id, msg.sender);

        // 5. If full, remove from draft queue
        if (disputeJurors[id].length >= d.jurorsRequired) {
            _removeFromQueue(index);
        }
    }

    // ============================================
    // 3. VOTING (COMMIT / REVEAL)
    // ============================================

    function commitVote(uint256 _id, bytes32 _commitment) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Commit, "Not voting phase");
        require(block.timestamp <= d.commitDeadline, "Voting ended");
        require(_isJuror(_id, msg.sender), "Not a juror");
        require(commitments[_id][msg.sender] == bytes32(0), "Already committed");

        commitments[_id][msg.sender] = _commitment;
        d.commitsCount++;
        emit VoteCommitted(_id, msg.sender);

        // Auto-advance if everyone voted
        if (disputeJurors[_id].length == d.jurorsRequired && d.commitsCount == d.jurorsRequired) {
            d.status = DisputeStatus.Reveal;
            emit StatusChanged(_id, DisputeStatus.Reveal);
        }
    }

    function revealVote(uint256 _id, uint256 _vote, uint256 _salt) external {
        Dispute storage d = disputeStore[_id];

        // Graceful rollover if deadline passed but status didn't update
        if (d.status == DisputeStatus.Commit && block.timestamp > d.commitDeadline) {
            d.status = DisputeStatus.Reveal;
        }

        require(d.status == DisputeStatus.Reveal, "Not reveal phase");
        require(_isJuror(_id, msg.sender), "Not a juror");
        require(!hasRevealed[_id][msg.sender], "Already revealed");

        // Verify Hash: keccak256(vote + salt) == stored_commitment
        bytes32 verify = keccak256(abi.encodePacked(_vote, _salt));
        require(verify == commitments[_id][msg.sender], "Hash mismatch");

        revealedVotes[_id][msg.sender] = _vote;
        hasRevealed[_id][msg.sender] = true;
        d.revealsCount++;

        emit VoteRevealed(_id, msg.sender, _vote);
    }

    // ============================================
    // 4. RULING & REWARDS
    // ============================================

    function executeRuling(uint256 _id) external {
        Dispute storage d = disputeStore[_id];

        if (d.status == DisputeStatus.Commit && block.timestamp > d.commitDeadline) {
            d.status = DisputeStatus.Reveal;
        }

        bool timePassed = block.timestamp > d.revealDeadline;
        bool allRevealed = (d.commitsCount > 0 && d.commitsCount == d.revealsCount);

        require(d.status == DisputeStatus.Reveal, "Wrong phase");
        require(timePassed || allRevealed, "Cannot execute yet");

        uint256 winningChoice = _determineWinner(_id);
        address winnerAddr = winningChoice == 1 ? d.claimer : d.defender;

        d.winner = winnerAddr;
        d.status = DisputeStatus.Finished;

        // Winner gets 2x required stake (Principal + Opponent's stake)
        balances[winnerAddr] += d.requiredStake * 2;

        // Jurors who voted correctly get paid from the losing jurors' pool
        _distributeRewards(_id, winningChoice);

        emit RulingExecuted(_id, winnerAddr);
    }

    function withdraw(address _token) external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds");
        require(_token == address(stakingToken), "Wrong token");

        balances[msg.sender] = 0; // Check-Effects-Interactions pattern
        bool success = stakingToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, amount);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function disputes(uint256 _id) external view returns (Dispute memory) {
        return disputeStore[_id];
    }

    function getJurorDisputes(address _user) external view returns (uint256[] memory) {
        return jurorDisputes[_user];
    }

    function getUserDisputes(address _user) external view returns (uint256[] memory) {
        return userDisputes[_user];
    }

    function disputeCountView() external view returns (uint256) {
        return disputeCount;
    }

    // ============================================
    // INTERNAL HELPERS
    // ============================================

    function _isJuror(uint256 _id, address _user) internal view returns (bool) {
        address[] memory jurors = disputeJurors[_id];
        for (uint i = 0; i < jurors.length; i++) {
            if (jurors[i] == _user) return true;
        }
        return false;
    }

    // --- Queue: Swap & Pop (O(1) removal) ---
    function _addToQueue(uint256 _id) internal {
        openDisputeIds.push(_id);
        idToQueueIndex[_id] = openDisputeIds.length - 1;
    }

    function _removeFromQueue(uint256 _index) internal {
        require(_index < openDisputeIds.length, "Index out of bounds");

        uint256 idToRemove = openDisputeIds[_index];
        uint256 lastId = openDisputeIds[openDisputeIds.length - 1];

        // Swap last element into empty spot
        if (_index != openDisputeIds.length - 1) {
            openDisputeIds[_index] = lastId;
            idToQueueIndex[lastId] = _index;
        }

        openDisputeIds.pop();
        delete idToQueueIndex[idToRemove];
    }

    // Simple majority check: weights sum of votes for 0 vs 1
    function _determineWinner(uint256 _id) internal view returns (uint256) {
        uint256 votesFor0 = 0;
        uint256 votesFor1 = 0;
        address[] memory jurors = disputeJurors[_id];

        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            if (hasRevealed[_id][j]) {
                uint256 v = revealedVotes[_id][j];
                uint256 weight = jurorStakes[_id][j];

                if (v == 0) votesFor0 += weight;
                else if (v == 1) votesFor1 += weight;
            }
        }
        return votesFor1 > votesFor0 ? 1 : 0;
    }

    // Proportional Reward Distribution
    // Winners share the losing pool based on their stake weight
    function _distributeRewards(uint256 _id, uint256 winningChoice) internal {
        address[] memory jurors = disputeJurors[_id];
        uint256 totalWinningStake = 0;
        uint256 totalLosingStake = 0;

        // 1. Calculate Pools
        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            uint256 s = jurorStakes[_id][j];

            if (hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice) {
                totalWinningStake += s;
            } else {
                totalLosingStake += s;
            }
        }

        // 2. Distribute
        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            jurorStats[j].totalDisputes++;

            bool isWinner = hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice;

            if (isWinner) {
                jurorStats[j].coherentVotes++;
                uint256 myStake = jurorStakes[_id][j];

                if (totalWinningStake > 0) {
                    // Reward = Stake + (Stake/TotalWinningStake * LosingPool)
                    uint256 myShare = (myStake * totalLosingStake) / totalWinningStake;
                    jurorStats[j].totalEarnings += myShare;
                    balances[j] += (myStake + myShare);
                } else {
                    // Edge case: Return principal only
                    balances[j] += myStake;
                }
            }
        }
    }
}
