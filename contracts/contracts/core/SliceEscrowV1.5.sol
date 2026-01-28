// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// --- INTERFACES ---

interface ISlice {
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

    function createDispute(CreateDisputeParams calldata _params) external returns (uint256);

    function payDispute(uint256 _id) external;

    function courtConfigs(string memory _category) external view returns (CourtConfig memory);

    function stakingToken() external view returns (IERC20);

    function getDisputeCost(uint256 _id) external view returns (uint256);

    // Getters
    function MAX_JURORS() external view returns (uint256);
}

interface IArbitrable {
    function rule(uint256 _disputeId, uint256 _ruling) external;
}

/**
 * @title SliceEscrow (The Arbitrable)
 * @author Slice Coding Expert
 * @notice A Universal Escrow "wrapper" that turns Slice V1.5 into a secure P2P payment system.
 *
 * ======================================================================================
 * 1. ARCHITECTURE: THE "SAFE BOX" PATTERN
 * ======================================================================================
 * Users (Frontends/EOAs) cannot easily receive callbacks from Slice.
 * This contract acts as a programmable "Safe Box" that sits between the User and Slice.
 *
 * - Happy Path (No Dispute):
 * Buyer deposits Money -> Safe Box holds it -> Buyer clicks "Release" -> Seller gets paid.
 * (Slice is never involved, saving gas and fees).
 *
 * - Sad Path (Dispute):
 * Buyer/Seller flags issue -> Safe Box freezes funds -> Calls Slice -> Slice rules -> Safe Box obeys.
 *
 * ======================================================================================
 * 2. ASSET SEPARATION (Principal vs. Fees)
 * ======================================================================================
 * We separate the "Value being moved" from the "Cost of Justice".
 *
 * [A] PRINCIPAL (Held in THIS Contract)
 * --------------------------------------------------------------------------------------
 * This is the transaction value (e.g., 1,000 USDC for a laptop).
 * - It is locked here upon creation.
 * - It NEVER leaves this contract until:
 * a) Buyer releases it manually.
 * b) Slice triggers rule() to force a release.
 *
 * [B] ARBITRATION COST (Sent to SLICE Contract)
 * --------------------------------------------------------------------------------------
 * If a dispute arises, BOTH parties must pay the "Cost of Justice" to proceed.
 * This ensures the loser pays for the arbitration.
 *
 * Cost Per Party = (JurorsRequired × FeePerJuror) + PartyStake
 *
 * - Funds flow: User -> SliceEscrow -> Slice.
 * - FEE TIMEOUT: If one party pays but the other doesn't within the timeout,
 *   the paying party wins by default.
 *
 * ======================================================================================
 * 3. TOKEN SEPARATION (Principal vs. Staking)
 * ======================================================================================
 * The Principal token (e.g., PEPE, ETH, any ERC20) can differ from the Staking token
 * used by Slice (e.g., USDC). This contract handles both independently.
 *
 * ======================================================================================
 * 4. THE "TRIANGLE OF TRUST" FLOW
 * ======================================================================================
 * 1. [Escrow] raiseDispute():
 * - Creates a "Draft" dispute in Slice.
 * - Status: "Created" (Waiting for fees).
 *
 * 2. [Escrow] payArbitrationFee():
 * - Collects Fee+Stake from Buyer & Seller (in Slice's staking token).
 * - Once BOTH pay, calls slice.payDispute().
 * - Status: "Active/Commit" (Jurors can now draft).
 * - FEE TIMEOUT: If opponent doesn't pay within timeout, paying party wins.
 *
 * 3. [Slice] executeRuling():
 * - Jurors vote. Winner is decided.
 * - Slice calls IArbitrable.rule() on THIS contract.
 *
 * 4. [Escrow] rule():
 * - Unlocks the Principal (1,000 USDC) to the Winner.
 */
