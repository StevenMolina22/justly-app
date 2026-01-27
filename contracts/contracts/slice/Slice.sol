// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IArbitrable
 * @notice Interface for contracts that wish to use Slice for dispute resolution.
 */
interface IArbitrable {
    /**
     * @dev Called by Slice to enforce the ruling.
     * @param _disputeId The ID of the dispute in Slice.
     * @param _ruling The ruling (0 or 1).
     */
    function rule(uint256 _disputeId, uint256 _ruling) external;
}

/**
 * @title Slice Protocol V1.5 (The Arbitrator)
 * @author Slice Coding Expert
 * @notice A neutral, scalable, on-chain dispute resolution protocol.
 *
 * ======================================================================================
 * 1. ARCHITECTURE: PUSH & FRAGMENTATION
 * ======================================================================================
 * - Multi-Court: Disputes are fragmented into categories (e.g., "Tech", "Commerce").
 * Jurors stake specific courts, ensuring domain expertise.
 * - Push Pattern: Slice does NOT hold the principal assets (e.g., the NFT or 1000 ETH).
 * Slice only holds the STAKES. The External Contract (Arbitrable) holds the ASSETS.
 * When a ruling is executed, Slice calls `rule(id, winner)` on the external contract.
 *
 * ======================================================================================
 * 2. ECONOMIC MODEL: THE "WATERFALL"
 * ======================================================================================
 * The protocol distinguishes between "Wages" (Fee) and "Penalties" (Stake).
 *
 * [A] DEPOSIT FORMULA (Cost to Create/Defend)
 * --------------------------------------------------------------------------------------
 * Parties must pay for the workers (Jurors) AND put up a penalty bond.
 *
 * Total Deposit = (JurorsRequired * FeePerJuror) + PartyStake
 *
 * Where:
 * - FeePerJuror: 100% goes to jurors (Gas + Wage).
 * - PartyStake:  The "Skin in the Game" penalty.
 *
 * [B] SETTLEMENT FORMULA (Where the money goes)
 * --------------------------------------------------------------------------------------
 * When a ruling is made, the Loser's "Fee" pays the jurors.
 * The Loser's "PartyStake" is split between the Winner and the Jurors.
 *
 * LoserStakeBonus = PartyStake * (100% - JurorRewardShare)
 * JurorStakeBonus = PartyStake * JurorRewardShare
 *
 * 1. Winner Payout = WinnerDeposit + LoserStakeBonus
 * (Winner gets their full money back + a bonus for being right)
 *
 * 2. Juror Pot     = (JurorsRequired * FeePerJuror) + JurorStakeBonus
 * (Jurors get their guaranteed wages + a high-yield bonus from the loser)
 *
 * ======================================================================================
 * 3. RISK MODEL: ALPHA (α) PENALTY
 * ======================================================================================
 * Defines how much of a juror's stake is slashed for voting incoherently.
 *
 * [C] PENALTY FORMULA
 * --------------------------------------------------------------------------------------
 * Alpha (α): Configurable per court (0% to 100%, stored as basis points).
 *
 * Incoherent Penalty = JurorStake * α
 * Juror Refund       = JurorStake - Incoherent Penalty
 *
 * - If α = 100%: Juror loses everything. (Binary/Objective disputes)
 * - If α = 10%:  Juror loses 10%, gets 90% back. (Subjective disputes)
 *
 * [D] REWARD DISTRIBUTION
 * --------------------------------------------------------------------------------------
 * Coherent jurors (Winners) earn a share of the External Pot (Fees) AND the Internal Pot (Penalties).
 *
 * Share = JurorStake / TotalWinningStake
 *
 * Juror Payout = Principal + (ExternalPot * Share) + (TotalPenalties * Share)
 */
contract Slice is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================
    // DATA STRUCTURES
    // ============================================

    enum DisputeStatus {
        Created,
        Commit,
        Reveal,
        Finished
    }

    struct CourtConfig {
        bool active;
        uint256 feePerJuror; // Wage per juror (paid by parties)
        uint256 partyStake; // Extra penalty stake (paid by parties)
        uint256 jurorRewardShare; // % of loser's stake that goes to jurors (Basis Points: 5000 = 50%)
        uint256 minJurorStake; // Min stake to draft
        uint256 maxJurorStake; // Sybil resistance cap
        uint256 minVoteDuration; // Minimum seconds for commit/reveal phases
        uint256 maxVoteDuration; // Maximum seconds for commit/reveal phases
        uint256 alpha; // Incoherence Penalty (Basis Points: 10000 = 100% slashed)
    }

    struct Dispute {
        uint256 id;
        address arbitrated; // The contract that created the dispute (and receives callback)
        address claimer;
        address defender;
        string category;
        // --- Economic Snapshot (Immutable once created) ---
        uint256 feePerJuror;
        uint256 partyStake;
        uint256 jurorRewardShare;
        uint256 jurorsRequired;
        uint256 alpha;
        // --- State ---
        string ipfsHash;
        uint256 commitsCount;
        uint256 revealsCount;
        DisputeStatus status;
        bool claimerPaid;
        bool defenderPaid;
        address winner;
        // --- Phase Durations (Stored at creation, used to calculate deadlines at activation) ---
        uint256 evidenceDuration;
        uint256 commitDuration;
        uint256 revealDuration;
        // --- Timestamps (Calculated when dispute is activated via payDispute) ---
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
    // CONSTANTS
    // ============================================
    uint256 public constant MAX_JURORS = 31;

    // ============================================
    // STATE VARIABLES
    // ============================================

    uint256 public disputeCount;
    IERC20 public immutable stakingToken;
    address public treasury; // Governance treasury for "Reward Black Hole" edge case

    // Court Configuration & Queues
    mapping(string => CourtConfig) public courtConfigs;
    mapping(string => uint256[]) public courtQueues;
    mapping(uint256 => uint256) public idToQueueIndex;

    // Core Data
    mapping(uint256 => Dispute) internal disputeStore;
    mapping(uint256 => address[]) public disputeJurors;

    // Voting
    mapping(uint256 => mapping(address => bytes32)) public commitments;
    mapping(uint256 => mapping(address => uint256)) public revealedVotes;
    mapping(uint256 => mapping(address => bool)) public hasRevealed;

    // Financials
    mapping(uint256 => mapping(address => uint256)) public jurorStakes;
    mapping(address => uint256) public balances;
    mapping(address => JurorStats) public jurorStats;

    // Indexing
    mapping(address => uint256[]) private jurorDisputes;
    mapping(address => uint256[]) private userDisputes;

    // ============================================
    // EVENTS
    // ============================================

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

    constructor(address _stakingToken, address _treasury) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        treasury = _treasury;

        // Initialize "General" Court
        courtConfigs["General"] = CourtConfig({
            active: true,
            feePerJuror: 5 * 10 ** 6, // 5 USDC
            partyStake: 50 * 10 ** 6, // 50 USDC
            jurorRewardShare: 5000, // 50%
            minJurorStake: 10 * 10 ** 6, // 10 USDC
            maxJurorStake: 1000 * 10 ** 6, // 1000 USDC
            minVoteDuration: 3600, // 1 Hour
            maxVoteDuration: 604800, // 1 Week
            alpha: 10000 // 100% Penalty
        });
    }

    // ============================================
    // ADMIN: COURT MANAGEMENT
    // ============================================

    function setCourt(string memory _category, CourtConfig memory _config) external onlyOwner {
        require(_config.jurorRewardShare <= 10000, "Share > 100%");
        require(_config.alpha <= 10000, "Alpha > 100%");
        require(_config.minVoteDuration <= _config.maxVoteDuration, "Invalid duration range");

        courtConfigs[_category] = _config;
        emit CourtUpdated(_category, _config.feePerJuror, _config.alpha);
    }

    /**
     * @notice Update the treasury address for governance rewards.
     * @param _treasury The new treasury address.
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    // ============================================
    // 1. DISPUTE LIFECYCLE: CREATION
    // ============================================

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

    /**
     * @notice Create a dispute with custom timelines.
     * @param _params Struct containing all dispute creation parameters.
     */
    function createDispute(CreateDisputeParams calldata _params) external returns (uint256) {
        CourtConfig memory cc = courtConfigs[_params.category];
        require(cc.active, "Court inactive");
        require(_params.jurorsRequired > 0 && _params.jurorsRequired <= MAX_JURORS, "Invalid juror count");

        // Validate Timelines against Court Guardrails
        require(_params.commitSeconds >= cc.minVoteDuration && _params.commitSeconds <= cc.maxVoteDuration, "Commit duration OOB");
        require(_params.revealSeconds >= cc.minVoteDuration && _params.revealSeconds <= cc.maxVoteDuration, "Reveal duration OOB");
        require(_params.paySeconds >= 3600, "Pay time too short"); // Hard floor 1 hour
        require(_params.evidenceSeconds >= 3600, "Evidence time too short"); // Hard floor 1 hour

        disputeCount++;
        uint256 id = disputeCount;

        Dispute storage d = disputeStore[id];
        d.id = id;
        d.arbitrated = msg.sender;
        d.claimer = _params.claimer;
        d.defender = _params.defender;
        d.category = _params.category;

        // Snapshot Economics
        d.feePerJuror = cc.feePerJuror;
        d.partyStake = cc.partyStake;
        d.jurorRewardShare = cc.jurorRewardShare;
        d.jurorsRequired = _params.jurorsRequired;
        d.alpha = cc.alpha;

        d.ipfsHash = _params.ipfsHash;
        d.status = DisputeStatus.Created;

        // Store Phase Durations (Deadlines calculated at activation in payDispute)
        d.evidenceDuration = _params.evidenceSeconds;
        d.commitDuration = _params.commitSeconds;
        d.revealDuration = _params.revealSeconds;
        
        // Only set pay deadline at creation (the only deadline that matters before activation)
        d.payDeadline = block.timestamp + _params.paySeconds;

        userDisputes[_params.claimer].push(id);
        userDisputes[_params.defender].push(id);

        emit DisputeCreated(id, msg.sender, _params.claimer, _params.defender);
        return id;
    }

    function getDisputeCost(uint256 _id) public view returns (uint256) {
        Dispute memory d = disputeStore[_id];
        return (d.feePerJuror * d.jurorsRequired) + d.partyStake;
    }

    function payDispute(uint256 _id) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Created, "Payment closed");
        require(block.timestamp <= d.payDeadline, "Deadline passed");

        bool isClaimer = msg.sender == d.claimer;
        bool isDefender = msg.sender == d.defender;
        bool isArbitrated = msg.sender == d.arbitrated && d.arbitrated != address(0);

        require(isClaimer || isDefender || isArbitrated, "Not authorized");

        uint256 cost = getDisputeCost(_id);

        // Update payment status
        if (isClaimer) {
            require(!d.claimerPaid, "Already paid");
            d.claimerPaid = true;
        } else if (isDefender) {
            require(!d.defenderPaid, "Already paid");
            d.defenderPaid = true;
        } else if (isArbitrated) {
            // Escrow/Contract pays for both sides logic
            d.claimerPaid = true;
            d.defenderPaid = true;
        }

        // Use SafeERC20 to prevent reverts with USDT
        stakingToken.safeTransferFrom(msg.sender, address(this), cost);

        emit FundsDeposited(_id, msg.sender, cost);

        // Advance state when both parties have paid
        if (d.claimerPaid && d.defenderPaid) {
            d.status = DisputeStatus.Commit;
            
            // FIX: Calculate deadlines relative to NOW (Activation Time)
            // This prevents "Expired on Arrival" disputes where phases have
            // effectively zero time if payment happens late in the pay window
            d.evidenceDeadline = block.timestamp + d.evidenceDuration;
            d.commitDeadline = d.evidenceDeadline + d.commitDuration;
            d.revealDeadline = d.commitDeadline + d.revealDuration;
            
            _addToCourtQueue(d.category, _id);
            emit StatusChanged(_id, DisputeStatus.Commit);
        }
    }

    // ============================================
    // 2. MATCHMAKING & JUROR SELECTION
    // ============================================

    function drawDispute(uint256 _amount, string calldata _category) external {
        CourtConfig memory cc = courtConfigs[_category];
        require(cc.active, "Court inactive");
        require(_amount >= cc.minJurorStake, "Stake too low");
        require(_amount <= cc.maxJurorStake, "Stake too high");

        uint256[] storage queue = courtQueues[_category];
        require(queue.length > 0, "No disputes pending");

        // Random Selection (VRF recommended for Mainnet, simplified here)
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        uint256 index = seed % queue.length;
        uint256 id = queue[index];

        Dispute storage d = disputeStore[id];

        require(block.timestamp < d.commitDeadline, "Expired");
        require(msg.sender != d.claimer && msg.sender != d.defender, "Conflict of interest");
        require(!_isJuror(id, msg.sender), "Already a juror");

        // Safe transfer
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);

        disputeJurors[id].push(msg.sender);
        jurorStakes[id][msg.sender] = _amount;
        jurorDisputes[msg.sender].push(id);

        emit JurorJoined(id, msg.sender, _category);

        if (disputeJurors[id].length >= d.jurorsRequired) {
            _removeFromCourtQueue(_category, index);
        }
    }

    // ============================================
    // 3. VOTING
    // ============================================

    function commitVote(uint256 _id, bytes32 _commitment) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Commit, "Wrong phase");
        require(block.timestamp <= d.commitDeadline, "Voting ended");
        require(_isJuror(_id, msg.sender), "Not juror");
        require(commitments[_id][msg.sender] == bytes32(0), "Already committed");

        commitments[_id][msg.sender] = _commitment;
        d.commitsCount++;
        emit VoteCommitted(_id, msg.sender);

        if (disputeJurors[_id].length == d.jurorsRequired && d.commitsCount == d.jurorsRequired) {
            d.status = DisputeStatus.Reveal;
            emit StatusChanged(_id, DisputeStatus.Reveal);
        }
    }

    function revealVote(uint256 _id, uint256 _vote, uint256 _salt) external {
        Dispute storage d = disputeStore[_id];

        if (d.status == DisputeStatus.Commit && block.timestamp > d.commitDeadline) {
            d.status = DisputeStatus.Reveal;
        }

        require(d.status == DisputeStatus.Reveal, "Wrong phase");
        require(_isJuror(_id, msg.sender), "Not juror");
        require(!hasRevealed[_id][msg.sender], "Already revealed");

        bytes32 verify = keccak256(abi.encodePacked(_vote, _salt));
        require(verify == commitments[_id][msg.sender], "Hash mismatch");

        revealedVotes[_id][msg.sender] = _vote;
        hasRevealed[_id][msg.sender] = true;
        d.revealsCount++;

        emit VoteRevealed(_id, msg.sender, _vote);
    }

    // ============================================
    // 4. RULING & SETTLEMENT
    // ============================================

    function executeRuling(uint256 _id) external nonReentrant {
        Dispute storage d = disputeStore[_id];

        if (d.status == DisputeStatus.Commit && block.timestamp > d.commitDeadline) {
            d.status = DisputeStatus.Reveal;
        }

        bool timePassed = block.timestamp > d.revealDeadline;
        bool allRevealed = (d.commitsCount > 0 && d.commitsCount == d.revealsCount);
        require(d.status == DisputeStatus.Reveal, "Wrong phase");
        require(timePassed || allRevealed, "Cannot execute");

        // 1. Determine Winner
        uint256 winningChoice = _determineWinner(_id);
        address winnerAddr = winningChoice == 1 ? d.claimer : d.defender;

        d.winner = winnerAddr;
        d.status = DisputeStatus.Finished;

        // 2. Financial Settlement (Internal)
        _settleFinances(_id, winningChoice, winnerAddr);

        // 3. Callback (External)
        if (d.arbitrated != address(0)) {
            try IArbitrable(d.arbitrated).rule(_id, winningChoice) {
                emit RulingSent(d.arbitrated, _id, winningChoice);
            } catch {
                // Emit event to signal callback failure, but ruling is preserved
            }
        }

        emit RulingExecuted(_id, winnerAddr, 0);
    }

    function _settleFinances(uint256 _id, uint256 _winningChoice, address _winnerAddr) internal {
        Dispute storage d = disputeStore[_id];

        // A. Parties Settlement
        uint256 totalDeposit = (d.feePerJuror * d.jurorsRequired) + d.partyStake;
        uint256 loserStakeBonus = (d.partyStake * (10000 - d.jurorRewardShare)) / 10000;

        balances[_winnerAddr] += totalDeposit + loserStakeBonus;

        // B. Juror Pot Calculation
        uint256 totalArbitrationFees = d.feePerJuror * d.jurorsRequired;
        uint256 jurorStakeBonus = d.partyStake - loserStakeBonus;
        uint256 externalPot = totalArbitrationFees + jurorStakeBonus;

        // C. Distribute to Jurors (with Alpha logic)
        _distributeJurorRewards(_id, _winningChoice, externalPot);
    }

    function _distributeJurorRewards(uint256 _id, uint256 winningChoice, uint256 _externalPot) internal {
        Dispute storage d = disputeStore[_id];
        address[] memory jurors = disputeJurors[_id];

        uint256 totalWinningJurorStake = 0;
        uint256 totalPenaltyCollected = 0;

        // Pass 1: Collect Penalties
        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            uint256 s = jurorStakes[_id][j];

            bool isCorrect = hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice;

            if (isCorrect) {
                totalWinningJurorStake += s;
            } else {
                uint256 penalty = (s * d.alpha) / 10000;
                totalPenaltyCollected += penalty;

                uint256 remainder = s - penalty;
                if (remainder > 0) {
                    balances[j] += remainder;
                }
            }
            jurorStats[j].totalDisputes++;
        }

        if (totalWinningJurorStake > 0) {
            // Pass 2: Pay Winners
            for (uint i = 0; i < jurors.length; i++) {
                address j = jurors[i];
                bool isCorrect = hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice;

                if (isCorrect) {
                    uint256 myStake = jurorStakes[_id][j];

                    balances[j] += myStake; // Return Principal

                    uint256 penaltyShare = (myStake * totalPenaltyCollected) / totalWinningJurorStake;
                    uint256 externalShare = (myStake * _externalPot) / totalWinningJurorStake;

                    uint256 totalProfit = penaltyShare + externalShare;
                    balances[j] += totalProfit;

                    jurorStats[j].coherentVotes++;
                    jurorStats[j].totalEarnings += totalProfit;
                }
            }
        } else {
            // "Reward Black Hole" Edge Case: All jurors voted incoherently
            // FIX: Do NOT give penalties to the default winner (incentivizes "lazy winner" attacks).
            // Instead, send external pot to winner but penalties go to treasury.
            balances[d.winner] += _externalPot;
            
            // Penalties collected from incoherent jurors go to governance treasury
            // This funds protocol development rather than rewarding confusion
            if (totalPenaltyCollected > 0 && treasury != address(0)) {
                balances[treasury] += totalPenaltyCollected;
            }
            // If no treasury set, penalties remain in contract (effectively burned)
        }
    }

    // ============================================
    // INTERNAL HELPERS
    // ============================================

    function _determineWinner(uint256 _id) internal view returns (uint256) {
        uint256 votes0 = 0;
        uint256 votes1 = 0;
        address[] memory jurors = disputeJurors[_id];
        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            if (hasRevealed[_id][j]) {
                uint256 w = jurorStakes[_id][j];
                if (revealedVotes[_id][j] == 0) votes0 += w;
                else if (revealedVotes[_id][j] == 1) votes1 += w;
            }
        }
        return votes1 > votes0 ? 1 : 0;
    }

    function _addToCourtQueue(string memory _category, uint256 _id) internal {
        courtQueues[_category].push(_id);
        idToQueueIndex[_id] = courtQueues[_category].length - 1;
    }

    function _removeFromCourtQueue(string memory _category, uint256 _index) internal {
        uint256[] storage queue = courtQueues[_category];
        uint256 lastId = queue[queue.length - 1];
        uint256 idToRemove = queue[_index];
        if (_index != queue.length - 1) {
            queue[_index] = lastId;
            idToQueueIndex[lastId] = _index;
        }
        queue.pop();
        delete idToQueueIndex[idToRemove];
    }

    function _isJuror(uint256 _id, address _user) internal view returns (bool) {
        address[] memory jurors = disputeJurors[_id];
        for (uint i = 0; i < jurors.length; i++) {
            if (jurors[i] == _user) return true;
        }
        return false;
    }

    function withdraw(address _token) external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds");
        require(_token == address(stakingToken), "Wrong token");

        balances[msg.sender] = 0;
        stakingToken.safeTransfer(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    // View Helpers
    function disputes(uint256 _id) external view returns (Dispute memory) {
        return disputeStore[_id];
    }
}