contract SliceEscrow is IArbitrable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20; // Usage

    enum Status {
        Initial,
        Active,
        Disputed,
        Resolved
    }
    enum Side {
        None,
        Buyer,
        Seller
    }

    struct Transaction {
        address buyer;
        address seller;
        address token; // The currency of the PRINCIPAL payment (e.g. PEPE, WETH)
        uint256 amount; // The principal payment amount
        // Dispute Data
        string category; // Which Slice Court to use (e.g. "Tech")
        uint256 jurors; // How many jurors needed (e.g. 3)
        uint256 sliceDisputeId;
        Status status;
        // Fee Tracking (Who has paid the arbitration fees?)
        bool buyerFeePaid;
        bool sellerFeePaid;
        uint256 feesCollected;
        // Fee Timeout Tracking (prevents deadlock if opponent refuses to pay)
        uint256 firstFeePaymentTime; // When the first party paid their fee
    }

    ISlice public immutable slice;

    // Fee timeout constant (24 hours)
    uint256 public constant FEE_TIMEOUT = 1 days;

    // Dispute timeline constants (used when creating disputes in Slice)
    uint256 public constant PAY_DURATION = 1 days;
    uint256 public constant EVIDENCE_DURATION = 1 days;
    uint256 public constant COMMIT_DURATION = 2 days;
    uint256 public constant REVEAL_DURATION = 1 days;

    // Counter for internal Transaction IDs
    uint256 public txCount;
    mapping(uint256 => Transaction) public transactions;

    // Mapping from Slice Dispute ID -> Internal Transaction ID
    mapping(uint256 => uint256) public disputeToTx;

    // Events
    event TransactionCreated(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount);
    event FundsReleased(uint256 indexed txId, address to);
    event DisputeRaised(uint256 indexed txId, address raisedBy);
    event FeesDeposited(uint256 indexed txId, address party, uint256 amount);
    event DisputeActivated(uint256 indexed txId, uint256 sliceDisputeId);
    event FeeTimeoutClaimed(uint256 indexed txId, address winner);

    constructor(address _slice) Ownable(msg.sender) {
        slice = ISlice(_slice);
    }

    // ============================================
    // 1. CREATE TRANSACTION (Happy Path Start)
    // ============================================

    function createTransaction(
        address _seller,
        address _token,
        uint256 _amount,
        string calldata _category,
        uint256 _jurors
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_seller != msg.sender, "Cannot pay self");

        ISlice.CourtConfig memory config = slice.courtConfigs(_category);
        require(config.active, "Court is not active");
        require(_jurors > 0 && _jurors <= slice.MAX_JURORS(), "Invalid number of jurors");

        // 1. Pull the Principal (The Payment)
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        txCount++;
        uint256 txId = txCount;

        transactions[txId] = Transaction({
            buyer: msg.sender,
            seller: _seller,
            token: _token,
            amount: _amount,
            category: _category,
            jurors: _jurors,
            sliceDisputeId: 0,
            status: Status.Active,
            buyerFeePaid: false,
            sellerFeePaid: false,
            feesCollected: 0,
            firstFeePaymentTime: 0
        });

        emit TransactionCreated(txId, msg.sender, _seller, _amount);
        return txId;
    }

    // ============================================
    // 2. MANUAL RESOLUTION (No Slice needed)
    // ============================================

    /**
     * @notice Buyer is happy and releases funds to Seller.
     */
    function release(uint256 _txId) external nonReentrant {
        Transaction storage txn = transactions[_txId];
        require(msg.sender == txn.buyer, "Only buyer");
        require(txn.status == Status.Active, "Wrong status");

        txn.status = Status.Resolved;
        IERC20(txn.token).safeTransfer(txn.seller, txn.amount);

        emit FundsReleased(_txId, txn.seller);
    }

    /**
     * @notice Seller refunds the Buyer.
     */
    function refund(uint256 _txId) external nonReentrant {
        Transaction storage txn = transactions[_txId];
        require(msg.sender == txn.seller, "Only seller");
        require(txn.status == Status.Active, "Wrong status");

        txn.status = Status.Resolved;
        IERC20(txn.token).safeTransfer(txn.buyer, txn.amount);

        emit FundsReleased(_txId, txn.buyer);
    }

    // ============================================
    // 3. DISPUTE ESCALATION
    // ============================================

    /**
     * @notice Either party can flag a dispute.
     * @dev This freezes the state to 'Disputed' but doesn't call Slice yet.
     * Both parties must pay fees first.
     */
    function raiseDispute(uint256 _txId, string calldata _evidenceIpfs) external {
        Transaction storage txn = transactions[_txId];
        require(txn.status == Status.Active, "Not active");
        require(msg.sender == txn.buyer || msg.sender == txn.seller, "Not party");

        txn.status = Status.Disputed;

        // 1. Create the Dispute in Slice (Status: Created, Waiting for Payment)
        // We pass THIS contract as the 'Arbitrated', but register the Buyer/Seller addresses
        ISlice.CreateDisputeParams memory params = ISlice.CreateDisputeParams({
            claimer: txn.buyer,
            defender: txn.seller,
            category: txn.category,
            ipfsHash: _evidenceIpfs,
            jurorsRequired: txn.jurors,
            paySeconds: PAY_DURATION,
            evidenceSeconds: EVIDENCE_DURATION,
            commitSeconds: COMMIT_DURATION,
            revealSeconds: REVEAL_DURATION
        });

        uint256 sliceId = slice.createDispute(params);

        txn.sliceDisputeId = sliceId;
        disputeToTx[sliceId] = _txId;

        emit DisputeRaised(_txId, msg.sender);
    }

    /**
     * @notice Parties pay the Arbitration Fee + Stake to this contract.
     * @dev Uses Slice's staking token (not the principal token) for fees.
     * This allows trades in any token while paying arbitration in USDC.
     */
    function payArbitrationFee(uint256 _txId) external {
        Transaction storage txn = transactions[_txId];
        require(txn.status == Status.Disputed, "Not disputed");
        require(txn.sliceDisputeId != 0, "Dispute not initialized");

        // Calculate Cost using court config
        uint256 cost = slice.getDisputeCost(txn.sliceDisputeId);

        // Get Slice's staking token (e.g., USDC) - separate from principal token
        IERC20 stakingToken = slice.stakingToken();

        // Determine who is paying
        if (msg.sender == txn.buyer) {
            require(!txn.buyerFeePaid, "Already paid");
            txn.buyerFeePaid = true;
        } else if (msg.sender == txn.seller) {
            require(!txn.sellerFeePaid, "Already paid");
            txn.sellerFeePaid = true;
        } else {
            revert("Not party");
        }

        // Start timeout timer if this is the first fee payment
        if (txn.firstFeePaymentTime == 0) {
            txn.firstFeePaymentTime = block.timestamp;
        }

        // Pull tokens using Slice's staking token (not txn.token)
        stakingToken.safeTransferFrom(msg.sender, address(this), cost);
        txn.feesCollected += cost;

        emit FeesDeposited(_txId, msg.sender, cost);

        // If both paid, push funds to Slice
        if (txn.buyerFeePaid && txn.sellerFeePaid) {
            _activateSliceDispute(_txId, txn.feesCollected);
        }
    }

    function _activateSliceDispute(uint256 _txId, uint256 _totalFees) internal {
        Transaction storage txn = transactions[_txId];

        // Use Slice's staking token for approval (not txn.token)
        IERC20 stakingToken = slice.stakingToken();

        // Approve Slice to pull the fees
        stakingToken.forceApprove(address(slice), _totalFees);

        // Call Slice to change status from Created -> Commit
        // Slice V1.5 allows 'Arbitrated' (this contract) to pay
        slice.payDispute(txn.sliceDisputeId);

        emit DisputeActivated(_txId, txn.sliceDisputeId);
    }

    // ============================================
    // 3B. FEE TIMEOUT (Prevents Deadlock)
    // ============================================

    /**
     * @notice Claim victory if the opponent failed to pay arbitration fees in time.
     * @dev CRITICAL Prevents the "Fee Standoff" attack where one party refuses
     * to pay fees, locking funds indefinitely.
     *
     * Attack Vector (Before Fix):
     * 1. Buyer flags dispute and pays fee
     * 2. Seller refuses to pay fee
     * 3. Dispute never activates, funds locked forever
     *
     * Solution: If one party pays and the other doesn't within FEE_TIMEOUT,
     * the paying party automatically wins.
     */
    function timeoutOpponent(uint256 _txId) external nonReentrant {
        Transaction storage txn = transactions[_txId];
        require(txn.status == Status.Disputed, "Not disputed");
        require(txn.firstFeePaymentTime > 0, "No fees paid yet");
        require(block.timestamp > txn.firstFeePaymentTime + FEE_TIMEOUT, "Timeout not reached");

        // Exactly one party must have paid (XOR condition)
        require(txn.buyerFeePaid != txn.sellerFeePaid, "Both paid or neither paid");

        IERC20 stakingToken = slice.stakingToken();

        txn.status = Status.Resolved;

        // Case 1: Buyer paid, Seller didn't -> Buyer wins
        if (txn.buyerFeePaid && !txn.sellerFeePaid) {
            // Refund Buyer's arbitration fee (in staking token)
            stakingToken.safeTransfer(txn.buyer, txn.feesCollected);
            // Release Principal to Buyer (in principal token)
            IERC20(txn.token).safeTransfer(txn.buyer, txn.amount);

            emit FeeTimeoutClaimed(_txId, txn.buyer);
            emit FundsReleased(_txId, txn.buyer);
        }
        // Case 2: Seller paid, Buyer didn't -> Seller wins
        else if (txn.sellerFeePaid && !txn.buyerFeePaid) {
            // Refund Seller's arbitration fee (in staking token)
            stakingToken.safeTransfer(txn.seller, txn.feesCollected);
            // Release Principal to Seller (in principal token)
            IERC20(txn.token).safeTransfer(txn.seller, txn.amount);

            emit FeeTimeoutClaimed(_txId, txn.seller);
            emit FundsReleased(_txId, txn.seller);
        }
    }

    /**
     * @notice Check if fee timeout can be claimed for a transaction.
     * @param _txId The transaction ID.
     * @return canTimeout Whether timeout can be claimed.
     * @return timeRemaining Seconds until timeout (0 if already claimable).
     * @return potentialWinner Address that would win if timeout is claimed.
     */
    function getFeeTimeoutStatus(
        uint256 _txId
    ) external view returns (bool canTimeout, uint256 timeRemaining, address potentialWinner) {
        Transaction storage txn = transactions[_txId];

        if (txn.status != Status.Disputed || txn.firstFeePaymentTime == 0) {
            return (false, 0, address(0));
        }

        // Both paid or neither paid - no timeout possible
        if (txn.buyerFeePaid == txn.sellerFeePaid) {
            return (false, 0, address(0));
        }

        uint256 timeoutDeadline = txn.firstFeePaymentTime + FEE_TIMEOUT;

        if (block.timestamp > timeoutDeadline) {
            potentialWinner = txn.buyerFeePaid ? txn.buyer : txn.seller;
            return (true, 0, potentialWinner);
        } else {
            potentialWinner = txn.buyerFeePaid ? txn.buyer : txn.seller;
            return (false, timeoutDeadline - block.timestamp, potentialWinner);
        }
    }

    // ============================================
    // 4. CALLBACK (The Ruler)
    // ============================================

    function rule(uint256 _disputeId, uint256 _ruling) external override nonReentrant {
        require(msg.sender == address(slice), "Only Slice");

        uint256 txId = disputeToTx[_disputeId];
        Transaction storage txn = transactions[txId];
        require(txn.status == Status.Disputed, "Not disputed");

        txn.status = Status.Resolved;
        address winner;

        if (_ruling == 1) {
            // Ruling 1 = Claimer (Buyer) wins
            winner = txn.buyer;
        } else {
            // Ruling 0 = Defender (Seller) wins
            winner = txn.seller;
        }

        // Release the PRINCIPAL amount.
        // (Note: The Arbitration Fees/Stakes were already handled inside Slice.sol.
        // Slice sent the winner their deposit + bonus directly. We only manage the Principal here.)
        IERC20(txn.token).safeTransfer(winner, txn.amount);

        emit FundsReleased(txId, winner);
    }
}
