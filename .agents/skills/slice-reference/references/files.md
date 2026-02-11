# Files

## File: slice_sc/script/DeploySlice.s.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {Slice} from "../src/core/Slice.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract DeploySliceScript is Script {
    uint256 internal constant BASE_CHAIN_ID = 8453;
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;

    address internal constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant BASE_SEPOLIA_USDC = 0x672B6F3A85d697195eCe0ef318924D034122B2bb;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 chainId = block.chainid;
        address usdcAddressOverride = vm.envOr("USDC_ADDRESS", address(0));

        console2.log("Deploying Slice on chain:", chainId);

        address usdcAddress = _resolveUsdc(deployerPk, chainId, usdcAddressOverride);

        vm.startBroadcast(deployerPk);
        Slice slice = new Slice(usdcAddress);
        vm.stopBroadcast();

        console2.log("Slice deployed at:", address(slice));
        console2.log("USDC used:", usdcAddress);
    }

    function _resolveUsdc(
        uint256 deployerPk,
        uint256 chainId,
        address usdcAddressOverride
    ) internal returns (address usdcAddress) {
        if (usdcAddressOverride != address(0)) {
            return usdcAddressOverride;
        }

        if (chainId == BASE_CHAIN_ID) {
            return BASE_USDC;
        }

        if (chainId == BASE_SEPOLIA_CHAIN_ID) {
            return BASE_SEPOLIA_USDC;
        }

        vm.startBroadcast(deployerPk);
        MockUSDC mock = new MockUSDC();
        vm.stopBroadcast();

        console2.log("MockUSDC deployed at:", address(mock));
        return address(mock);
    }
}
````

## File: slice_sc/script/SeedSlice.s.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Slice} from "../src/core/Slice.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract SeedSliceScript is Script {
    uint256 internal constant BASE_CHAIN_ID = 8453;
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;

    address internal constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant BASE_SEPOLIA_USDC = 0x672B6F3A85d697195eCe0ef318924D034122B2bb;

    uint256 internal constant USDC_DECIMALS = 1e6;
    uint256 internal constant SEED_STAKE = 1 * USDC_DECIMALS;
    uint256 internal constant SEED_MIN_DEFENDER_BALANCE = 100 * USDC_DECIMALS;
    uint256 internal constant ONE_WEEK = 7 days;

    struct SeedCase {
        string category;
        string ipfsHash;
    }

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 defenderPk = vm.envUint("DEFENDER_PRIVATE_KEY");
        address sliceAddress = vm.envAddress("SLICE_ADDRESS");

        address usdcOverride = vm.envOr("USDC_ADDRESS", address(0));
        address usdcAddress = _resolveUsdcAddress(block.chainid, usdcOverride);

        bool isMockUsdc = block.chainid != BASE_CHAIN_ID && block.chainid != BASE_SEPOLIA_CHAIN_ID;

        console2.log("Seeding Slice at:", sliceAddress);
        console2.log("Using USDC at:", usdcAddress);

        _seedDisputes(Slice(sliceAddress), usdcAddress, deployerPk, defenderPk, isMockUsdc);
    }

    function _resolveUsdcAddress(uint256 chainId, address usdcOverride) internal pure returns (address) {
        if (usdcOverride != address(0)) {
            return usdcOverride;
        }

        if (chainId == BASE_CHAIN_ID) {
            return BASE_USDC;
        }

        if (chainId == BASE_SEPOLIA_CHAIN_ID) {
            return BASE_SEPOLIA_USDC;
        }

        revert("USDC_ADDRESS required for non-Base networks");
    }

    function _seedDisputes(
        Slice slice,
        address usdcAddress,
        uint256 deployerPk,
        uint256 defenderPk,
        bool isMockUsdc
    ) internal {
        address deployer = vm.addr(deployerPk);
        address defender = vm.addr(defenderPk);
        IERC20 usdc = IERC20(usdcAddress);

        _ensureEth(deployerPk, defender);
        _ensureDefenderUsdc(usdc, usdcAddress, deployerPk, defender, isMockUsdc);

        SeedCase[] memory cases = _seedCases();

        uint256 requiredAllowance = SEED_STAKE * cases.length;
        _ensureApproval(usdc, deployerPk, address(slice), requiredAllowance);
        _ensureApproval(usdc, defenderPk, address(slice), requiredAllowance);

        vm.startBroadcast(deployerPk);
        for (uint256 i = 0; i < cases.length; i++) {
            Slice.DisputeConfig memory config = Slice.DisputeConfig({
                claimer: deployer,
                defender: defender,
                category: cases[i].category,
                ipfsHash: cases[i].ipfsHash,
                jurorsRequired: 1,
                paySeconds: ONE_WEEK,
                evidenceSeconds: ONE_WEEK,
                commitSeconds: ONE_WEEK,
                revealSeconds: ONE_WEEK
            });

            uint256 disputeId = slice.createDispute(config);
            slice.payDispute(disputeId);

            vm.stopBroadcast();
            vm.startBroadcast(defenderPk);
            slice.payDispute(disputeId);
            vm.stopBroadcast();

            console2.log("Seeded dispute id:", disputeId);
            vm.startBroadcast(deployerPk);
        }
        vm.stopBroadcast();
    }

    function _ensureEth(uint256 deployerPk, address recipient) internal {
        if (recipient.balance >= 0.0001 ether) {
            return;
        }

        vm.startBroadcast(deployerPk);
        (bool sent,) = payable(recipient).call{value: 0.001 ether}("");
        vm.stopBroadcast();
        require(sent, "Failed to fund defender with ETH");
    }

    function _ensureDefenderUsdc(
        IERC20 usdc,
        address usdcAddress,
        uint256 deployerPk,
        address defender,
        bool isMockUsdc
    ) internal {
        uint256 defenderBalance = usdc.balanceOf(defender);
        if (defenderBalance >= SEED_MIN_DEFENDER_BALANCE) {
            return;
        }

        uint256 deficit = SEED_MIN_DEFENDER_BALANCE - defenderBalance;

        vm.startBroadcast(deployerPk);
        if (isMockUsdc) {
            MockUSDC(usdcAddress).mint(defender, deficit);
        } else {
            bool success = usdc.transfer(defender, deficit);
            require(success, "Failed to transfer USDC to defender");
        }
        vm.stopBroadcast();
    }

    function _ensureApproval(IERC20 usdc, uint256 ownerPk, address spender, uint256 amount) internal {
        address owner = vm.addr(ownerPk);
        uint256 allowance = usdc.allowance(owner, spender);

        if (allowance >= amount) {
            return;
        }

        vm.startBroadcast(ownerPk);
        bool success = usdc.approve(spender, type(uint256).max);
        vm.stopBroadcast();
        require(success, "USDC approve failed");
    }

    function _seedCases() internal pure returns (SeedCase[] memory cases) {
        string memory rootCid = "bafybeifa6gsnklvyvepp45ilf4ngc5o3ndydq7zxcdgrfybxs6flts6mdi";

        cases = new SeedCase[](3);
        cases[0] = SeedCase({category: "Freelance", ipfsHash: string.concat(rootCid, "/freelance.json")});
        cases[1] = SeedCase({category: "P2P Trade", ipfsHash: string.concat(rootCid, "/p2p.json")});
        cases[2] = SeedCase({category: "Marketplace", ipfsHash: string.concat(rootCid, "/marketplace.json")});
    }
}
````

## File: slice_sc/src/core/P2PTradeEscrow.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {ISlice} from "../interfaces/ISlice.sol";
import {IArbitrable} from "../interfaces/IArbitrable.sol";

contract P2PTradeEscrow is AccessControl, ReentrancyGuard, Pausable, IArbitrable {
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant FILLER_PAYMENT_TIMEOUT = 30 minutes;
    uint256 public constant FEE_TIMEOUT = 1 days;

    uint256 public constant PAY_DURATION = 1 days;
    uint256 public constant EVIDENCE_DURATION = 1 days;
    uint256 public constant COMMIT_DURATION = 2 days;
    uint256 public constant REVEAL_DURATION = 1 days;

    enum FiatCurrency {
        USD,
        EUR,
        BRL,
        MXN,
        OTHER
    }

    enum PaymentMethod {
        BANK_TRANSFER,
        CARD,
        CASH,
        MOBILE_MONEY,
        OTHER
    }

    enum OrderStatus {
        NONE,
        AWAITING_FILLER,
        AWAITING_PAYMENT,
        AWAITING_CONFIRMATION,
        DISPUTED,
        COMPLETED,
        REFUNDED,
        CANCELLED
    }

    struct Order {
        FiatCurrency fiatCurrency;
        PaymentMethod paymentMethod;
        bool fromCrypto;
        uint256 amount;
        uint256 exchangeRate;
        uint256 deadline;
        uint256 fiatTransferDeadline;
        address creator;
        address filler;
        address token;
        OrderStatus status;
        uint256 sliceDisputeId;
        address claimer;
        address defender;
        bool creatorFeePaid;
        bool fillerFeePaid;
        uint256 feesCollected;
        uint256 firstFeePaymentTime;
    }

    error InvalidAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InvalidSender();
    error InvalidOrderStatus();
    error OrderExpired();
    error FiatTransferNotExpired();
    error OrderNotFound();
    error NotParty();
    error FeeAlreadyPaid();
    error FeeTimeoutNotReached();
    error InvalidFeeTimeoutState();
    error OnlySlice();
    error DisputeNotInitialized();
    error InvalidEvidence();
    error InvalidJurorCount();
    error InactiveCourt();

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    mapping(uint256 => uint256) public orderToDisputeId;
    mapping(uint256 => uint256) public disputeToOrderId;

    address public immutable usdc;
    ISlice public immutable slice;
    IERC20 public immutable arbitrationToken;

    string public courtCategory;
    uint256 public jurorsRequired;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed creator,
        uint256 amount,
        FiatCurrency fiatCurrency,
        PaymentMethod paymentMethod,
        bool fromCrypto
    );
    event OrderCancelled(uint256 indexed orderId, address indexed cancelledBy);
    event FillerFound(uint256 indexed orderId, address indexed filler);
    event FiatPaymentSubmitted(uint256 indexed orderId, address indexed submittedBy);
    event FiatTransferTimeout(uint256 indexed orderId);
    event FiatPaymentConfirmed(uint256 indexed orderId, address indexed confirmer);
    event CryptoPaymentRefunded(uint256 indexed orderId, address indexed refundedBy);
    event FiatPaymentDisputed(uint256 indexed orderId, address indexed disputedBy);

    event SliceDisputeCreated(
        uint256 indexed orderId,
        uint256 indexed disputeId,
        address indexed claimer,
        address defender,
        string evidenceIpfs
    );
    event EvidenceSubmittedToSlice(uint256 indexed orderId, uint256 indexed disputeId, address indexed party, string ipfsHash);
    event ArbitrationFeePaid(uint256 indexed orderId, address indexed payer, uint256 amount);
    event SliceDisputeActivated(uint256 indexed orderId, uint256 indexed disputeId);
    event FeeTimeoutClaimed(uint256 indexed orderId, address indexed winner);
    event SliceRulingReceived(uint256 indexed orderId, uint256 indexed disputeId, uint256 ruling, address winner);

    constructor(address _usdc, address _slice, string memory _courtCategory, uint256 _jurorsRequired) {
        if (_usdc == address(0) || _slice == address(0)) revert InvalidAddress();

        usdc = _usdc;
        slice = ISlice(_slice);
        arbitrationToken = ISlice(_slice).stakingToken();

        if (_jurorsRequired == 0 || _jurorsRequired > ISlice(_slice).MAX_JURORS()) {
            revert InvalidJurorCount();
        }

        ISlice.CourtConfig memory config = ISlice(_slice).courtConfigs(_courtCategory);
        if (!config.active) revert InactiveCourt();

        courtCategory = _courtCategory;
        jurorsRequired = _jurorsRequired;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    modifier onlyExistingOrder(uint256 orderId) {
        if (orders[orderId].status == OrderStatus.NONE) revert OrderNotFound();
        _;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function createOrder(
        FiatCurrency fiatCurrency,
        PaymentMethod paymentMethod,
        bool fromCrypto,
        uint256 amount,
        uint256 exchangeRate,
        uint256 duration
    ) external whenNotPaused {
        if (amount == 0 || exchangeRate == 0) revert InvalidAmount();
        if (duration > MAX_DURATION) revert InvalidDuration();

        uint256 orderId = orderCount;
        orderCount++;

        Order storage order = orders[orderId];
        order.fiatCurrency = fiatCurrency;
        order.paymentMethod = paymentMethod;
        order.fromCrypto = fromCrypto;
        order.amount = amount;
        order.exchangeRate = exchangeRate;
        order.deadline = block.timestamp + duration;
        order.fiatTransferDeadline = 0;
        order.creator = msg.sender;
        order.filler = address(0);
        order.token = usdc;
        order.status = OrderStatus.AWAITING_FILLER;

        if (fromCrypto) {
            IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit OrderCreated(orderId, msg.sender, amount, fiatCurrency, paymentMethod, fromCrypto);
    }

    function cancelOrder(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_FILLER) revert InvalidOrderStatus();
        if (msg.sender != order.creator) revert InvalidSender();

        order.status = OrderStatus.CANCELLED;

        if (order.fromCrypto) {
            IERC20(usdc).safeTransfer(order.creator, order.amount);
        }

        emit OrderCancelled(orderId, msg.sender);
    }

    function takeOrder(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_FILLER) revert InvalidOrderStatus();
        if (msg.sender == order.creator) revert InvalidSender();
        if (order.deadline <= block.timestamp) revert OrderExpired();

        if (!order.fromCrypto) {
            IERC20(usdc).safeTransferFrom(msg.sender, address(this), order.amount);
        }

        order.filler = msg.sender;
        order.status = OrderStatus.AWAITING_PAYMENT;
        order.fiatTransferDeadline = block.timestamp + FILLER_PAYMENT_TIMEOUT;

        emit FillerFound(orderId, msg.sender);
    }

    function submitFiatPayment(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_PAYMENT) revert InvalidOrderStatus();

        if (order.fromCrypto) {
            if (msg.sender != order.filler) revert InvalidSender();
        } else {
            if (msg.sender != order.creator) revert InvalidSender();
        }

        order.status = OrderStatus.AWAITING_CONFIRMATION;
        emit FiatPaymentSubmitted(orderId, msg.sender);
    }

    function executeFiatTransferTimeout(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_PAYMENT) revert InvalidOrderStatus();
        if (order.fiatTransferDeadline >= block.timestamp) revert FiatTransferNotExpired();

        if (order.fromCrypto) {
            if (msg.sender != order.creator) revert InvalidSender();
        } else {
            if (msg.sender != order.filler) revert InvalidSender();

            IERC20(usdc).safeTransfer(order.filler, order.amount);
        }

        order.status = OrderStatus.AWAITING_FILLER;
        order.filler = address(0);
        order.fiatTransferDeadline = 0;

        emit FiatTransferTimeout(orderId);
    }

    function confirmFiatPayment(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_CONFIRMATION) revert InvalidOrderStatus();

        if (order.fromCrypto) {
            if (msg.sender != order.creator) revert InvalidSender();
            IERC20(usdc).safeTransfer(order.filler, order.amount);
        } else {
            if (msg.sender != order.filler) revert InvalidSender();
            IERC20(usdc).safeTransfer(order.creator, order.amount);
        }

        order.status = OrderStatus.COMPLETED;
        emit FiatPaymentConfirmed(orderId, msg.sender);
    }

    function disputeFiatPayment(
        uint256 orderId,
        string calldata evidenceIpfs
    ) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        if (bytes(evidenceIpfs).length == 0) revert InvalidEvidence();

        Order storage order = orders[orderId];
        if (order.status != OrderStatus.AWAITING_CONFIRMATION) revert InvalidOrderStatus();

        if (!order.fromCrypto) {
            if (msg.sender != order.creator) revert InvalidSender();
            order.claimer = order.creator;
            order.defender = order.filler;
        } else {
            if (msg.sender != order.filler) revert InvalidSender();
            order.claimer = order.filler;
            order.defender = order.creator;
        }

        ISlice.CreateDisputeParams memory params = ISlice.CreateDisputeParams({
            claimer: order.claimer,
            defender: order.defender,
            category: courtCategory,
            ipfsHash: evidenceIpfs,
            jurorsRequired: jurorsRequired,
            paySeconds: PAY_DURATION,
            evidenceSeconds: EVIDENCE_DURATION,
            commitSeconds: COMMIT_DURATION,
            revealSeconds: REVEAL_DURATION
        });

        uint256 disputeId = slice.createDispute(params);

        order.status = OrderStatus.DISPUTED;
        order.sliceDisputeId = disputeId;

        orderToDisputeId[orderId] = disputeId;
        disputeToOrderId[disputeId] = orderId;

        emit FiatPaymentDisputed(orderId, msg.sender);
        emit SliceDisputeCreated(orderId, disputeId, order.claimer, order.defender, evidenceIpfs);
    }

    function submitEvidence(
        uint256 orderId,
        string calldata evidenceIpfs
    ) external whenNotPaused onlyExistingOrder(orderId) {
        if (bytes(evidenceIpfs).length == 0) revert InvalidEvidence();

        Order storage order = orders[orderId];
        if (order.status != OrderStatus.DISPUTED) revert InvalidOrderStatus();
        if (msg.sender != order.creator && msg.sender != order.filler) revert NotParty();
        if (order.sliceDisputeId == 0) revert DisputeNotInitialized();

        slice.submitEvidence(order.sliceDisputeId, evidenceIpfs);
        emit EvidenceSubmittedToSlice(orderId, order.sliceDisputeId, msg.sender, evidenceIpfs);
    }

    function payArbitrationFee(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.DISPUTED) revert InvalidOrderStatus();
        if (order.sliceDisputeId == 0) revert DisputeNotInitialized();

        uint256 cost = slice.getDisputeCost(order.sliceDisputeId);

        if (msg.sender == order.creator) {
            if (order.creatorFeePaid) revert FeeAlreadyPaid();
            order.creatorFeePaid = true;
        } else if (msg.sender == order.filler) {
            if (order.fillerFeePaid) revert FeeAlreadyPaid();
            order.fillerFeePaid = true;
        } else {
            revert NotParty();
        }

        if (order.firstFeePaymentTime == 0) {
            order.firstFeePaymentTime = block.timestamp;
        }

        arbitrationToken.safeTransferFrom(msg.sender, address(this), cost);
        order.feesCollected += cost;

        emit ArbitrationFeePaid(orderId, msg.sender, cost);

        if (order.creatorFeePaid && order.fillerFeePaid) {
            _activateSliceDispute(orderId);
        }
    }

    function timeoutOpponent(uint256 orderId) external nonReentrant whenNotPaused onlyExistingOrder(orderId) {
        Order storage order = orders[orderId];
        if (order.status != OrderStatus.DISPUTED) revert InvalidOrderStatus();
        if (order.firstFeePaymentTime == 0) revert InvalidFeeTimeoutState();
        if (block.timestamp <= order.firstFeePaymentTime + FEE_TIMEOUT) revert FeeTimeoutNotReached();
        if (order.creatorFeePaid == order.fillerFeePaid) revert InvalidFeeTimeoutState();

        address winner = order.creatorFeePaid ? order.creator : order.filler;

        order.status = (winner == order.claimer) ? OrderStatus.COMPLETED : OrderStatus.REFUNDED;

        if (order.feesCollected > 0) {
            arbitrationToken.safeTransfer(winner, order.feesCollected);
            order.feesCollected = 0;
        }

        IERC20(usdc).safeTransfer(winner, order.amount);
        emit FeeTimeoutClaimed(orderId, winner);

        if (winner == order.claimer) {
            emit FiatPaymentConfirmed(orderId, msg.sender);
        } else {
            emit CryptoPaymentRefunded(orderId, msg.sender);
        }
    }

    function getArbitrationCost(uint256 orderId) external view onlyExistingOrder(orderId) returns (uint256) {
        uint256 disputeId = orders[orderId].sliceDisputeId;
        if (disputeId == 0) revert DisputeNotInitialized();
        return slice.getDisputeCost(disputeId);
    }

    function getFeeTimeoutStatus(
        uint256 orderId
    ) external view onlyExistingOrder(orderId) returns (bool canTimeout, uint256 timeRemaining, address potentialWinner) {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.DISPUTED || order.firstFeePaymentTime == 0) {
            return (false, 0, address(0));
        }

        if (order.creatorFeePaid == order.fillerFeePaid) {
            return (false, 0, address(0));
        }

        uint256 timeoutDeadline = order.firstFeePaymentTime + FEE_TIMEOUT;
        potentialWinner = order.creatorFeePaid ? order.creator : order.filler;

        if (block.timestamp > timeoutDeadline) {
            return (true, 0, potentialWinner);
        }

        return (false, timeoutDeadline - block.timestamp, potentialWinner);
    }

    function rule(uint256 disputeId, uint256 ruling) external override nonReentrant {
        if (msg.sender != address(slice)) revert OnlySlice();

        uint256 orderId = disputeToOrderId[disputeId];
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.DISPUTED) revert InvalidOrderStatus();
        if (order.sliceDisputeId != disputeId) revert DisputeNotInitialized();

        address winner = ruling == 1 ? order.claimer : order.defender;
        order.status = (winner == order.claimer) ? OrderStatus.COMPLETED : OrderStatus.REFUNDED;

        IERC20(usdc).safeTransfer(winner, order.amount);

        emit SliceRulingReceived(orderId, disputeId, ruling, winner);
        if (winner == order.claimer) {
            emit FiatPaymentConfirmed(orderId, msg.sender);
        } else {
            emit CryptoPaymentRefunded(orderId, msg.sender);
        }
    }

    function _activateSliceDispute(uint256 orderId) internal {
        Order storage order = orders[orderId];
        uint256 totalFees = order.feesCollected;

        arbitrationToken.forceApprove(address(slice), totalFees);
        slice.payDispute(order.sliceDisputeId);

        order.feesCollected = 0;
        emit SliceDisputeActivated(orderId, order.sliceDisputeId);
    }
}
````

## File: slice_sc/src/core/Slice.sol
````solidity
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
````

## File: slice_sc/src/core/SliceEscrowV1.5.sol
````solidity
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

    function createDispute(
        CreateDisputeParams calldata _params
    ) external returns (uint256);

    function payDispute(uint256 _id) external;

    function courtConfigs(
        string memory _category
    ) external view returns (CourtConfig memory);

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
        address token; // The currency of the PRINCIPAL payment (e.g. USDC)
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
    event TransactionCreated(
        uint256 indexed txId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
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
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_seller != msg.sender, "Cannot pay self");

        ISlice.CourtConfig memory config = slice.courtConfigs(_category);
        require(config.active, "Court is not active");
        require(
            _jurors > 0 && _jurors <= slice.MAX_JURORS(),
            "Invalid number of jurors"
        );

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
    function raiseDispute(
        uint256 _txId,
        string calldata _evidenceIpfs
    ) external nonReentrant {
        Transaction storage txn = transactions[_txId];
        require(txn.status == Status.Active, "Not active");
        require(
            msg.sender == txn.buyer || msg.sender == txn.seller,
            "Not party"
        );

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
    function payArbitrationFee(uint256 _txId) external nonReentrant {
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
        require(
            block.timestamp > txn.firstFeePaymentTime + FEE_TIMEOUT,
            "Timeout not reached"
        );

        // Exactly one party must have paid (XOR condition)
        require(
            txn.buyerFeePaid != txn.sellerFeePaid,
            "Both paid or neither paid"
        );

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
    )
        external
        view
        returns (
            bool canTimeout,
            uint256 timeRemaining,
            address potentialWinner
        )
    {
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

    function rule(
        uint256 _disputeId,
        uint256 _ruling
    ) external override nonReentrant {
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
````

## File: slice_sc/src/core/SliceV1.5.sol
````solidity
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

// TODO:
// - Change from a Pull Model (drawDispute: Juror selects active dispute)
// to a Push Model (drawJurors: Dispute selects passive jurors)
// - Implement chainlink VRF

/**
 * @title Slice Protocol V1.5 (The Arbitrator)
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
contract SliceV1_5 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================
    // DATA STRUCTURES
    // ============================================

    enum DisputeStatus {
        Created, // Waiting for payment
        Evidence, // Paid. Evidence can be uploaded. NO VOTING.
        Commit, // Evidence closed. Jurors commit hashes.
        Reveal, // Commits closed. Jurors reveal votes.
        Finished // Ruling executed.
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
    address public treasury;

    // Court Configuration & Queues
    mapping(string => CourtConfig) public courtConfigs;
    mapping(string => uint256[]) public courtQueues;
    mapping(uint256 => uint256) public idToQueueIndex;

    // Core Data
    mapping(uint256 => Dispute) internal disputeStore;
    mapping(uint256 => address[]) public disputeJurors;
    mapping(uint256 => mapping(address => bool)) internal isJurorInDispute;

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
    event EvidenceSubmitted(uint256 indexed id, address indexed party, string ipfsHash);
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
        // Validate addresses
        require(_params.claimer != address(0), "Claimer cannot be zero address");
        require(_params.defender != address(0), "Defender cannot be zero address");
        require(msg.sender != _params.defender, "Self-dispute not allowed");
        require(_params.claimer != _params.defender, "Claimer cannot be Defender");
        
        CourtConfig memory cc = courtConfigs[_params.category];
        require(cc.active, "Court inactive");
        require(_params.jurorsRequired > 0 && _params.jurorsRequired <= MAX_JURORS, "Invalid juror count");

        // Validate Timelines against Court Guardrails
        require(
            _params.commitSeconds >= cc.minVoteDuration && _params.commitSeconds <= cc.maxVoteDuration,
            "Commit duration OOB"
        );
        require(
            _params.revealSeconds >= cc.minVoteDuration && _params.revealSeconds <= cc.maxVoteDuration,
            "Reveal duration OOB"
        );
        require(_params.paySeconds >= 1 hours, "Pay time too short");
        require(_params.evidenceSeconds >= 1 hours, "Evidence time too short");

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
        uint256 amountToPay = cost; // Default to single party cost

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

            amountToPay = cost * 2;
        }

        // Use SafeERC20 to prevent reverts with USDT
        stakingToken.safeTransferFrom(msg.sender, address(this), amountToPay);

        emit FundsDeposited(_id, msg.sender, amountToPay);

        // Advance state when both parties have paid
        if (d.claimerPaid && d.defenderPaid) {
            d.status = DisputeStatus.Evidence;

            // Calculate deadlines relative to NOW (Activation Time)
            // This prevents "Expired on Arrival" disputes where phases have
            // effectively zero time if payment happens late in the pay window
            d.evidenceDeadline = block.timestamp + d.evidenceDuration;
            d.commitDeadline = d.evidenceDeadline + d.commitDuration;
            d.revealDeadline = d.commitDeadline + d.revealDuration;

            _addToCourtQueue(d.category, _id);
            emit StatusChanged(_id, DisputeStatus.Evidence);
        }
    }

    /**
     * @notice Allow parties to submit additional evidence during the evidence phase.
     */
    function submitEvidence(uint256 _id, string calldata _ipfsHash) external {
        Dispute storage d = disputeStore[_id];

        // Check Status
        require(d.status == DisputeStatus.Evidence || d.status == DisputeStatus.Created, "Evidence closed");

        // Check Timestamps (Evidence Phase is a sub-phase of Commit in V1.5 logic)
        if (d.status == DisputeStatus.Evidence) {
            require(block.timestamp <= d.evidenceDeadline, "Deadline passed");
        }

        // Access Control
        require(
            msg.sender == d.claimer || msg.sender == d.defender || msg.sender == d.arbitrated,
            "Only parties can submit"
        );

        // We do not overwrite the original ipfsHash (the "root" case file).
        // Instead, we emit an event that the Indexer/Subgraph will pick up
        // to build the timeline of evidence.
        emit EvidenceSubmitted(_id, msg.sender, _ipfsHash);
    }

    // ============================================
    // 2. MATCHMAKING & JUROR SELECTION
    // ============================================

    function drawDispute(uint256 _amount, string calldata _category) external nonReentrant {
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
        isJurorInDispute[id][msg.sender] = true;
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

        // LAZY TRANSITION: Evidence -> Commit
        // If we are in Evidence phase but time has passed, effectively move to Commit
        if (d.status == DisputeStatus.Evidence && block.timestamp > d.evidenceDeadline) {
            d.status = DisputeStatus.Commit;
            emit StatusChanged(_id, DisputeStatus.Commit);
        }

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

        // Lazy Phase Transitions
        if (d.status == DisputeStatus.Commit && block.timestamp > d.commitDeadline) {
            d.status = DisputeStatus.Reveal;
        }

        bool timePassed = block.timestamp > d.revealDeadline;
        bool allRevealed = (d.commitsCount > 0 && d.commitsCount == d.revealsCount);

        require(d.status == DisputeStatus.Reveal, "Wrong phase");
        require(timePassed || allRevealed, "Cannot execute");

        // Determine Winner (Handle No Jurors)
        uint256 winningChoice;
        address winnerAddr;

        if (disputeJurors[_id].length == 0) {
            // NO JURORS: Default to Defender (Presumption of Innocence)
            winningChoice = 0;
            winnerAddr = d.defender;
        } else {
            // NORMAL: Count votes
            winningChoice = _determineWinner(_id);
            winnerAddr = winningChoice == 1 ? d.claimer : d.defender;
        }

        d.winner = winnerAddr;
        d.status = DisputeStatus.Finished;

        // Remove from Court Queue if incomplete
        // (If it was full, it was already removed in drawDispute)
        if (disputeJurors[_id].length < d.jurorsRequired) {
            uint256 idx = idToQueueIndex[_id];
            uint256[] storage queue = courtQueues[d.category];

            // 1. Ensure queue has elements (length > idx)
            // 2. Ensure the ID at that index is actually THIS dispute
            if (queue.length > idx && queue[idx] == _id) {
                _removeFromCourtQueue(d.category, idx);
            }
        }
        _settleFinances(_id, winningChoice, winnerAddr);

        // Callback (External)
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

        // Calculate Surplus (Unused Wages)
        uint256 actualJurors = disputeJurors[_id].length;
        uint256 budgetPerJuror = d.feePerJuror; // e.g. 5 USDC

        uint256 totalBudgetedFees = budgetPerJuror * d.jurorsRequired;
        uint256 actualFeesNeeded = budgetPerJuror * actualJurors;
        uint256 unusedFees = totalBudgetedFees - actualFeesNeeded;

        // Parties Settlement
        uint256 totalDeposit = (d.feePerJuror * d.jurorsRequired) + d.partyStake;
        uint256 loserStakeBonus = (d.partyStake * (10000 - d.jurorRewardShare)) / 10000;

        balances[_winnerAddr] += totalDeposit + loserStakeBonus + unusedFees;

        // Juror Pot Calculation
        uint256 jurorStakeBonus = d.partyStake - loserStakeBonus;
        uint256 externalPot = actualFeesNeeded + jurorStakeBonus;

        // Distribute to Jurors (with Alpha logic)
        if (actualJurors > 0) {
            _distributeJurorRewards(_id, _winningChoice, externalPot);
        } else {
            // If 0 jurors, the externalPot goes to winner (no one else to pay)
            balances[_winnerAddr] += externalPot;
        }
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
            // External pot to winner; penalties to treasury (not to default winner)
            balances[d.winner] += _externalPot;

            // Penalties collected from incoherent jurors go to governance treasury
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
        return isJurorInDispute[_id][_user];
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

    function getJurorDisputes(address _user) external view returns (uint256[] memory) {
        return jurorDisputes[_user];
    }

    function getUserDisputes(address _user) external view returns (uint256[] memory) {
        return userDisputes[_user];
    }

    function disputeCountView() external view returns (uint256) {
        return disputeCount;
    }
}
````

## File: slice_sc/src/interfaces/IArbitrable.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IArbitrable {
    function rule(uint256 _disputeId, uint256 _ruling) external;
}
````

## File: slice_sc/src/interfaces/ISlice.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISlice {
    // --- Enums & Structs ---
    enum DisputeStatus {
        Created,
        Evidence,
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
    function submitEvidence(uint256 _id, string calldata _ipfsHash) external;
    function drawDispute(uint256 _amount, string calldata _category) external;
    function commitVote(uint256 _id, bytes32 _commitment) external;
    function revealVote(uint256 _id, uint256 _vote, uint256 _salt) external;
    function executeRuling(uint256 _id) external;
    function withdraw(address _token) external;
}
````

## File: slice_sc/src/mocks/MockUSDC.sol
````solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
````

## File: slice_sc/Makefile
````
.PHONY: build test deploy-slice deploy-slice-verify seed-slice

RPC_URL ?= http://127.0.0.1:8545

build:
	forge build

test:
	forge test

deploy-slice:
	forge script script/DeploySlice.s.sol:DeploySliceScript --rpc-url $(RPC_URL) --broadcast

deploy-slice-verify:
	forge script script/DeploySlice.s.sol:DeploySliceScript --rpc-url $(RPC_URL) --broadcast --verify

seed-slice:
	forge script script/SeedSlice.s.sol:SeedSliceScript --rpc-url $(RPC_URL) --broadcast
````

## File: slice_sc/README.md
````markdown
## Slice Smart Contracts (Foundry)

This directory contains the Slice protocol Solidity contracts and integration examples, built with Foundry.

### Core Contracts

- `src/core/SliceV1.5.sol`: Slice arbitrator contract (court config, dispute lifecycle, juror commit/reveal, settlement).
- `src/core/SliceEscrowV1.5.sol`: escrow-style arbitrable reference.
- `src/core/P2PTradeEscrow.sol`: P2P integration example using Slice as the only dispute resolver.

### Interfaces

- `src/interfaces/ISlice.sol`: Slice integration interface.
- `src/interfaces/IArbitrable.sol`: callback interface used by Slice (`rule(disputeId, ruling)`).

### Build and Test

```shell
forge build
forge test
```

### Integration Example (P2P)

`P2PTradeEscrow` demonstrates a complete Arbitrable integration pattern:

- Creates disputes in Slice with `createDispute(CreateDisputeParams)`.
- Supports evidence submission through a contract-level wrapper.
- Collects arbitration fees in `slice.stakingToken()` and activates disputes via `payDispute`.
- Handles fee timeout anti-deadlock if one side refuses to fund.
- Finalizes principal settlement in `rule(disputeId, ruling)` callback.

Ruling semantics:

- `ruling == 1`: claimer wins.
- `ruling == 0`: defender wins.

See integration tests in `test/integration/P2PTradeEscrow.integration.t.sol`.

### Scripts

Deploy and seed scripts are under `script/`:

- `script/DeploySlice.s.sol`
- `script/SeedSlice.s.sol`

Example usage:

```shell
export DEPLOYER_PRIVATE_KEY=<deployer_private_key>
forge script script/DeploySlice.s.sol:DeploySliceScript --rpc-url <your_rpc_url> --broadcast
```

```shell
export DEPLOYER_PRIVATE_KEY=<deployer_private_key>
export DEFENDER_PRIVATE_KEY=<defender_private_key>
export SLICE_ADDRESS=<deployed_slice_address>
forge script script/SeedSlice.s.sol:SeedSliceScript --rpc-url <your_rpc_url> --broadcast
```
````

## File: src/app/.well-known/farcaster.json/route.ts
````typescript
import { withValidManifest } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../../../../minikit.config";

export async function GET() {
  return Response.json(withValidManifest(minikitConfig));
}
````

## File: src/app/api/auth/route.ts
````typescript
import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

export async function GET(request: NextRequest) {
  // Because we're fetching this endpoint via `sdk.quickAuth.fetch`,
  // if we're in a mini app, the request will include the necessary `Authorization` header.
  const authorization = request.headers.get("Authorization");

  // Here we ensure that we have a valid token.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    // Now we verify the token. `domain` must match the domain of the request.
    // In our case, we're using the `getUrlHost` function to get the domain of the request
    // based on the Vercel environment. This will vary depending on your hosting provider.
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1] as string,
      domain: getUrlHost(request),
    });

    // If the token was valid, `payload.sub` will be the user's Farcaster ID.
    // This is guaranteed to be the user that signed the message in the mini app.
    // You can now use this to do anything you want, e.g. fetch the user's data from your database
    // or fetch the user's info from a service like Neynar.
    const userFid = payload.sub;

    // By default, we'll return the user's FID. Update this to meet your needs.
    return NextResponse.json({ userFid });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 });
    }

    throw e;
  }
}

function getUrlHost(request: NextRequest) {
  // First try to get the origin from the Origin header
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  // Final fallback to environment variables
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}
````

## File: src/app/juror/page.tsx
````typescript
import { redirect } from "next/navigation";

export default function JurorPage() {
  redirect("/juror/tasks");
}
````

## File: src/config/adapters/beexo.tsx
````typescript
"use client";

import { createConfig, http, createConnector, CreateConnectorFn } from "wagmi";
import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { getAddress } from "viem";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { ReactNode } from "react";

// 1. Custom Connector Logic
const CHAIN_ID_HEX = "0x2105"; // Base Mainnet
const RPC_URL = "https://mainnet.base.org";

function beexoConnector(): CreateConnectorFn {
  return createConnector((config) => ({
    id: "beexo",
    name: "Beexo",
    type: "beexo",

    // 1. Connect Logic
    async connect(_parameters) {
      const { XOConnectProvider } = await import("xo-connect");

      // Instantiate the provider we tested earlier
      const provider = new XOConnectProvider({
        rpcs: { [CHAIN_ID_HEX]: RPC_URL },
        defaultChainId: CHAIN_ID_HEX,
      });

      // Trigger the XOConnect handshake
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainId = (await provider.request({
        method: "eth_chainId",
      })) as string;

      // Return standard Wagmi data
      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: parseInt(chainId, 16),
      } as never;
    },

    // 2. Disconnect Logic
    async disconnect() {
      // XOConnect doesn't have a strict disconnect, but Wagmi needs this method
    },

    // 3. Get Accounts
    async getAccounts() {
      const { XOConnectProvider } = await import("xo-connect");
      const provider = new XOConnectProvider({
        rpcs: { [CHAIN_ID_HEX]: RPC_URL },
        defaultChainId: CHAIN_ID_HEX,
      });
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      return accounts.map((x) => getAddress(x));
    },

    // 4. Get Chain ID
    async getChainId() {
      return parseInt(CHAIN_ID_HEX, 16);
    },

    // 5. Provider Passthrough (Crucial!)
    // This tells Wagmi: "Use THIS provider for all contract calls"
    async getProvider() {
      const { XOConnectProvider } = await import("xo-connect");
      return new XOConnectProvider({
        rpcs: { [CHAIN_ID_HEX]: RPC_URL },
        defaultChainId: CHAIN_ID_HEX,
      });
    },

    // 6. Monitor for changes (Optional but good)
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return !!accounts.length;
      } catch {
        return false;
      }
    },

    onAccountsChanged(accounts) {
      config.emitter.emit("change", {
        accounts: accounts.map((x) => getAddress(x)),
      });
    },
    onChainChanged(chain) {
      config.emitter.emit("change", { chainId: parseInt(chain, 16) });
    },
    onDisconnect() {
      config.emitter.emit("disconnect");
    },
  }));
}

// 2. Export Config
export const beexoConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  connectors: [beexoConnector()],
  ssr: true,
});

// 3. Export Provider Tree
export function BeexoProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={beexoConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

// 4. Export Auth Adapter
export function BeexoAuthAdapter({ children }: { children: ReactNode }) {
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: isConnected,
        connect: async () => {
          // In Beexo context, we typically grab the first injected connector
          const connector = connectors[0];
          if (connector) {
            await connectAsync({ connector });
          }
        },
        disconnect: async () => disconnectAsync(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
````

## File: src/config/adapters/coinbase.tsx
````typescript
"use client";

import { cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { activeChains, transports } from "@/config/chains";
import { WagmiProvider, useConnect, useDisconnect, useAccount } from "wagmi";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { ReactNode } from "react";

// --- Export Config ---
export const coinbaseConfig = createConfig({
  chains: activeChains,
  connectors: [coinbaseWallet({ appName: "Slice", preference: "all" })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: transports,
});

// --- Export Provider Tree ---
export function CoinbaseProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={coinbaseConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

// --- Export Auth Adapter ---
export function CoinbaseAuthAdapter({ children }: { children: ReactNode }) {
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: isConnected,
        connect: async () => {
          const connector =
            connectors.find((x) => x.id === "coinbaseWalletSDK") ||
            connectors[0];
          await connectAsync({ connector });
        },
        disconnect: async () => disconnectAsync(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
````

## File: src/config/app.ts
````typescript
// === Privy
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!;
export const PRIVY_JWKS_ENDPOINT = process.env.NEXT_PUBLIC_PRIVY_JWKS_ENDPOINT!;
export const PRIVY_SECRET = process.env.PRIVY_SECRET!;

// === Pinata
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
export const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET!;
export const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!;
export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
export const PINATA_GROUP_ID = process.env.NEXT_PUBLIC_PINATA_GROUP_ID!;

// === Constants
export enum DISPUTE_STATUS {
    CREATED = 0,
    COMMIT = 1,
    REVEAL = 2,
    RESOLVED = 3
}

// === Contacts
export interface Contact {
  name: string;
  address: string;
  avatar?: string; // Optional visual helper
}

// Available avatar images for contact selection
export const AVAILABLE_AVATARS = [
  "/images/profiles-mockup/profile-1.jpg",
  "/images/profiles-mockup/profile-2.jpg",
  "/images/profiles-mockup/profile-3.jpg",
  "/images/profiles-mockup/profile-4.jpg",
  "/images/profiles-mockup/profile-5.jpg",
  "/images/profiles-mockup/profile-6.jpg",
  "/images/profiles-mockup/profile-7.jpg",
  "/images/profiles-mockup/profile-8.jpg",
  "/images/profiles-mockup/profile-9.jpg",
  "/images/profiles-mockup/profile-10.jpg",
  "/images/profiles-mockup/profile-11.jpg",
  "/images/profiles-mockup/profile-12.jpg",
];

// You can expand this later to load from LocalStorage or an API
export const PRELOADED_CONTACTS: Contact[] = [
  {
    name: "John Claimer",
    address: "0xa2a3523faed7d26fe8cc791c7077a99c96ef2edd",
    avatar: "/images/profiles-mockup/profile-1.jpg",
  },
  {
    name: "Jane Defender",
    address: "0xfe26c7555707e7353958447cf72c628552c0abb2",
    avatar: "/images/profiles-mockup/profile-2.jpg",
  },
  {
    name: "Bob Claimer",
    address: "0x3AE66a6DB20fCC27F3DB3DE5Fe74C108A52d6F29",
    avatar: "/images/profiles-mockup/profile-3.jpg",
  },
  {
    name: "Alice Defender",
    address: "0x58609c13942F56e17d36bcB926C413EBbD10e477",
    avatar: "/images/profiles-mockup/profile-4.jpg",
  },
];
````

## File: src/config/chains.ts
````typescript
import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

// 1. Determine Strategy
const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

// 2. Active Configuration (Contracts & Logic)
export const appConfig = {
  chain: isProd ? base : baseSepolia,
  contracts: {
    slice: isProd
      ? process.env.NEXT_PUBLIC_BASE_SLICE_CONTRACT!
      : process.env.NEXT_PUBLIC_BASE_SEPOLIA_SLICE_CONTRACT!,
  },
} as const;

// 3. Wagmi Chains
export const activeChains = isProd
  ? ([base, baseSepolia] as const)
  : ([baseSepolia, base] as const);

export const defaultChain = appConfig.chain;

// 4. Transport Strategy (NEW)
// Define connection methods explicitly here. This guarantees type safety
// because we are using the chain IDs directly as keys.
export const transports = {
  [base.id]: http(),
  [baseSepolia.id]: http(),
} as const;
````

## File: src/config/contracts.ts
````typescript
import { appConfig } from "./chains";
import { sliceAbi } from "@/contracts/slice-abi";

export const SLICE_ABI = sliceAbi;

export const getContractsForChain = (chainId: number) => {
  // Safety check: Warn if we are trying to use contracts on the wrong chain
  if (chainId !== appConfig.chain.id) {
    console.warn(
      `Chain ID mismatch! Current env is ${appConfig.chain.name} (${appConfig.chain.id}), but requested ${chainId}`,
    );
  }

  // Return the single source of truth for the current environment
  return {
    sliceContract: appConfig.contracts.slice as `0x${string}`,
  };
};
````

## File: src/contexts/AuthStrategyContext.tsx
````typescript
"use client";

import { createContext, useContext } from "react";

interface AuthStrategy {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthStrategyContext = createContext<AuthStrategy | null>(null);

export const useAuthStrategy = () => {
  const context = useContext(AuthStrategyContext);
  if (!context)
    throw new Error("useAuthStrategy must be used within an AuthAdapter");
  return context;
};

export const AuthStrategyProvider = AuthStrategyContext.Provider;
````

## File: src/contexts/TimerContext.tsx
````typescript
"use client";
import React, { createContext, use, useState, useEffect, useRef } from "react";

interface TimerContextType {
  timeInSeconds: number;
  isRunning: boolean;
  startTimer: (initialSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = use(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timeInSeconds, setTimeInSeconds] = useState(10 * 60); // 10 minutos por defecto
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Inicializar el timer solo una vez
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      startTimeRef.current = Date.now();
    }

    if (isRunning && timeInSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimeInSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeInSeconds]);

  const startTimer = (initialSeconds: number) => {
    setTimeInSeconds(initialSeconds);
    setIsRunning(true);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (startTimeRef.current) {
      pausedTimeRef.current = timeInSeconds;
    }
  };

  const resumeTimer = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeInSeconds(10 * 60);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  };

  const value = {
    timeInSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };

  return <TimerContext value={value}>{children}</TimerContext>;
};
````

## File: src/hooks/actions/useCreateDispute.ts
````typescript
import { useState } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { uploadJSONToIPFS } from "@/util/ipfs";
import { toast } from "sonner";

export function useCreateDispute() {
  const { address } = useAccount();
  const { sliceContract } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isCreating, setIsCreating] = useState(false);

  const createDispute = async (
    defenderAddress: string,
    claimerAddress: string | undefined, // NEW: Claimer input
    category: string,
    disputeData: {
      title: string;
      description: string;
      evidence?: string[];
    },
    jurorsRequired: number = 3,
    deadlineHours: number = 96,
  ): Promise<boolean> => {
    try {
      setIsCreating(true);

      // Default to connected user if no claimer specified
      const finalClaimer = claimerAddress || address;

      if (!finalClaimer) {
        toast.error("Claimer address required");
        return false;
      }

      // 1. Upload Metadata (Off-chain)
      toast.info("Uploading evidence to IPFS...");
      const ipfsHash = await uploadJSONToIPFS({
        ...disputeData,
        category,
      });

      if (!ipfsHash) throw new Error("Failed to upload to IPFS");

      console.log("IPFS Hash created:", ipfsHash);
      toast.info("Creating dispute on-chain...");

      // 2. Calculate Phase Durations based on Deadline
      // Total duration in seconds (from hours input)
      const totalSeconds = deadlineHours * 60 * 60;

      // Strategy: Split total time into phases
      // Payment: 10% (Minimum 1 hour to allow reaction)
      // Evidence: 40% (Longest period for gathering info)
      // Commit: 25%
      // Reveal: 25%
      const payTime = Math.max(3600, Math.floor(totalSeconds * 0.1));
      const remainingTime = totalSeconds - payTime;

      const evidenceTime = Math.floor(remainingTime * 0.45); // ~40% of total
      const commitTime = Math.floor(remainingTime * 0.275); // ~25% of total
      const revealTime = Math.floor(remainingTime * 0.275); // ~25% of total

      const paySeconds = BigInt(payTime);
      const evidenceSeconds = BigInt(evidenceTime);
      const commitSeconds = BigInt(commitTime);
      const revealSeconds = BigInt(revealTime);

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "createDispute",
        args: [
          {
            claimer: finalClaimer as `0x${string}`,
            defender: defenderAddress as `0x${string}`,
            category: category,
            ipfsHash: ipfsHash,
            jurorsRequired: BigInt(jurorsRequired),
            paySeconds: paySeconds,
            evidenceSeconds: evidenceSeconds,
            commitSeconds: commitSeconds,
            revealSeconds: revealSeconds,
          },
        ],
      });

      console.log("Creation TX sent:", hash);
      toast.info("Transaction sent. Waiting for confirmation...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Dispute created successfully!");
      return true;
    } catch (error: any) {
      console.error("Create dispute failed", error);
      const msg =
        error.reason || error.shortMessage || error.message || "Unknown error";
      toast.error(`Create Failed: ${msg}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return { createDispute, isCreating };
}
````

## File: src/hooks/actions/useFaucet.ts
````typescript
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { useStakingToken } from "@/hooks/core/useStakingToken";

const MINT_ABI = [
    {
        inputs: [
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export const useFaucet = () => {
    const { address } = useAccount();
    const {
        address: tokenAddress,
        decimals,
        isLoading: isTokenLoading,
    } = useStakingToken();
    const { writeContractAsync, isPending } = useWriteContract();

    const mint = async () => {
        if (!address || !tokenAddress) return;

        try {
            await writeContractAsync({
                address: tokenAddress,
                abi: MINT_ABI,
                functionName: "mint",
                args: [address, parseUnits("50", decimals)],
            });
            toast.success("Minting 50 USDC...");
        } catch (error) {
            console.error("Mint failed", error);
            toast.error("Failed to mint tokens");
        }
    };

    return {
        mint,
        isPending,
        isReady: !isTokenLoading && !!tokenAddress,
    };
};
````

## File: src/hooks/actions/usePayDispute.ts
````typescript
import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";
import { toast } from "sonner";
import { useStakingToken } from "../core/useStakingToken";

export function usePayDispute() {
  const { address } = useAccount();
  const { address: stakingToken, decimals } = useStakingToken();
  const chainId = useChainId();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "approving" | "paying">("idle");

  const payDispute = async (disputeId: string | number, amountStr: string) => {
    if (!address || !publicClient) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      setLoading(true);

      const { sliceContract } = getContractsForChain(chainId);

      const amountBI = parseUnits(amountStr, decimals);

      // --- STEP 1: APPROVE ---
      setStep("approving");
      toast.info("Approving tokens...");

      // We check allowance first to avoid redundant approval
      const allowance = await publicClient.readContract({
        address: stakingToken,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, sliceContract],
      });

      if (allowance < amountBI) {
        const approveHash = await writeContractAsync({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [sliceContract, amountBI],
        });

        // Wait for approval to be mined
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        toast.success("Approval confirmed.");
      } else {
        console.log("Allowance sufficient, skipping approval.");
      }

      // --- STEP 2: PAY DISPUTE ---
      setStep("paying");
      toast.info("Paying dispute...");

      const payHash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "payDispute",
        args: [BigInt(disputeId)],
      });

      // Wait for payment to be mined
      await publicClient.waitForTransactionReceipt({ hash: payHash });

      toast.success("Payment successful!");
      return true;
    } catch (error: any) {
      console.error("Payment flow failed", error);
      const msg =
        error.reason || error.shortMessage || error.message || "Unknown error";
      toast.error(`Payment failed: ${msg}`);
      return false;
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  return {
    payDispute,
    isPaying: loading,
    step,
  };
}
````

## File: src/hooks/actions/useSendFunds.ts
````typescript
"use client";

import { useState } from "react";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { parseUnits, erc20Abi, isAddress } from "viem";
import { toast } from "sonner";
import { useStakingToken } from "../core/useStakingToken";

export function useSendFunds(onSuccess?: () => void) {
  const { address } = useAccount();
  const { address: stakingToken, decimals } = useStakingToken();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const sendFunds = async (recipient: string, amount: string) => {
    // Basic Validation
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }
    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const value = parseUnits(amount, decimals);

      toast.info("Sending transaction...");

      // Execute
      const hash = await writeContractAsync({
        address: stakingToken,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, value],
      });

      // Wait
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Transfer successful!");
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.reason || err.shortMessage || err.message || "Transaction failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { sendFunds, isLoading };
}
````

## File: src/hooks/core/useContracts.ts
````typescript
import { useChainId } from "wagmi";
import { getContractsForChain } from "@/config/contracts";

export function useContracts() {
  // 1. Get the active chain ID from Wagmi
  // - On Beexo, this will automatically be 8453 (Base)
  // - On Web, this will be 84532 (Base Sepolia)
  const chainId = useChainId();

  // 2. Resolve the correct address dynamically
  const { sliceContract } = getContractsForChain(chainId);

  return {
    sliceContract,
    chainId,
  };
}
````

## File: src/hooks/core/useSliceAccount.ts
````typescript
import { useAccount } from "wagmi";

export const useSliceAccount = () => {
    const { address, isConnected, status } = useAccount();

    return {
        address,
        isConnected,
        status,
    };
};
````

## File: src/hooks/core/useSliceConnect.ts
````typescript
import { useAuthStrategy } from "@/contexts/AuthStrategyContext";

export const useSliceConnect = () => {
  const { connect, disconnect, isAuthenticated } = useAuthStrategy();

  return {
    connect,
    disconnect,
    isAuthenticated,
    label: isAuthenticated ? "Disconnect" : "Connect Wallet",
  };
};
````

## File: src/hooks/core/useStakingToken.ts
````typescript
import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { erc20Abi } from "viem";
import { useContracts } from "./useContracts";

export function useStakingToken() {
  const { sliceContract } = useContracts();

  // Fetch the address from the Slice contract
  const { data: tokenAddress } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "stakingToken",
  });

  // Fetch Metadata (Decimals, Symbol) from the Token contract
  const { data: tokenMetadata, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
    query: { enabled: !!tokenAddress },
  });

  return {
    address: tokenAddress as `0x${string}`,
    decimals: tokenMetadata?.[0]?.result ?? 6, // Fallback to 6 (USDC decimals)
    symbol: tokenMetadata?.[1]?.result ?? "TOKEN",
    isLoading,
  };
}
````

## File: src/hooks/core/useTokenBalance.ts
````typescript
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { useStakingToken } from "./useStakingToken";

export function useTokenBalance() {
  const { address } = useAccount();
  const { address: stakingToken, decimals } = useStakingToken();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: stakingToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stakingToken,
    },
  });

  return {
    value: balance, // BigInt
    formatted: balance ? formatUnits(balance, decimals) : "0",
    loading: isLoading,
    refetch,
  };
}
````

## File: src/hooks/debug/useConsoleLogs.ts
````typescript
import { useEffect, useRef, useState } from "react";

export const useConsoleLogs = () => {
  const [logs, setLogs] = useState<
    { type: string; message: string; time: string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Keep track of original console methods
  const originalLog = useRef<typeof console.log | null>(null);
  const originalError = useRef<typeof console.error | null>(null);
  const originalWarn = useRef<typeof console.warn | null>(null);

  useEffect(() => {
    // Capture originals once. utilizing the nullish coalescing operator
    // ensures we don't accidentally capture our own wrapper if effect re-runs.
    originalLog.current = originalLog.current ?? console.log;
    originalError.current = originalError.current ?? console.error;
    originalWarn.current = originalWarn.current ?? console.warn;

    const originalLogFn = originalLog.current;
    const originalErrorFn = originalError.current;
    const originalWarnFn = originalWarn.current;

    // 1. Simplified BigInt-safe Formatter
    const formatLog = (args: unknown[]) =>
      args
        .map((arg) =>
          typeof arg === "object" && arg
            ? JSON.stringify(
                arg,
                (_, v) => (typeof v === "bigint" ? v.toString() : v),
                2,
              )
            : String(arg),
        )
        .join(" ");

    const addLog = (type: string, args: unknown[]) => {
      const message = formatLog(args);
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-49), { type, message, time }]);
    };

    // 2. Safe Interceptor Helper
    // This executes the native log immediately, but defers the React state update
    const intercept = (
      type: "log" | "error" | "warn",
      originalFn: Function | null,
      args: any[],
    ) => {
      // Always run the browser's native logger immediately
      if (typeof originalFn === "function") {
        originalFn(...args);
      }

      // Defer the state update to the next tick to prevent
      // "Cannot update component while rendering" errors
      setTimeout(() => {
        addLog(type, args);
      }, 0);
    };

    // Override console methods
    console.log = (...args) => intercept("log", originalLogFn, args);
    console.error = (...args) => intercept("error", originalErrorFn, args);
    console.warn = (...args) => intercept("warn", originalWarnFn, args);

    // Global error handler
    const originalOnError = window.onerror;
    window.onerror = (msg, url, line, col, error) => {
      // Wrap this in setTimeout as well, just in case the error happens during render
      setTimeout(() => {
        addLog("error", [`Uncaught: ${msg} @ ${url}:${line}`]);
      }, 0);

      if (typeof originalOnError === "function") {
        return originalOnError(msg, url, line, col, error);
      }
      return false;
    };

    // Listen for custom open event
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-debug-console", handleOpenEvent);

    return () => {
      // Restore console methods
      if (originalLogFn) console.log = originalLogFn;
      if (originalErrorFn) console.error = originalErrorFn;
      if (originalWarnFn) console.warn = originalWarnFn;

      window.onerror = originalOnError;
      window.removeEventListener("open-debug-console", handleOpenEvent);
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return {
    logs,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    clearLogs,
  };
};
````

## File: src/hooks/disputes/useAllDisputes.ts
````typescript
import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import {
  transformDisputeData,
  batchFetchIPFSMetadata,
  type DisputeUI,
} from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";

export function useAllDisputes() {
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();
  // 1. Get the total number of disputes
  const { data: countData } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputeCount",
  });

  // 2. Calculate the latest 20 IDs (e.g., 50, 49, 48...)
  const calls = useMemo(() => {
    // FIX: Check for undefined explicitly. '0n' is falsy, so !countData triggers incorrectly on 0.
    if (countData === undefined) return [];

    const total = Number(countData);
    if (total === 0) return []; // Explicitly return empty if 0 disputes

    const start = total;
    const end = Math.max(1, total - 20 + 1); // Fetch last 20
    const contracts = [];

    for (let i = start; i >= end; i--) {
      contracts.push({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [BigInt(i)],
      });
    }
    return contracts;
  }, [countData, sliceContract]);

  // 3. Fetch data for those IDs
  const {
    data: results,
    isLoading: isMulticallLoading,
    refetch,
  } = useReadContracts({
    contracts: calls,
    query: { enabled: calls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // 4. Transform Data (IPFS, etc.)
  useEffect(() => {
    async function process() {
      // Immediate exit if we know count is 0
      if (countData !== undefined && Number(countData) === 0) {
        setDisputes([]);
        setIsProcessing(false);
        return;
      }

      if (!results) {
        // Ensure we stop loading if countData is defined (even if 0, though caught above)
        if (!isMulticallLoading && countData !== undefined)
          setIsProcessing(false);
        return;
      }

      setIsProcessing(true);

      // Extract all IPFS hashes from successful results
      const ipfsHashes = results
        .filter((r) => r.status === "success")
        .map((r) => {
          const data = r.result as any;
          return data?.ipfsHash || data?.[6] || "";
        });

      // Batch fetch all IPFS metadata in parallel (eliminates waterfall)
      const ipfsDataMap = await batchFetchIPFSMetadata(ipfsHashes);

      // Transform disputes with pre-fetched metadata
      const processed = await Promise.all(
        results.map(async (result) => {
          if (result.status !== "success") return null;
          const data = result.result as any;
          const ipfsHash = data?.ipfsHash || data?.[6] || "";
          const prefetchedMeta = ipfsHash ? ipfsDataMap.get(ipfsHash) : undefined;
          return await transformDisputeData(
            result.result,
            decimals,
            false,
            prefetchedMeta
          );
        })
      );

      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
      setIsProcessing(false);
    }
    process();
  }, [results, isMulticallLoading, countData, decimals]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
````

## File: src/hooks/disputes/useDisputeList.ts
````typescript
import { useReadContract, useReadContracts } from "wagmi";
import { DISPUTE_STATUS } from "@/config/app";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import {
  transformDisputeData,
  batchFetchIPFSMetadata,
  type DisputeUI,
} from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStakingToken } from "../core/useStakingToken";

// "juror" = disputes where I am a juror
// "mine"  = disputes where I am a juror OR a party (Claimer/Defender)
// "all"   = all disputes (admin/explorer view)
type ListType = "juror" | "mine" | "all";

export type Dispute = DisputeUI;

export function useDisputeList(
  listType: ListType,
  options?: { activeOnly?: boolean },
) {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch Juror Disputes
  const { data: jurorDisputeIds } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: {
      enabled: (listType === "juror" || listType === "mine") && !!address,
    },
  });

  // 2. Fetch User Disputes (Only for "mine")
  const { data: userDisputeIds } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: {
      enabled: listType === "mine" && !!address,
    },
  });

  const { data: totalCount } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputeCount",
    query: { enabled: listType === "all" },
  });

  // 3. Prepare Calls
  const calls = useMemo(() => {
    const contracts = [];
    let idsToFetch: bigint[] = [];

    // REMOVED: Redundant 'if (listType === "juror")' block that was causing duplicates.
    // We only keep the logic for "all" here because it relies on a count/range
    // rather than a specific ID list which is handled below.

    if (listType === "all" && totalCount) {
      const total = Number(totalCount);

      const start = total;
      const end = Math.max(1, total - 20 + 1); // Ensure we stop at 1, and get max 20 items

      for (let i = start; i >= end; i--) {
        contracts.push({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "disputes",
          args: [BigInt(i)],
        });
      }
    }

    // "juror" mode: Strictly juror IDs
    if (listType === "juror" && jurorDisputeIds) {
      idsToFetch = [...(jurorDisputeIds as bigint[])];
    }
    // "mine" mode: Juror + Party IDs
    else if (listType === "mine") {
      const jIds = (jurorDisputeIds as bigint[]) || [];
      const uIds = (userDisputeIds as bigint[]) || [];
      const uniqueIds = new Set([...jIds, ...uIds].map((id) => id.toString()));
      idsToFetch = Array.from(uniqueIds).map((id) => BigInt(id));
    }

    // Sort descending
    idsToFetch.sort((a, b) => Number(b) - Number(a));

    for (const id of idsToFetch) {
      contracts.push({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [id],
      });
    }

    return contracts;
  }, [listType, jurorDisputeIds, userDisputeIds, totalCount, sliceContract]);

  // 4. Fetch Data
  const {
    data: results,
    isLoading: isMulticallLoading,
    refetch,
  } = useReadContracts({
    contracts: calls,
    query: { enabled: calls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // 5. Process & Filter
  useEffect(() => {
    async function process() {
      if (!results || results.length === 0) {
        if (!isMulticallLoading) {
          setDisputes([]);
          setIsProcessing(false);
        }
        return;
      }

      setIsProcessing(true);

      // Extract all IPFS hashes from successful results
      const ipfsHashes = results
        .filter((r) => r.status === "success")
        .map((r) => {
          const data = r.result as any;
          return data?.ipfsHash || data?.[6] || ""; // ipfsHash field or index 6
        });

      // Batch fetch all IPFS metadata in parallel (eliminates waterfall)
      const ipfsDataMap = await batchFetchIPFSMetadata(ipfsHashes);

      // Transform disputes with pre-fetched metadata
      const processed = await Promise.all(
        results.map(async (result) => {
          if (result.status !== "success") return null;
          const data = result.result as any;
          const ipfsHash = data?.ipfsHash || data?.[6] || "";
          const prefetchedMeta = ipfsHash ? ipfsDataMap.get(ipfsHash) : undefined;
          return await transformDisputeData(
            result.result,
            decimals,
            false,
            prefetchedMeta
          );
        })
      );

      let finalDisputes = processed.filter((d): d is DisputeUI => d !== null);

      // --- Filter out Finished AND Unpaid disputes if activeOnly is true ---
      if (options?.activeOnly) {
        finalDisputes = finalDisputes.filter((d) => {
          // Exclude Resolved (3) AND Created/Unpaid (0)
          // We only want Active phases: Commit (1) and Reveal (2)
          return (
            d.status !== DISPUTE_STATUS.RESOLVED &&
            d.status !== DISPUTE_STATUS.CREATED
          );
        });
      }

      setDisputes(finalDisputes);
      setIsProcessing(false);
    }

    process();
  }, [results, isMulticallLoading, options?.activeOnly, decimals]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
````

## File: src/hooks/disputes/useDisputeParties.ts
````typescript
import { useMemo } from "react";
import { shortenAddress } from "@/util/wallet";

export function useDisputeParties(dispute: any) {
  return useMemo(() => {
    // 1. Prefer the "Name" (Alias) if available, otherwise fallback to address
    const claimerRaw = dispute?.claimerName || dispute?.claimer;
    const defenderRaw = dispute?.defenderName || dispute?.defender;

    // 2. Use shortenAddress:
    // - If it's a 0x address, it becomes 0x12...34
    // - If it's a real name (e.g. "John Doe"), it stays "John Doe"
    const claimerLabel = shortenAddress(claimerRaw) || "Claimant";
    const defenderLabel = shortenAddress(defenderRaw) || "Defendant";

    return {
      claimer: {
        name: claimerLabel,
        roleLabel: "Claimant",
        avatarUrl: "/images/profiles-mockup/profile-1.jpg",
        themeColor: "blue",
      },
      defender: {
        name: defenderLabel,
        roleLabel: "Defendant",
        avatarUrl: "/images/profiles-mockup/profile-2.jpg",
        themeColor: "gray",
      },
    };
  }, [dispute]);
}
````

## File: src/hooks/evidence/useEvidence.ts
````typescript
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { shortenAddress } from "@/util/wallet";

export type EvidenceRole = "claimant" | "defendant";

export function useEvidence(disputeId: string, role: EvidenceRole) {
  const { dispute } = useGetDispute(disputeId);
  const isClaimant = role === "claimant";

  // 1. Dynamic Party Info
  // Select the correct name based on the role
  const realName = isClaimant
    ? dispute?.claimerName || dispute?.claimer
    : dispute?.defenderName || dispute?.defender;

  const partyInfo = {
    name: realName || "Loading...",
    // Use the specific profile images requested
    // Fallback to shortenAddress if the name looks like a 0x address
    displayName: realName?.startsWith("0x")
      ? shortenAddress(realName)
      : realName,
    avatar: isClaimant
      ? "/images/profiles-mockup/profile-1.jpg"
      : "/images/profiles-mockup/profile-2.jpg",
    role: isClaimant ? "Claimant" : "Defendant",
  };

  // 2. Statement Logic
  let statement = "No statement provided.";

  if (isClaimant) {
    statement = dispute?.description || "No statement provided.";
  } else {
    // For Defender, try to find the specific description, otherwise fallback
    statement = dispute?.defenderDescription
      ? dispute.defenderDescription
      : "The defendant has not submitted a counter-statement text.";
  }

  // 3. Evidence Routing
  // Switch sources based on role
  const rawCarousel = isClaimant
    ? dispute?.carouselEvidence || []
    : dispute?.defenderCarouselEvidence || []; // Use defender specific array

  const rawAudio = isClaimant
    ? dispute?.audioEvidence
    : dispute?.defenderAudioEvidence; // Use defender specific audio

  // Process Images
  const imageEvidence = rawCarousel.map((url: string, i: number) => ({
    id: `img-${i}`,
    type: "image" as const,
    url,
    description: `Exhibit ${i + 1} (${partyInfo.role})`,
    uploadDate: "Attached to case file",
  }));

  // Process Audio
  const audioEvidence = rawAudio
    ? {
        id: `audio-${role}`,
        title: `${partyInfo.role}'s Statement`,
        duration: "Play Audio",
        url: rawAudio,
      }
    : null;

  // Video placeholder (empty for now unless you add video uploads)
  const videoEvidence: any[] = [];

  // Real Carousel (Added to match previous implementation structure if needed)
  const carouselImages = rawCarousel.map((url: string, i: number) => ({
    id: `slide-${i}`,
    url: url,
    description: `Evidence #${i + 1}`,
  }));

  return {
    dispute,
    partyInfo,
    statement,
    imageEvidence,
    videoEvidence,
    audioEvidence,
    carouselImages,
  };
}
````

## File: src/hooks/forms/useCreateDisputeForm.ts
````typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateDispute } from "@/hooks/actions/useCreateDispute";
import { uploadFileToIPFS } from "@/util/ipfs";
import type { CreateDisputeForm, FileState } from "@/components/create";

export const useCreateDisputeForm = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { createDispute, isCreating } = useCreateDispute();

    const [isUploading, setIsUploading] = useState(false);

    // --- FORM STATE ---
    const [formData, setFormData] = useState<CreateDisputeForm>({
        title: "",
        category: "General",
        jurorsRequired: 3,
        deadlineHours: 96,
        claimerName: "",
        claimerAddress: "",
        defenderName: "",
        defenderAddress: "",
        description: "",
        evidenceLink: "",
        defDescription: "",
    });

    // --- FILE STATE ---
    const [files, setFiles] = useState<FileState>({
        audio: null,
        carousel: [],
        defAudio: null,
        defCarousel: [],
    });

    // --- HANDLERS ---
    const updateField = (
        field: keyof CreateDisputeForm,
        value: string | number,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (formData.jurorsRequired % 2 === 0) {
            toast.error("Please select an odd number of jurors.");
            return;
        }

        try {
            setIsUploading(true);

            // Collect all upload tasks with type identifiers
            type UploadTask = { type: string; file: File; index?: number };
            const uploadTasks: UploadTask[] = [];

            if (files.audio) {
                uploadTasks.push({ type: "audio", file: files.audio });
            }

            files.carousel.forEach((f, i) => {
                uploadTasks.push({ type: "carousel", file: f, index: i });
            });

            if (files.defAudio) {
                uploadTasks.push({ type: "defAudio", file: files.defAudio });
            }

            files.defCarousel.forEach((f, i) => {
                uploadTasks.push({ type: "defCarousel", file: f, index: i });
            });

            // Execute all uploads in parallel (eliminates sequential waterfall)
            if (uploadTasks.length > 0) {
                toast.info(`Uploading ${uploadTasks.length} file${uploadTasks.length > 1 ? "s" : ""}...`);
                
                const uploadResults = await Promise.all(
                    uploadTasks.map(async (task) => ({
                        ...task,
                        hash: await uploadFileToIPFS(task.file),
                    }))
                );

                // Process results by type
                const audioResult = uploadResults.find((r) => r.type === "audio");
                const audioUrl = audioResult?.hash
                    ? `https://gateway.pinata.cloud/ipfs/${audioResult.hash}`
                    : "";

                const carouselUrls = uploadResults
                    .filter((r) => r.type === "carousel" && r.hash)
                    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                    .map((r) => `https://gateway.pinata.cloud/ipfs/${r.hash}`);

                const defAudioResult = uploadResults.find((r) => r.type === "defAudio");
                const defAudioUrl = defAudioResult?.hash
                    ? `https://gateway.pinata.cloud/ipfs/${defAudioResult.hash}`
                    : null;

                const defCarouselUrls = uploadResults
                    .filter((r) => r.type === "defCarousel" && r.hash)
                    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                    .map((r) => `https://gateway.pinata.cloud/ipfs/${r.hash}`);

                // 3. Construct Payload
                const disputePayload = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    evidence: formData.evidenceLink ? [formData.evidenceLink] : [],
                    aliases: {
                        claimer: formData.claimerName || "Anonymous Claimant",
                        defender: formData.defenderName || "Anonymous Defendant",
                    },
                    audioEvidence: audioUrl || null,
                    carouselEvidence: carouselUrls,
                    defenderDescription: formData.defDescription || null,
                    defenderAudioEvidence: defAudioUrl,
                    defenderCarouselEvidence: defCarouselUrls,
                    created_at: new Date().toISOString(),
                };

                const success = await createDispute(
                    formData.defenderAddress,
                    formData.claimerAddress || undefined,
                    formData.category,
                    disputePayload,
                    formData.jurorsRequired,
                    formData.deadlineHours,
                );

                if (success) {
                    await queryClient.invalidateQueries({ queryKey: ["disputeCount"] });
                    router.push("/profile");
                }
            } else {
                // No files to upload, proceed directly
                const disputePayload = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    evidence: formData.evidenceLink ? [formData.evidenceLink] : [],
                    aliases: {
                        claimer: formData.claimerName || "Anonymous Claimant",
                        defender: formData.defenderName || "Anonymous Defendant",
                    },
                    audioEvidence: null,
                    carouselEvidence: [],
                    defenderDescription: formData.defDescription || null,
                    defenderAudioEvidence: null,
                    defenderCarouselEvidence: [],
                    created_at: new Date().toISOString(),
                };

                const success = await createDispute(
                    formData.defenderAddress,
                    formData.claimerAddress || undefined,
                    formData.category,
                    disputePayload,
                    formData.jurorsRequired,
                    formData.deadlineHours,
                );

                if (success) {
                    await queryClient.invalidateQueries({ queryKey: ["disputeCount"] });
                    router.push("/profile");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload evidence.");
        } finally {
            setIsUploading(false);
        }
    };

    const isProcessing = isCreating || isUploading;

    return {
        formData,
        files,
        setFiles,
        updateField,
        submit,
        isProcessing,
    };
};
````

## File: src/hooks/forms/useStepBasics.ts
````typescript
import { useState } from "react";

import {CreateDisputeForm} from "@/components/create";

type TimeUnit = "days" | "hours";

interface UseStepBasicsProps {
    data: CreateDisputeForm;
    updateField: (field: keyof CreateDisputeForm, value: string | number) => void;
}

export const useStepBasics = ({ data, updateField }: UseStepBasicsProps) => {
    const [timeUnit, setTimeUnit] = useState<TimeUnit>("days");
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    // Convert hours to display value based on unit
    const getDisplayValue = () => {
        if (timeUnit === "days") {
            return Math.floor(data.deadlineHours / 24);
        }
        return data.deadlineHours;
    };

    // Update hours when slider changes
    const handleTimeChange = (value: number) => {
        if (timeUnit === "days") {
            updateField("deadlineHours", value * 24);
        } else {
            updateField("deadlineHours", value);
        }
    };

    // When switching units, adjust the value to stay within bounds
    const handleUnitChange = (newUnit: TimeUnit) => {
        setTimeUnit(newUnit);
        if (newUnit === "days") {
            // Round to nearest day, ensure at least 1 day
            const days = Math.max(1, Math.round(data.deadlineHours / 24));
            updateField("deadlineHours", Math.min(days * 24, 168));
        }
    };

    const sliderMin = timeUnit === "days" ? 1 : 1;
    const sliderMax = timeUnit === "days" ? 7 : 24;
    const sliderStep = timeUnit === "days" ? 1 : 1;

    // Calculate phase durations for display (in hours)
    const totalHours = data.deadlineHours;
    const payHours = Math.max(1, Math.round(totalHours * 0.1));
    const remainingHours = totalHours - payHours;
    const evidenceHours = Math.round(remainingHours * 0.45);
    const votingHours = Math.round(remainingHours * 0.55);

    // Format hours to days/hours string
    const formatDuration = (hours: number) => {
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHrs = hours % 24;
            if (remainingHrs === 0) {
                return `${days} day${days > 1 ? "s" : ""}`;
            }
            return `${days}d ${remainingHrs}h`;
        }
        return `${hours} hour${hours > 1 ? "s" : ""}`;
    };

    return {
        timeUnit,
        isTimelineOpen,
        setIsTimelineOpen,
        getDisplayValue,
        handleTimeChange,
        handleUnitChange,
        sliderMin,
        sliderMax,
        sliderStep,
        payHours,
        evidenceHours,
        votingHours,
        formatDuration,
    };
};
````

## File: src/hooks/ui/useClickOutside.ts
````typescript
import { RefObject, useEffect } from 'react';

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!ref || !ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler]);
}

export default useClickOutside;
````

## File: src/hooks/ui/usePageSwipe.ts
````typescript
import { useDrag } from "@use-gesture/react";

interface SwipeConfig {
  onSwipeLeft?: () => void; // Next
  onSwipeRight?: () => void; // Back
}

export function usePageSwipe({ onSwipeLeft, onSwipeRight }: SwipeConfig) {
  const bind = useDrag(({ swipe: [swipeX] }) => {
    // swipeX is -1 (left), 1 (right), or 0 (none)
    if (swipeX === -1 && onSwipeLeft) {
      onSwipeLeft();
    } else if (swipeX === 1 && onSwipeRight) {
      onSwipeRight();
    }
  });

  return bind;
}
````

## File: src/hooks/user/useAddressBook.ts
````typescript
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PRELOADED_CONTACTS, Contact } from "@/config/app";

const STORAGE_KEY = "slice_address_book_v1";

export function useAddressBook() {
  // Initialize with System contacts
  const [contacts, setContacts] = useState<Contact[]>(PRELOADED_CONTACTS);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge: System Contacts + User Contacts (Deduplicated by address)
        const combined = [...PRELOADED_CONTACTS, ...parsed].filter(
          (contact, index, self) =>
            index ===
            self.findIndex(
              (c) => c.address.toLowerCase() === contact.address.toLowerCase(),
            ),
        );
        setContacts(combined);
      }
    } catch (e) {
      console.error("Failed to load address book", e);
    }
  }, []);

  const addContact = (name: string, address: string, avatar?: string) => {
    if (!name || !address) return;

    const newContact: Contact = { name, address, avatar };

    setContacts((prev) => {
      // Avoid duplicates
      const others = prev.filter(
        (c) => c.address.toLowerCase() !== address.toLowerCase(),
      );
      const updated = [...others, newContact]; // Add new to end

      // Persist ONLY user contacts (filter out system ones to save space)
      const userContacts = updated.filter(
        (c) => !PRELOADED_CONTACTS.some((pc) => pc.address === c.address),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userContacts));

      return updated;
    });

    toast.success(`Saved "${name}" to contacts`);
  };

  const removeContact = (address: string) => {
    // Prevent deleting system contacts
    if (
      PRELOADED_CONTACTS.some(
        (c) => c.address.toLowerCase() === address.toLowerCase(),
      )
    ) {
      toast.error("Cannot delete system contact.");
      return;
    }

    setContacts((prev) => {
      const updated = prev.filter(
        (c) => c.address.toLowerCase() !== address.toLowerCase(),
      );

      const userContacts = updated.filter(
        (c) => !PRELOADED_CONTACTS.some((pc) => pc.address === c.address),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userContacts));

      return updated;
    });

    toast.success("Contact removed");
  };

  return { contacts, addContact, removeContact };
}
````

## File: src/hooks/user/useUserProfile.ts
````typescript
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

// Default set of avatars available in the public folder
export const PRESET_AVATARS = [
  "/images/profiles-mockup/profile-1.jpg",
  "/images/profiles-mockup/profile-2.jpg",
  "/images/profiles-mockup/profile-3.jpg",
  "/images/profiles-mockup/profile-4.jpg",
  "/images/profiles-mockup/profile-5.jpg",
  "/images/profiles-mockup/profile-6.jpg",
  "/images/profiles-mockup/profile-7.jpg",
  "/images/profiles-mockup/profile-8.jpg",
  "/images/profiles-mockup/profile-9.jpg",
  "/images/profiles-mockup/profile-10.jpg",
  "/images/profiles-mockup/profile-11.jpg",
  "/images/profiles-mockup/profile-12.jpg",
];

const STORAGE_KEY_PREFIX = "slice_profile_v1_";
const DEFAULT_NAME = "Anonymous Juror";

function getStoredProfile(address: string | undefined): {
  avatar: string;
  name: string;
} {
  if (!address) return { avatar: PRESET_AVATARS[0], name: DEFAULT_NAME };

  try {
    const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        avatar: parsed.avatar || PRESET_AVATARS[0],
        name: parsed.name || DEFAULT_NAME,
      };
    }
  } catch (_e) {
    console.error("Failed to load user profile");
  }

  return { avatar: PRESET_AVATARS[0], name: DEFAULT_NAME };
}

export function useUserProfile() {
  // Use wagmi's useAccount to get the current user's address for isolation
  const { address } = useAccount();

  // Initialize profile with current address
  const [avatar, setAvatar] = useState<string>(
    () => getStoredProfile(address).avatar,
  );
  const [name, setName] = useState<string>(
    () => getStoredProfile(address).name,
  );

  // Sync profile when address changes
  useEffect(() => {
    const profile = getStoredProfile(address);
    setAvatar((current) =>
      current !== profile.avatar ? profile.avatar : current,
    );
    setName((current) => (current !== profile.name ? profile.name : current));
  }, [address]);

  const updateAvatar = (newUrl: string) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setAvatar(newUrl);
      const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
      const currentData = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(
        key,
        JSON.stringify({ ...currentData, avatar: newUrl }),
      );

      toast.success("Profile updated");
    } catch (_e) {
      toast.error("Failed to save profile");
    }
  };

  const updateName = (newName: string) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setName(newName);
      const key = `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
      const currentData = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(
        key,
        JSON.stringify({ ...currentData, name: newName }),
      );

      toast.success("Name updated");
    } catch (_e) {
      toast.error("Failed to save name");
    }
  };

  return {
    avatar,
    name,
    updateAvatar,
    updateName,
    availableAvatars: PRESET_AVATARS,
  };
}
````

## File: src/hooks/voting/useJurorStats.ts
````typescript
import { useReadContract, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { formatUnits } from "viem";
import { useStakingToken } from "../core/useStakingToken";

export function useJurorStats() {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  const { data, isLoading, refetch } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "jurorStats", // New mapping on contract
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Default State
  if (!data || !address) {
    return {
      stats: {
        matches: 0,
        wins: 0,
        earnings: "0",
        accuracy: "0%",
      },
      rank: "Rookie",
      isLoading,
      refetch,
    };
  }

  // Parse Data: struct JurorStats { totalDisputes; coherentVotes; totalEarnings; }
  // Viem/Wagmi can return this as an object (named struct) or array depending on ABI config.
  // Handle both cases safely.
  const raw = data as any;

  // Try object property access first (preferred), fallback to array index
  const matches = Number(raw.totalDisputes ?? raw[0] ?? 0);
  const wins = Number(raw.coherentVotes ?? raw[1] ?? 0);
  const rawEarnings = raw.totalEarnings ?? raw[2] ?? 0n;

  // Calculate Accuracy
  const accuracyVal = matches > 0 ? (wins / matches) * 100 : 0;
  const accuracy = accuracyVal.toFixed(0) + "%";

  // Determine Rank
  let rank = "Rookie";
  if (matches > 5) {
    if (accuracyVal >= 90) rank = "High Arbiter";
    else if (accuracyVal >= 70) rank = "Magistrate";
    else if (accuracyVal >= 50) rank = "Juror";
  }

  return {
    stats: {
      matches,
      wins,
      earnings: formatUnits(rawEarnings, decimals),
      accuracy,
    },
    rank,
    isLoading,
    refetch,
  };
}
````

## File: src/hooks/voting/useSliceVoting.ts
````typescript
import { useState } from "react";
import { toast } from "sonner";
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import { getContractsForChain, SLICE_ABI } from "@/config/contracts";
import {
  calculateCommitment,
  deriveSaltFromSignature,
  getSaltGenerationMessage,
  recoverVote,
} from "../../util/votingUtils";
import { useSignMessage } from "wagmi";
import { saveVoteData, getVoteData } from "../../util/votingStorage";

export const useSliceVoting = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string>("");

  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = useChainId();
  const { sliceContract } = getContractsForChain(chainId);

  // --- COMMIT VOTE ---
  const commitVote = async (disputeId: string, vote: number) => {
    if (!address || !publicClient) {
      toast.error("Please connect your wallet");
      return false;
    }

    setIsProcessing(true);
    setLogs("Generating secure commitment...");

    try {
      // Generate deterministic salt
      const message = getSaltGenerationMessage(disputeId);
      console.log("[Commit] Salt Message:", message);
      const signature = await signMessageAsync({ message });
      console.log("[Commit] Signature:", signature);

      setLogs("Verifying signature...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const salt = deriveSaltFromSignature(signature);
      console.log("[Commit] Salt:", salt);

      // Generate commitment
      const commitmentHash = calculateCommitment(vote, salt);
      console.log(`Vote: ${vote}, Salt: ${salt}, Hash: ${commitmentHash}`);
      setLogs("Sending commitment to blockchain...");

      console.log("[Commit] Vote to be Committed");
      const hash = await writeContractAsync({
        address: sliceContract as `0x${string}`,
        abi: SLICE_ABI,
        functionName: "commitVote",
        args: [BigInt(disputeId), commitmentHash as `0x${string}`],
      });
      console.log("[Commit] Vote Committed");

      setLogs("Waiting for confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      // Save to storage
      saveVoteData(sliceContract, disputeId, address, vote, salt);
      toast.success("Vote committed successfully! Salt saved.");
      setLogs("Commitment confirmed on-chain.");

      return true;
    } catch (error: any) {
      console.error("Commit Error:", error);
      // Handle the specific "User rejected" vs "System error"
      const msg = error.message || "Unknown error";
      if (msg.includes("User rejected")) {
        toast.error("Signature rejected");
      } else {
        toast.error("Failed to commit vote");
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // --- REVEAL VOTE ---
  const revealVote = async (disputeId: string) => {
    if (!address || !publicClient) {
      toast.error("Please connect your wallet");
      return false;
    }

    setIsProcessing(true);
    setLogs("Retrieving secret salt...");

    try {
      let voteToReveal: number;
      let saltToReveal: bigint;

      const storedData = getVoteData(sliceContract, disputeId, address);

      if (storedData) {
        console.log("Found local data");
        voteToReveal = storedData.vote;
        saltToReveal = BigInt(storedData.salt);
      } else {
        setLogs("Local data missing. Recovering from signature...");

        // Ask user to sign the original message again
        const message = getSaltGenerationMessage(disputeId);
        const signature = await signMessageAsync({ message });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        saltToReveal = deriveSaltFromSignature(signature);

        // Fetch the commitment stored on-chain to verify against
        const onChainCommitment = await publicClient.readContract({
          address: sliceContract as `0x${string}`,
          abi: SLICE_ABI,
          functionName: "commitments",
          args: [BigInt(disputeId), address],
        });

        // Recover the vote by checking which option (0 or 1) matches the hash
        voteToReveal = recoverVote(saltToReveal, onChainCommitment as string);
        setLogs("Vote recovered! Revealing...");
      }

      const hash = await writeContractAsync({
        address: sliceContract as `0x${string}`,
        abi: SLICE_ABI,
        functionName: "revealVote",
        args: [BigInt(disputeId), BigInt(voteToReveal), BigInt(saltToReveal)],
        account: address,
      });

      setLogs("Waiting for confirmation...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Vote revealed successfully!");
      setLogs("Vote revealed and counted.");
      return true;
    } catch (error: any) {
      console.error("Reveal Error:", error);
      toast.error(`Reveal Failed: ${error.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { commitVote, revealVote, isProcessing, logs };
};
````

## File: src/types/xo-connect.d.ts
````typescript
declare module "xo-connect" {
  // 1. Define the shape of the Currency and Client objects
  // (Based on the library implementation you shared)
  export interface Currency {
    id: string;
    symbol: string;
    address: string;
    image: string;
    chainId: string; // This is the crucial field for your debugging
  }

  export interface Client {
    _id: string;
    alias: string;
    image: string;
    currencies: Currency[];
  }

  // 2. Define the Singleton Class Interface
  interface XOConnectInterface {
    getClient(): Promise<Client>;
  }

  // 3. Export the Singleton Instance
  // This matches 'export const XOConnect = new _XOConnect();' from the library
  export const XOConnect: XOConnectInterface;

  // 4. Export the Provider (Existing)
  export class XOConnectProvider {
    constructor(config: {
      rpcs: Record<string, string>;
      defaultChainId: string;
    });

    request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  }
}
````

## File: src/util/ipfs.ts
````typescript
import axios from "axios";

// Environment variables for Pinata configuration
const JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
const GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!;
const GROUP_ID = process.env.NEXT_PUBLIC_PINATA_GROUP_ID!;

/**
 * Uploads a JSON object to IPFS via Pinata, assigning it to a specific group.
 * * @param content - The JSON object containing dispute data (title, description, etc.)
 * @returns The IPFS Hash (CID) of the pinned content, or null if failed.
 */
export const uploadJSONToIPFS = async (content: any) => {
  try {
    if (!JWT) {
      throw new Error("Pinata JWT is missing in environment variables.");
    }

    // Construct the payload required by Pinata for grouping and metadata
    const payload = {
      pinataContent: content, // The actual data goes here
      pinataMetadata: {
        name: content.title
          ? `Dispute - ${content.title}`
          : "Slice Dispute Data",
        keyvalues: {
          type: "dispute_metadata",
          // You can add more custom key-values here for filtering in Pinata
        },
      },
      pinataOptions: {
        cidVersion: 1, // Recommended for better compatibility
        groupId: GROUP_ID, // Assigns this pin to your specific group
      },
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      payload,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS: ", error);
    return null;
  }
};

/**
 * Uploads a File object to IPFS via Pinata.
 * @param file - The File object to upload.
 * @returns The IPFS Hash (CID) of the pinned file, or null if failed.
 */
export const uploadFileToIPFS = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          // axios automatically sets the multipart boundary
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      },
    );
    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    return null;
  }
};

/**
 * Fetches JSON data from IPFS using the configured Gateway.
 * * @param ipfsHash - The CID of the content to fetch.
 * @returns The parsed JSON data, or null if failed.
 */
export const fetchJSONFromIPFS = async (ipfsHash: string) => {
  try {
    if (!GATEWAY_URL) {
      throw new Error("IPFS Gateway URL is missing in environment variables.");
    }

    // Ensure the gateway URL ends with a slash
    const baseUrl = GATEWAY_URL.endsWith("/") ? GATEWAY_URL : `${GATEWAY_URL}/`;

    const res = await axios.get(`${baseUrl}ipfs/${ipfsHash}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching from IPFS (${ipfsHash}): `, error);
    return null;
  }
};

/**
 * Batch fetches multiple IPFS hashes in parallel for optimal performance.
 * Eliminates waterfall patterns when loading multiple disputes.
 * 
 * @param ipfsHashes - Array of IPFS CIDs to fetch
 * @returns Map of hash -> parsed JSON data (null for failed fetches)
 */
export const batchFetchIPFSMetadata = async (
  ipfsHashes: string[]
): Promise<Map<string, any>> => {
  // Remove duplicates and empty strings
  const uniqueHashes = [...new Set(ipfsHashes.filter(Boolean))];
  
  // Fetch all in parallel
  const results = await Promise.all(
    uniqueHashes.map(async (hash) => {
      const data = await fetchJSONFromIPFS(hash);
      return [hash, data] as const;
    })
  );
  
  return new Map(results);
};
````

## File: src/util/storage.ts
````typescript
/**
 * A typed wrapper around localStorage largely borrowed from (but less capable
 * than) https://www.npmjs.com/package/typed-local-store
 *
 * Provides a fully-typed interface to localStorage, and is easy to modify for other storage strategies (i.e. sessionStorage)
 */

/**
 * Valid localStorage key names mapped to an arbitrary value of the correct
 * type. Used to provide both good typing AND good type-ahead, so that you can
 * see a list of valid storage keys while using this module elsewhere.
 */
type Schema = {
  walletId: string;
  walletAddress: string;
  walletNetwork: string;
  networkPassphrase: string;
  contractId: string;
};

/**
 * Typed interface that follows the Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 *
 * Implementation has been borrowed and simplified from https://www.npmjs.com/package/typed-local-store
 */
class TypedStorage<T> {
  private readonly storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  public get length(): number {
    return this.storage?.length;
  }

  public key<U extends keyof T>(index: number): U {
    return this.storage?.key(index) as U;
  }

  public getItem<U extends keyof T>(
    key: U,
    retrievalMode: "fail" | "raw" | "safe" = "fail",
  ): T[U] | null {
    const item = this.storage?.getItem(key.toString());

    if (item == null) {
      return item;
    }

    try {
      return JSON.parse(item) as T[U];
    } catch (error) {
      switch (retrievalMode) {
        case "safe":
          return null;
        case "raw":
          return item as unknown as T[U];
        default:
          throw error;
      }
    }
  }

  public setItem<U extends keyof T>(key: U, value: T[U]): void {
    this.storage?.setItem(key.toString(), JSON.stringify(value));
  }

  public removeItem<U extends keyof T>(key: U): void {
    this.storage?.removeItem(key.toString());
  }

  public clear(): void {
    this.storage?.clear();
  }
}

/**
 * Fully-typed wrapper around localStorage
 */
const storageInstance = new TypedStorage<Schema>();
export default storageInstance;
````

## File: src/util/votingStorage.ts
````typescript
interface VoteData {
  vote: number;
  salt: string; // Stored as string to handle BigInt safely
  timestamp: number;
}

/**
 * Generates a unique, collision-resistant storage key.
 * Format: slice_v2_<contract_address>_dispute_<id>_user_<user_address>
 */
export const getVoteStorageKey = (
  contractAddress: string | undefined,
  disputeId: string | number,
  userAddress: string | null | undefined,
): string => {
  // Fallback values prevent crashes if data isn't ready, though logic should prevent this
  const safeContract = contractAddress
    ? contractAddress.toLowerCase()
    : "unknown_contract";
  const safeUser = userAddress ? userAddress.toLowerCase() : "unknown_user";

  return `slice_v2_${safeContract}_dispute_${disputeId}_user_${safeUser}`;
};

/**
 * Saves the vote commitment data (Salt + Vote Choice).
 */
export const saveVoteData = (
  contractAddress: string,
  disputeId: string | number,
  userAddress: string,
  vote: number,
  salt: bigint,
) => {
  if (!contractAddress || !userAddress) return;

  const key = getVoteStorageKey(contractAddress, disputeId, userAddress);
  const data: VoteData = {
    vote,
    salt: salt.toString(), // Convert BigInt to string for JSON serialization
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Slice: Failed to save vote data to LocalStorage", e);
  }
};

/**
 * Retrieves the stored vote data. Returns null if not found.
 */
export const getVoteData = (
  contractAddress: string | undefined,
  disputeId: string | number,
  userAddress: string | null | undefined,
): VoteData | null => {
  if (!contractAddress || !userAddress) return null;

  const key = getVoteStorageKey(contractAddress, disputeId, userAddress);
  const item = localStorage.getItem(key);

  if (!item) return null;

  try {
    return JSON.parse(item) as VoteData;
  } catch (e) {
    console.error("Slice: Error parsing vote data from storage", e);
    return null;
  }
};

/**
 * Boolean check: Did the user vote on *this specific contract instance*?
 */
export const hasLocalVote = (
  contractAddress: string | undefined,
  disputeId: string | number,
  userAddress: string | null | undefined,
): boolean => {
  return !!getVoteData(contractAddress, disputeId, userAddress);
};
````

## File: src/util/votingUtils.ts
````typescript
import { encodePacked, keccak256, toHex, fromHex, toBytes } from "viem";

/**
 * Generate a random identity secret for voting
 */
export function generateIdentitySecret(): bigint {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to bigint (taking first 31 bytes to fit in Field if using ZK, though here just random)
  let value = BigInt(0);
  for (let i = 0; i < 31; i++) {
    value = value * BigInt(256) + BigInt(array[i]);
  }
  return value;
}

/**
 * 1. STATIC MESSAGE GENERATOR
 * The message must be identical on every device to produce the same signature/salt.
 */
export function getSaltGenerationMessage(disputeId: string | number): string {
  return `Slice Protocol: Generate secure voting secret for Dispute #${disputeId}. \n\nSign this message to derive your voting salt. This does not cast a vote or cost gas.`;
}

/**
 * 2. DETERMINISTIC SALT DERIVATION
 * Hashes the signature (which is unique to the user + dispute) to create the salt.
 */
export function deriveSaltFromSignature(signature: string): bigint {
  const hash = keccak256(toBytes(signature));
  return BigInt(hash);
}

/**
 * 3. VOTE RECOVERY
 * Brute-force checks if Vote 0 or Vote 1 matches the commitment found on-chain.
 */
export function recoverVote(
  recoveredSalt: bigint,
  onChainCommitment: string, // The hash stored in the contract
): number {
  // Check against Vote 0 (Defender)
  const hash0 = calculateCommitment(0, recoveredSalt);
  if (hash0 === onChainCommitment) return 0;

  // Check against Vote 1 (Claimant)
  const hash1 = calculateCommitment(1, recoveredSalt);
  if (hash1 === onChainCommitment) return 1;

  throw new Error("Signature derived salt does not match on-chain commitment.");
}

/**
 * Calculate commitment: keccak256(vote || salt)
 * Equivalent to Solidity: keccak256(abi.encodePacked(vote, salt))
 */
export function calculateCommitment(vote: number, salt: bigint): string {
  // Viem: Encode packed arguments then hash
  return keccak256(encodePacked(["uint256", "uint256"], [BigInt(vote), salt]));
}

/**
 * Calculate nullifier: hash(identity_secret || salt || proposal_id)
 * Equivalent to Solidity: keccak256(abi.encodePacked(identitySecret, salt, uint64(proposalId)))
 * Returns the nullifier as a 32-byte array (Uint8Array)
 */
export function calculateNullifier(
  identitySecret: bigint,
  salt: bigint,
  proposalId: number,
): Uint8Array {
  // We use uint64 for proposalId based on the original logic (8 bytes)
  const hash = keccak256(
    encodePacked(
      ["uint256", "uint256", "uint64"],
      [identitySecret, salt, BigInt(proposalId)],
    ),
  );

  // Convert hex string back to Uint8Array
  return fromHex(hash, "bytes");
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return toHex(bytes);
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  return fromHex(hex as `0x${string}`, "bytes");
}

/**
 * Convert Uint8Array to Buffer (for Stellar SDK compatibility if needed)
 */
export function bytesToBuffer(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes);
}
````

## File: src/util/wallet.ts
````typescript
import { isAddress } from "viem";

/**
 * Shortens a wallet address to the format 0x1234...5678
 * @param address The full wallet address (or any string)
 * @param chars Number of characters to show at start and end (default 4)
 * @returns Shortened address or original string if not a valid address format
 */
export const shortenAddress = (
  address: string | undefined,
  chars = 4,
): string => {
  if (!address) return "";

  // Use Viem to validate it's a real Ethereum address
  if (!isAddress(address)) {
    // Fallback logic for non-address strings (like names)
    return address.length > 20
      ? `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
      : address;
  }

  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};
````

## File: .env.example
````
# PINATA
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_API_SECRET=
NEXT_PUBLIC_PINATA_GATEWAY_URL=
NEXT_PUBLIC_PINATA_JWT=
NEXT_PUBLIC_PINATA_GROUP_ID=

# PRIVY
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
NEXT_PUBLIC_PRIVY_JWKS_ENDPOINT=
NEXT_PRIVY_SECRET=

# PIMLICO
NEXT_PUBLIC_PIMLICO_API_KEY=
NEXT_PUBLIC_PIMLICO_BASE_RPC=
NEXT_PUBLIC_PIMLICO_BUNDLER_URL=
NEXT_PUBLIC_PIMLICO_PAYMASTER_URL=

# CONTRACTS
NEXT_PUBLIC_APP_ENV="development" # development | production
NEXT_PUBLIC_ENABLE_PWA="false"
NEXT_PUBLIC_BASE_SLICE_CONTRACT=
NEXT_PUBLIC_BASE_SEPOLIA_SLICE_CONTRACT=""
````

## File: README.md
````markdown
# ⚖️ Slice Protocol Application

This project is the frontend implementation for **Slice**, a **Real-Time Dispute Resolution Protocol** built on Next.js. It features a **multi-tenant architecture** capable of running as a standalone PWA or as an embedded MiniApp across various wallet ecosystems (Base, Beexo).

**🔗 Live Demo**: [Testnet](https://dev.slicehub.xyz) | [Mainnet](https://app.slicehub.xyz)

---

## ⚡ What is Slice?

**Slice** is a **decentralized, real-time dispute resolution protocol**. It acts as a **neutral truth oracle** that resolves disputes quickly and trustlessly through **randomly selected jurors** and **economic incentives**.

We are building the **"Uber for Justice"**:
* **Decentralized & Trustless:** No central authority controls the outcome.
* **Fast & Scalable:** Designed for real-time applications, offering quick rulings compared to traditional courts.
* **Gamified Justice:** Jurors enter the Dispute Resolution Market via an **intuitive and entertaining App/MiniApp**.
* **Earn by Ruling:** Users stake tokens to become jurors and **earn money** by correctly reviewing evidence and voting on disputes.

---

## 🏗️ Architecture: Multi-Tenant & Strategy Pattern

This application uses a **Strategy Pattern** to manage wallet connections and SDK interactions. Instead of a single monolithic connection logic, we use an abstraction layer that selects the appropriate **Adapter** based on the runtime environment (detected via subdomains and SDK presence).

### 1. Connection Strategies

We support two active connection strategies (with Lemon planned):

| Strategy | Description | Used By |
|----------|-------------|---------|
| **Wagmi SW** | Uses Smart Wallets (Coinbase/Safe) via Privy & Wagmi. | **PWA**, **Base** |
| **Wagmi EOA** | Uses standard Injected (EOA) connectors. | **Beexo** |
| *(Planned)* Lemon SDK | Native `@lemoncash/mini-app-sdk`. | Lemon |

### 2. Supported MiniApps & Environments

The application behaves differently depending on the access point (Subdomain) and injected providers.

| Platform | Subdomain | Connection Strategy | Auth Type |
|----------|-----------|---------------------|-----------|
| **Standard PWA** | `app.` | **Wagmi SW** | Social / Email / Wallet |
| **Base MiniApp** | `base.` | **Wagmi SW** | Coinbase Smart Wallet |
| **Beexo** | `beexo.` | **Wagmi EOA** | Injected Provider (Beexo) |
| **Lemon (planned)** | `lemon.` | Lemon SDK | Native Lemon Auth |

---

## 🚀 Try Slice Now

Experience the future of decentralized justice on **Base**:

* **Testnet Demo**: [dev.slicehub.xyz](https://dev.slicehub.xyz) – (Base Sepolia)
* **Mainnet App**: [app.slicehub.xyz](https://app.slicehub.xyz) – (Base)

---

## ⚖️ How It Works (The Juror Flow)

1. **Enter the Market:** Users open the Slice App or MiniApp and **stake USDC** to join the juror pool.
2. **Get Drafted:** When a dispute arises, jurors are randomly selected (Drafted) to review the case.
3. **Review & Vote:** Jurors analyze the evidence provided by both parties and vote privately on the outcome.
4. **Earn Rewards:** If their vote aligns with the majority consensus, they **earn fees** from the losing party.
5. **Justice Served:** The protocol aggregates the votes and executes the ruling on-chain instantly.

---

## 🔌 Integration Guide (For Developers)

Integrating Slice V1.5 into your protocol follows an Arbitrable/Arbitrator flow:

### 1. Create a Dispute
From your arbitrable contract, call `slice.createDispute(CreateDisputeParams)` and store your local-case to `disputeId` mapping.

### 2. Fund and progress the dispute
Parties pay arbitration costs in `slice.stakingToken()` through `payDispute(disputeId)`. During the dispute, parties can submit evidence through `submitEvidence`.

### 3. Settle via callback
Slice calls `IArbitrable.rule(disputeId, ruling)` on your contract when finalized. In Slice V1.5, `ruling == 1` means claimer wins and `ruling == 0` means defender wins.

Reference implementation:
- `slice_sc/src/core/P2PTradeEscrow.sol`
- `slice_sc/test/integration/P2PTradeEscrow.integration.t.sol`

---

## 📍 Deployed Contracts

| Network | Slice Core | USDC Token |
|---------|------------|------------|
| **Base Sepolia** | `0xD8A10bD25e0E5dAD717372fA0C66d3a59a425e4D` | `0x5dEaC602762362FE5f135FA5904351916053cF70` |
| **Base Mainnet** | `0xD8A10bD25e0E5dAD717372fA0C66d3a59a425e4D` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

---

## 🚀 Getting Started

### 1. Configure Environment

Rename `.env.example` to `.env.local` and add your keys.

```bash
NEXT_PUBLIC_APP_ENV="development" # or 'production'

# Pinata / IPFS Config
NEXT_PUBLIC_PINATA_JWT="your_pinata_jwt"
NEXT_PUBLIC_PINATA_GATEWAY_URL="your_gateway_url"

# Privy Config (For PWA / Base)
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
NEXT_PUBLIC_PRIVY_CLIENT_ID="your_privy_client_id"

# Contracts
NEXT_PUBLIC_BASE_SLICE_CONTRACT="0x..."
NEXT_PUBLIC_BASE_USDC_CONTRACT="0x..."
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```

* **PWA Mode:** `http://localhost:3000`
* **MiniApp Mode:** Use the native testing environment provided by the wallet SDK.

---

## ⚙️ Application Configuration

The `src/config/` and `src/adapters/` directories manage the multi-environment logic.

### Abstraction Layer (`src/adapters/`)

We abstract wallet interactions behind a common interface:

* **`useWalletAdapter`** – Selects the active strategy based on environment.
* **`WagmiAdapter`** – Wraps Wagmi hooks (Smart Wallets or EOA).
* *(Planned)* **`LemonAdapter`** – Will wrap `@lemoncash/mini-app-sdk`.

### Chain Configuration (`src/config/chains.ts`)

* Exports `SUPPORTED_CHAINS` mapping Wagmi `Chain` objects to contract addresses.
* Defaults based on `NEXT_PUBLIC_APP_ENV`.

---

## 🔧 Smart Contract Development

Solidity contracts are in `slice_sc/` and use **Foundry**.

### Commands

```bash
cd slice_sc
forge build
forge test
```

For contract deployment and seeding scripts, see `slice_sc/README.md`.

---

## 🗺️ Roadmap

* [x] Phase 1 – Foundation (Core Protocol, Web UI)
* [x] Phase 2 – Architecture Overhaul (Strategy Pattern, Multi-Tenant SDKs)
* [ ] Phase 3 – MiniApp Expansion (Live integration with Lemon, Beexo)
* [ ] Phase 4 – Slice V1.5 Migration (Passive Global Staking)
* [ ] Phase 5 – Specialized Courts & DAO Governance
````

## File: src/app/disputes/[id]/loading.tsx
````typescript
import { Loader2 } from "lucide-react";

export default function DisputeLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#F8F9FC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
        <p className="text-sm text-gray-500 font-medium">Loading dispute...</p>
      </div>
    </div>
  );
}
````

## File: src/app/juror/assign/loading.tsx
````typescript
import { Loader2, Shuffle } from "lucide-react";

export default function JurorAssignLoading() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 items-center justify-center gap-6">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 animate-[spin_3s_linear_infinite]" />
        <Shuffle className="w-10 h-10 text-indigo-600 animate-pulse relative z-10" />
      </div>
      <p className="text-gray-500 font-medium">Connecting to protocol...</p>
    </div>
  );
}
````

## File: src/config/adapters/farcaster.tsx
````typescript
"use client";

import { ReactNode } from "react";
import {
  cookieStorage,
  createConfig,
  createStorage,
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { baseAccount } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { activeChains, transports } from "@/config/chains";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";

export const farcasterConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: "Slice",
      appLogoUrl: "/images/slice-logo-light.svg",
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

export function FarcasterProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={farcasterConfig} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}

export function FarcasterAuthAdapter({ children }: { children: ReactNode }) {
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: isConnected,
        connect: async () => {
          const connector =
            connectors.find(
              (x) =>
                x.type === "farcasterMiniApp" ||
                x.id === "farcasterMiniApp" ||
                x.id.toLowerCase().includes("farcaster"),
            ) ||
            connectors.find((x) => x.type === "baseAccount") ||
            connectors[0];

          if (connector) {
            await connectAsync({ connector });
          }
        },
        disconnect: async () => disconnectAsync(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
````

## File: src/config/adapters/privy.tsx
````typescript
"use client";

import { createConfig } from "wagmi";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { activeChains, transports, defaultChain } from "@/config/chains";
import { injected } from "wagmi/connectors";
import { AuthStrategyProvider } from "@/contexts/AuthStrategyContext";
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from "@/config/app";
import { ReactNode } from "react";

export const privyConfig = createConfig({
  chains: activeChains,
  transports,
  connectors: [injected()],
  ssr: true,
});

// Export Provider Tree
export function PrivyProviderTree({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      config={{
        defaultChain: defaultChain,
        supportedChains: [...activeChains],
        appearance: {
          theme: "light",
          accentColor: "#1b1c23",
          logo: "/images/slice-logo-light.svg",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <PrivyWagmiProvider config={privyConfig} initialState={initialState}>
        <SmartWalletsProvider>{children}</SmartWalletsProvider>
      </PrivyWagmiProvider>
    </PrivyProvider>
  );
}

// Export Auth Adapter
export function PrivyAuthAdapter({ children }: { children: ReactNode }) {
  const { login, logout, authenticated } = usePrivy();

  return (
    <AuthStrategyProvider
      value={{
        isAuthenticated: authenticated,
        connect: async () => login(),
        disconnect: async () => logout(),
      }}
    >
      {children}
    </AuthStrategyProvider>
  );
}
````

## File: src/hooks/actions/useExecuteRuling.ts
````typescript
import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { toast } from "sonner";

export function useExecuteRuling() {
  const { sliceContract } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isExecuting, setIsExecuting] = useState(false);

  // Return Promise<boolean> for cleaner control flow
  const executeRuling = async (disputeId: string | number): Promise<boolean> => {
    try {
      setIsExecuting(true);
      console.log(`Executing ruling for dispute #${disputeId}...`);

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "executeRuling",
        args: [BigInt(disputeId)],
      });

      toast.info("Transaction sent. Waiting for confirmation...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Ruling executed successfully!");
      return true; // Explicitly return true on success
    } catch (err: any) {
      console.error("Execution Error:", err);
      const msg =
        err.reason || err.shortMessage || err.message || "Unknown error";
      toast.error(`Execution Failed: ${msg}`);
      return false; // Return false on failure
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeRuling,
    isExecuting,
  };
}
````

## File: src/hooks/actions/useWithdraw.ts
````typescript
"use client";

import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useReadContract,
  useAccount,
} from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "../core/useContracts";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useStakingToken } from "../core/useStakingToken";

export function useWithdraw() {
  const { address } = useAccount();
  const { sliceContract: SLICE_ADDRESS } = useContracts();
  const {
    address: stakingToken,
    decimals,
    symbol: _symbol,
  } = useStakingToken();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Read claimable balance
  const { data: balance, refetch } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const claimableAmount = balance
    ? formatUnits(balance as bigint, decimals)
    : "0";
  const hasFunds = balance ? (balance as bigint) > 0n : false;

  const withdraw = async () => {
    if (!stakingToken) {
      toast.error("Token address not found");
      return;
    }

    try {
      setIsWithdrawing(true);
      toast.info("Initiating withdrawal...");

      const hash = await writeContractAsync({
        address: SLICE_ADDRESS,
        abi: SLICE_ABI,
        functionName: "withdraw",
        args: [stakingToken as `0x${string}`],
      });

      toast.info("Transaction sent...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Success is handled by the animation overlay in the component
      refetch(); // Update balance UI
      return true;
    } catch (err: any) {
      console.error("Withdraw error", err);
      toast.error(`Withdraw failed: ${err.shortMessage || err.message}`);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    withdraw,
    isWithdrawing,
    claimableAmount,
    hasFunds,
    refetchBalance: refetch,
  };
}
````

## File: src/hooks/disputes/useGetDispute.ts
````typescript
import { useReadContract, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";
import { useContracts } from "../core/useContracts";

export function useGetDispute(id: string) {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch raw dispute data from the contract
  const {
    data: rawDispute,
    isLoading: isDisputeLoading,
    error,
    refetch,
  } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "disputes", // Matches your Solidity mapping
    args: [BigInt(id)],
    query: {
      enabled: !!id, // Only run if ID exists
      staleTime: 5000, // Cache for 5 seconds
    },
  });

  // 2. Fetch jurorStakes for the current user
  const { data: myStake, isLoading: isStakeLoading } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "jurorStakes",
    args: address ? [BigInt(id), address] : undefined,
    query: {
      enabled: !!id && !!address,
    },
  });

  const [transformedDispute, setTransformedDispute] =
    useState<DisputeUI | null>(null);

  // 3. Transform the data using your utility
  // Since transformDisputeData is async (fetches IPFS), we need a useEffect
  useEffect(() => {
    async function load() {
      if (!rawDispute) {
        setTransformedDispute(null);
        return;
      }
      try {
        // We pass the raw result to the transformer with the user's stake
        const transformed = await transformDisputeData(
          {
            ...(rawDispute as any),
            id,
          },
          decimals,
          false, // userHasRevealed (not critical for this view, or add fetch)
          undefined,
          myStake ? (myStake as bigint) : undefined,
        );
        setTransformedDispute(transformed);
      } catch (e) {
        console.error("Failed to transform dispute data", e);
      }
    }
    load();
  }, [rawDispute, myStake, id, decimals]);

  return {
    dispute: transformedDispute,
    loading: isDisputeLoading || isStakeLoading,
    error,
    refetch,
  };
}
````

## File: src/hooks/disputes/useMyDisputes.ts
````typescript
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import {
  transformDisputeData,
  batchFetchIPFSMetadata,
  type DisputeUI,
} from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useStakingToken } from "../core/useStakingToken";

export function useMyDisputes() {
  const { address } = useAccount();
  const { decimals } = useStakingToken();
  const { sliceContract } = useContracts();

  // 1. Fetch IDs
  // We rely on the smart contract fix (userDisputes[_config.claimer])
  // so these standard calls will now work correctly.
  const { data: jurorIds, isLoading: loadJuror } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userIds, isLoading: loadUser } = useReadContract({
    address: sliceContract,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // 2. Merge & Deduplicate IDs
  const sortedIds = useMemo(() => {
    const jIds = (jurorIds as bigint[]) || [];
    const uIds = (userIds as bigint[]) || [];

    const unique = Array.from(
      new Set([...jIds, ...uIds].map((id) => id.toString())),
    );

    return unique.map(BigInt).sort((a, b) => Number(b) - Number(a));
  }, [jurorIds, userIds]);

  // 3. Prepare Multicall for disputes
  const disputeCalls = useMemo(() => {
    return sortedIds.map((id) => ({
      address: sliceContract,
      abi: SLICE_ABI,
      functionName: "disputes",
      args: [id],
    }));
  }, [sortedIds, sliceContract]);

  // 3b. Prepare Multicall for hasRevealed status
  const revealCalls = useMemo(() => {
    if (!address) return [];
    return sortedIds.map((id) => ({
      address: sliceContract,
      abi: SLICE_ABI,
      functionName: "hasRevealed",
      args: [id, address],
    }));
  }, [sortedIds, sliceContract, address]);

  // 3c. Prepare Multicall for jurorStakes
  const stakeCalls = useMemo(() => {
    if (!address) return [];
    return sortedIds.map((id) => ({
      address: sliceContract,
      abi: SLICE_ABI,
      functionName: "jurorStakes",
      args: [id, address],
    }));
  }, [sortedIds, sliceContract, address]);

  const { data: results, isLoading: loadMulti } = useReadContracts({
    contracts: disputeCalls,
    query: { enabled: sortedIds.length > 0 },
  });

  const { data: revealResults, isLoading: loadReveal } = useReadContracts({
    contracts: revealCalls,
    query: { enabled: revealCalls.length > 0 },
  });

  const { data: stakeResults, isLoading: loadStakes } = useReadContracts({
    contracts: stakeCalls,
    query: { enabled: stakeCalls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);

  // 4. Transform Data
  useEffect(() => {
    // If results is undefined/null, handle empty state or return
    if (!results) {
      if (!loadMulti && sortedIds.length === 0) setDisputes([]);
      return;
    }

    // FIX: Capture 'results' into a local const to satisfy TypeScript's
    // narrowing inside the async closure below.
    const currentResults = results;
    const currentRevealResults = revealResults;
    const currentStakeResults = stakeResults;

    async function process() {
      // Extract all IPFS hashes from successful results
      const ipfsHashes = currentResults
        .filter((r) => r.status === "success")
        .map((r) => {
          const data = r.result as any;
          return data?.ipfsHash || data?.[6] || "";
        });

      // Batch fetch all IPFS metadata in parallel (eliminates waterfall)
      const ipfsDataMap = await batchFetchIPFSMetadata(ipfsHashes);

      // Transform disputes with pre-fetched metadata
      const processed = await Promise.all(
        currentResults.map(async (res, idx) => {
          if (res.status !== "success") return null;

          // Inject ID manually to be safe
          const id = sortedIds[idx].toString();
          const data = res.result as any;
          const ipfsHash = data?.ipfsHash || data?.[6] || "";

          // Get reveal status for this dispute
          const userHasRevealed =
            currentRevealResults?.[idx]?.status === "success"
              ? Boolean(currentRevealResults[idx].result)
              : false;

          // Extract specific stake for this user
          const userStakeAmount =
            currentStakeResults?.[idx]?.status === "success"
              ? (currentStakeResults[idx].result as bigint)
              : 0n;

          const prefetchedMeta = ipfsHash ? ipfsDataMap.get(ipfsHash) : undefined;

          return await transformDisputeData(
            { ...(res.result as any), id },
            decimals,
            userHasRevealed,
            prefetchedMeta,
            userStakeAmount,
          );
        })
      );
      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
    }
    process();
  }, [results, revealResults, stakeResults, decimals, sortedIds, loadMulti]);

  return {
    disputes,
    isLoading: loadJuror || loadUser || loadMulti || loadReveal || loadStakes,
  };
}
````

## File: src/hooks/ui/useOnboarding.ts
````typescript
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const ONBOARDING_KEY_PREFIX = "slice_onboarding_completed_v1";
export const ONBOARDING_REPLAY_EVENT = "slice:onboarding:replay";

export function getOnboardingStorageKey(address: string) {
  return `${ONBOARDING_KEY_PREFIX}:${address.toLowerCase()}`;
}

export function resetOnboarding(address?: string) {
  if (typeof window === "undefined") return;

  if (address) {
    localStorage.removeItem(getOnboardingStorageKey(address));
    return;
  }

  const keysToDelete: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(ONBOARDING_KEY_PREFIX)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
}

export function useOnboarding(address?: string, isConnected?: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const storageKey = useMemo(() => {
    if (!address) return null;
    return getOnboardingStorageKey(address);
  }, [address]);

  useEffect(() => {
    if (!isConnected || !storageKey) {
      const resetTimer = window.setTimeout(() => {
        setIsOpen(false);
        setStep(0);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const hasCompleted = localStorage.getItem(storageKey) === "true";
    if (!hasCompleted) {
      const openTimer = window.setTimeout(() => setIsOpen(true), 600);
      return () => window.clearTimeout(openTimer);
    }

    const closeTimer = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [isConnected, storageKey]);

  const complete = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    setIsOpen(false);
    setStep(0);
  }, [storageKey]);

  const next = useCallback((totalSteps: number) => {
    setStep((current) => {
      if (current >= totalSteps - 1) {
        return current;
      }
      return current + 1;
    });
  }, []);

  const open = useCallback(() => {
    setStep(0);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    step,
    setStep,
    next,
    open,
    complete,
    skip: complete,
  };
}
````

## File: src/hooks/voting/useReveal.ts
````typescript
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContracts } from "@/hooks/core/useContracts";
import { useSliceVoting } from "@/hooks/voting/useSliceVoting";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { getVoteData } from "@/util/votingStorage";

export function useReveal(disputeId: string) {
  const { address } = useAccount();
  const { sliceContract } = useContracts();

  const { revealVote, isProcessing, logs } = useSliceVoting();
  const { dispute, refetch } = useGetDispute(disputeId);

  const [localVote, setLocalVote] = useState<number | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);

  // Status flags
  const status = {
    isTooEarly: dispute ? dispute.status < 2 : true,
    isRevealOpen: dispute ? dispute.status === 2 : false,
    isFinished: dispute ? dispute.status > 2 : false,
  };

  useEffect(() => {
    if (address && sliceContract) {
      const stored = getVoteData(sliceContract, disputeId, address);
      if (stored) {
        setLocalVote(stored.vote);
        setHasLocalData(true);
      } else {
        setHasLocalData(false);
      }
    }
  }, [address, disputeId, sliceContract]);

  const handleRevealVote = async () => {
    const success = await revealVote(disputeId);
    
    if (success) {
      // Add propagation delay to allow RPC indexing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Refetch to get updated state
      await refetch();
    }
    
    return success;
  };

  return {
    dispute,
    localVote,
    hasLocalData,
    status,
    revealVote: handleRevealVote,
    isProcessing,
    logs,
  };
}
````

## File: src/hooks/voting/useVote.ts
````typescript
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useSliceVoting } from "@/hooks/voting/useSliceVoting";
import { useAccount, useChainId } from "wagmi";
import { getVoteData } from "@/util/votingStorage";
import { getContractsForChain } from "@/config/contracts";

import { DISPUTE_STATUS } from "@/config/app";

export function useVote(disputeId: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  const { sliceContract } = getContractsForChain(chainId);

  // Local state
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [hasCommittedLocally, setHasCommittedLocally] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contract & Data hooks
  const { dispute, refetch } = useGetDispute(disputeId);
  const { commitVote, isProcessing, logs } = useSliceVoting();

  // Load vote from local storage
  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      const stored = getVoteData(sliceContract, disputeId, address);

      if (stored) {
        setHasCommittedLocally(true);
        setSelectedVote(stored.vote);
      } else {
        setHasCommittedLocally(false);
        setSelectedVote(null);
      }
    }
  }, [address, disputeId, sliceContract]);

  // Actions
  const handleVoteSelect = useCallback(
    (vote: number) => {
      if (hasCommittedLocally) return;
      setSelectedVote((prevVote) => (prevVote === vote ? null : vote));
    },
    [hasCommittedLocally],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refetch]);

  const handleCommit = useCallback(async () => {
    if (selectedVote === null) return false;

    const success = await commitVote(disputeId, selectedVote);

    if (success) {
      setHasCommittedLocally(true);
      toast.success("Vote committed! Refreshing status...");
      
      // Add propagation delay to allow RPC indexing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await handleRefresh();
      return true;
    }
    return false;
  }, [disputeId, selectedVote, commitVote, handleRefresh]);

  // Derived State
  const currentStatus = dispute?.status;
  const isCommitPhase = currentStatus === DISPUTE_STATUS.COMMIT;
  const isRevealPhase = currentStatus === DISPUTE_STATUS.REVEAL;

  const isCommitDisabled =
    isProcessing ||
    selectedVote === null ||
    hasCommittedLocally ||
    !isCommitPhase;

  const isRevealDisabled = !isRevealPhase;

  return {
    dispute,
    selectedVote,
    hasCommittedLocally,
    isRefreshing,
    isProcessing,
    logs,
    isCommitPhase,
    isRevealPhase,
    isCommitDisabled,
    isRevealDisabled,
    handleVoteSelect,
    handleCommit,
    handleRefresh,
  };
}
````

## File: AGENTS.md
````markdown
# Slice Protocol – Developer & Agent Guidelines

This document defines the architectural rules, development standards, and technical constraints for the Slice Protocol frontend and smart contract system.

---

## Architectural Principles

### 1. Multi-Tenant Strategy Pattern

This application runs across multiple environments (PWA, Beexo, Base MiniApp) using a single codebase.

> **Rule:** Do **not** use conditional logic inside UI components (e.g., `if (isBeexo)` or `if (isMiniApp)`).

#### Design Requirements

**Abstraction Layer**  
All wallet interactions must go through a dedicated adapter layer and a single unified provider component. UI components must never talk directly to wallet SDKs or RPC providers.

**Tenant Detection**  
Tenants are detected using request metadata (such as host, origin, or runtime signals) and resolved before any wallet or chain logic is initialized.

**Strategies**
- **Web / PWA** → `Privy + Wagmi` (Smart Wallets via ERC-4337)
- **Beexo** → `Wagmi` with injected `xo-connect` provider (EIP-1193)

---

### 2. State Management

**On-chain data**  
Use **Wagmi v2** hooks:
- `useReadContract`
- `useWriteContract`

Combined with **TanStack Query** for caching and synchronization.

**Local state**  
Use typed LocalStorage helpers for temporary client-side data (for example commit-reveal salts and voting metadata).

**Client / Server separation**
- `wagmi` hooks → **Client Components only** (`"use client"`)
- Server Components → layout, static data, or configuration only

---

## Tech Stack & Standards

- **Framework:** Next.js 16 (App Router)
- **Blockchain interaction:** Viem + Wagmi v2
  > Do **not** use Ethers.js.
- **Styling:** Tailwind CSS + shadcn/ui
  - **UI rule:** Avoid `text-sm` for body copy in embedded contexts (MiniApps)
  - Prefer `text-base` for readability
- **Authentication:**
  - Privy → Web / PWA / Base
  - Injected providers → Beexo

### Required Standards

- **ERC-4337** → Account Abstraction (PWA users)
- **EIP-1193** → Provider interface (Beexo integration)
- **EIP-712** → Typed data signing (when applicable)

---

## Development Workflows

### 1. Running the App

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

- **Standard mode:** http://localhost:3000
- **Beexo simulation:**
  - Inject a compatible provider in the browser, or
  - Mock the `Host` header to trigger Beexo tenant detection

---

### 2. Smart Contract Development

```bash
cd contracts

# Compile
pnpm hardhat compile

# Deploy to Base Sepolia
pnpm hardhat deploy --network baseSepolia
```

---

### 3. IPFS & Evidence Handling

Dispute metadata is stored on IPFS using **Pinata**.

**Rules:**
- Always use the shared IPFS utility module provided by the application to ensure consistent metadata formatting and error handling.
  ```
  src/util/ipfs.ts
  ```
- Evidence JSON must match the `DisputeUI` interface used by the frontend to guarantee correct decoding and rendering.
  ```
  src/util/disputeAdapter.ts
  ```

---

## Coding Conventions

### Component Rules

1. **Wallet-agnostic**  
   Components must consume `useAccount` or `useSliceAccount` and never depend on connection method.

2. **Strict typing**  
   Use `DisputeUI` for all frontend dispute representations.

3. **Error handling**  
   Use `sonner` for user-facing notifications:
   ```ts
   toast.error("Message")
   ```
4. **Tailwind Classes** 
   ALWAYS Use canonical classes, e.g. the class `min-w-[80px]` can be written as `min-w-20`

---

### Commit Messages

Follow **Conventional Commits**:

```text
feat(adapter): add lemon wallet support
fix(voting): resolve salt generation issue
style(ui): update font sizes for mobile
chore(contracts): recompile abis
```

---

## Environment Configuration

> **DO NOT COMMIT SECRETS**

The application requires several environment variables for:
- Runtime mode selection (development vs production)
- Authentication providers
- IPFS / storage backends
- Blockchain network configuration and contract addresses

These values must be provided via your local environment configuration mechanism and deployment platform secrets.

---

**This file is authoritative. Any architectural change must update this document.**
````

## File: src/app/not-found.tsx
````typescript
"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 bg-[#F8F9FC] relative overflow-hidden font-manrope items-center justify-center p-6">
      {/* 1. Ambient Background Glow (Purple) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Main Card */}
      <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-white relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[#8c8fff]/10 rounded-full blur-xl scale-75 group-hover:scale-90 transition-transform duration-500" />
            <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
              <FileQuestion className="w-10 h-10 text-[#8c8fff]" />
            </div>
          </div>
        </div>

        {/* 404 Text Layering */}
        <div className="relative mb-8">
          <h1 className="text-8xl font-black text-[#1b1c23] tracking-tighter opacity-[0.03] absolute left-1/2 -translate-x-1/2 -top-8 select-none">
            404
          </h1>
          <h2 className="text-2xl font-extrabold text-[#1b1c23] mb-2 relative z-10">
            Case Not Found
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto relative z-10">
            It looks like this file is missing, archived, or never existed in
            the protocol.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
        Slice Protocol
      </div>
    </div>
  );
}
````

## File: src/app/providers.tsx
````typescript
"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "@/contexts/TimerContext";
import { Tenant } from "@/config/tenant";
import * as Privy from "@/config/adapters/privy";
import * as Beexo from "@/config/adapters/beexo";
import * as Coinbase from "@/config/adapters/coinbase";
import * as Farcaster from "@/config/adapters/farcaster";

interface Props {
  children: ReactNode;
  tenant: Tenant;
  initialState?: any;
}

// Create QueryClient singleton outside component to persist cache across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection time
    },
  },
});

// Shared providers used across all tenants
function SharedProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>{children}</TimerProvider>
    </QueryClientProvider>
  );
}

export default function ContextProvider({
  children,
  tenant,
  initialState,
}: Props) {
  // Select adapter based on tenant
  let tenantProvider: ReactNode;

  switch (tenant) {
    case Tenant.PRIVY:
      tenantProvider = (
        <Privy.PrivyProviderTree initialState={initialState}>
          <Privy.PrivyAuthAdapter>{children}</Privy.PrivyAuthAdapter>
        </Privy.PrivyProviderTree>
      );
      break;

    case Tenant.BEEXO:
      tenantProvider = (
        <Beexo.BeexoProviderTree initialState={initialState}>
          <Beexo.BeexoAuthAdapter>{children}</Beexo.BeexoAuthAdapter>
        </Beexo.BeexoProviderTree>
      );
      break;

    case Tenant.FARCASTER:
      tenantProvider = (
        <Farcaster.FarcasterProviderTree initialState={initialState}>
          <Farcaster.FarcasterAuthAdapter>{children}</Farcaster.FarcasterAuthAdapter>
        </Farcaster.FarcasterProviderTree>
      );
      break;

    case Tenant.COINBASE:
      tenantProvider = (
        <Coinbase.CoinbaseProviderTree initialState={initialState}>
          <Coinbase.CoinbaseAuthAdapter>
            {children}
          </Coinbase.CoinbaseAuthAdapter>
        </Coinbase.CoinbaseProviderTree>
      );
      break;

    default:
      // Default to PRIVY
      tenantProvider = (
        <Privy.PrivyProviderTree initialState={initialState}>
          <Privy.PrivyAuthAdapter>{children}</Privy.PrivyAuthAdapter>
        </Privy.PrivyProviderTree>
      );
  }

  return <SharedProviders>{tenantProvider}</SharedProviders>;
}
````

## File: src/hooks/actions/useSendNative.ts
````typescript
"use client";

import { useState } from "react";
import { useSendTransaction, usePublicClient, useAccount } from "wagmi";
import { parseEther, isAddress } from "viem";
import { toast } from "sonner";

export function useSendNative(onSuccess?: () => void) {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const sendNative = async (recipient: string, amount: string) => {
    // Basic Validation
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }
    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }
    if (!amount || !(parseFloat(amount) > 0)) {
      toast.error("Invalid amount");
      return;
    }

    setIsLoading(true);
    try {
      const value = parseEther(amount);

      toast.info("Sending transaction...");

      // Execute
      const hash = await sendTransactionAsync({
        to: recipient,
        value: value,
      });

      // Wait
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Transfer successful!");
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.reason || err.shortMessage || err.message || "Transaction failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { sendNative, isLoading };
}
````

## File: src/util/disputeAdapter.ts
````typescript
import { formatUnits } from "viem";
import { fetchJSONFromIPFS, batchFetchIPFSMetadata } from "@/util/ipfs";
import { DISPUTE_STATUS } from "@/config/app";

// Re-export for convenience
export { batchFetchIPFSMetadata } from "@/util/ipfs";

export interface DisputeUI {
  id: string;
  title: string;
  category: string;
  status: number;
  phase: "VOTE" | "REVEAL" | "WITHDRAW" | "CLOSED";
  deadlineLabel: string;
  isUrgent: boolean;
  stake: string; // Generic required stake (usually 1 USDC)
  myStake?: string; // The specific amount the user staked
  jurorsRequired: number;
  revealDeadline: number;
  evidenceDeadline?: number;
  commitDeadline?: number;
  description: string;
  evidence: string[];
  claimer: string;
  defender: string;
  winner?: string;

  // Voting Progress Fields
  commitsCount: number;
  revealsCount: number;
  userHasRevealed: boolean;

  // Payment Status Fields
  claimerPaid: boolean;
  defenderPaid: boolean;

  // Real Data Fields
  claimerName?: string;
  defenderName?: string;
  audioEvidence?: string | null;
  carouselEvidence?: string[];

  // Defender Specific Fields
  defenderDescription?: string;
  defenderAudioEvidence?: string | null;
  defenderCarouselEvidence?: string[];
}

/**
 * Safely extracts a value from contract data that may be returned as an object (struct)
 * or as an array, depending on the ABI configuration and Viem version.
 */
function getField<T>(
  data: any,
  fieldName: string,
  arrayIndex: number,
  defaultValue: T,
): T {
  if (data === null || data === undefined) return defaultValue;

  // Try object property access first (preferred for named structs)
  if (data[fieldName] !== undefined) {
    return data[fieldName] as T;
  }

  // Fallback to array index access (for unnamed/tuple returns)
  if (Array.isArray(data) && data[arrayIndex] !== undefined) {
    return data[arrayIndex] as T;
  }

  // If data is an object with numeric keys (array-like object from Viem)
  if (typeof data === "object" && data[arrayIndex] !== undefined) {
    return data[arrayIndex] as T;
  }

  return defaultValue;
}

export async function transformDisputeData(
  contractData: any,
  decimals: number = 6,
  userHasRevealed: boolean = false,
  prefetchedMetadata?: any,
  userStakeAmount?: bigint,
): Promise<DisputeUI> {
  // Extract fields using safe accessor with fallbacks
  // Struct field order based on Solidity Dispute struct:
  // 0: id, 1: claimer, 2: defender, 3: category, 4: requiredStake,
  // 5: jurorsRequired, 6: ipfsHash, 7: commitsCount, 8: revealsCount,
  // 9: status, 10: claimerPaid, 11: defenderPaid, 12: winner,
  // 13: payDeadline, 14: evidenceDeadline, 15: commitDeadline, 16: revealDeadline

  const id = (
    getField(contractData, "id", 0, BigInt(0)) ?? contractData.id
  ).toString();
  const claimer = getField<string>(
    contractData,
    "claimer",
    1,
    "0x0000000000000000000000000000000000000000",
  );
  const defender = getField<string>(
    contractData,
    "defender",
    2,
    "0x0000000000000000000000000000000000000000",
  );
  const categoryRaw = getField<string>(contractData, "category", 3, "General");
  const requiredStake = getField<bigint>(
    contractData,
    "requiredStake",
    4,
    BigInt(0),
  );
  const jurorsRequired = Number(
    getField<bigint>(contractData, "jurorsRequired", 5, BigInt(3)),
  );
  const ipfsHash = getField<string>(contractData, "ipfsHash", 6, "");
  const commitsCount = Number(
    getField<bigint>(contractData, "commitsCount", 7, BigInt(0)),
  );
  const revealsCount = Number(
    getField<bigint>(contractData, "revealsCount", 8, BigInt(0)),
  );
  const status = Number(getField<number>(contractData, "status", 9, 0));
  const claimerPaid = getField<boolean>(contractData, "claimerPaid", 10, false);
  const defenderPaid = getField<boolean>(
    contractData,
    "defenderPaid",
    11,
    false,
  );
  const winnerRaw = getField<string>(
    contractData,
    "winner",
    12,
    "0x0000000000000000000000000000000000000000",
  );
  // Treat zero address as no winner
  const winner =
    winnerRaw === "0x0000000000000000000000000000000000000000"
      ? undefined
      : winnerRaw;
  const evidenceDeadline = Number(
    getField<bigint>(contractData, "evidenceDeadline", 14, BigInt(0)),
  );
  const commitDeadline = Number(
    getField<bigint>(contractData, "commitDeadline", 15, BigInt(0)),
  );
  const revealDeadline = Number(
    getField<bigint>(contractData, "revealDeadline", 16, BigInt(0)),
  );

  const now = Math.floor(Date.now() / 1000);

  // Defaults
  let title = `Dispute #${id}`;
  let description = "No description provided.";
  let defenderDescription = undefined;
  let category = categoryRaw || "General";
  let evidence: string[] = [];

  // Containers for metadata
  let audioEvidence: string | null = null;
  let carouselEvidence: string[] = [];

  // New Containers
  let defenderAudioEvidence: string | null = null;
  let defenderCarouselEvidence: string[] = [];

  let aliases = { claimer: null, defender: null };

  // Fetch IPFS Metadata (use prefetched if available)
  if (ipfsHash) {
    const meta = prefetchedMetadata ?? (await fetchJSONFromIPFS(ipfsHash));
    if (meta) {
      title = meta.title || title;
      description = meta.description || description;
      if (meta.category) category = meta.category;
      evidence = meta.evidence || [];

      // Capture extra fields
      audioEvidence = meta.audioEvidence || null;
      carouselEvidence = meta.carouselEvidence || [];

      // Map Defender Data
      defenderDescription = meta.defenderDescription;
      defenderAudioEvidence = meta.defenderAudioEvidence || null;
      defenderCarouselEvidence = meta.defenderCarouselEvidence || [];

      if (meta.aliases) aliases = meta.aliases;
    }
  }

  // Phase Logic
  let phase: DisputeUI["phase"] = "CLOSED";
  let deadline = 0;

  if (status === DISPUTE_STATUS.COMMIT) {
    phase = "VOTE";
    deadline = commitDeadline;
  } else if (status === DISPUTE_STATUS.REVEAL) {
    phase = "REVEAL";
    deadline = revealDeadline;
    if (now > deadline) phase = "WITHDRAW";
  } else if (status === DISPUTE_STATUS.RESOLVED) {
    phase = "CLOSED";
  }

  // Time Logic
  const diff = deadline - now;
  const isUrgent = diff < 86400 && diff > 0;
  const hours = Math.ceil(diff / 3600);
  
  // Deadline Label Logic - Display days if hours > 24
  let deadlineLabel = "Resolved";
  
  if (status < DISPUTE_STATUS.RESOLVED) {
    if (diff > 0) {
      if (hours > 24) {
        const days = Math.ceil(hours / 24);
        deadlineLabel = `${days}d left`;
      } else {
        deadlineLabel = `${hours}h left`;
      }
    } else {
      deadlineLabel = "Ended";
    }
  }

  return {
    id,
    title,
    category,
    status,
    phase,
    deadlineLabel,
    isUrgent,
    stake: requiredStake ? formatUnits(requiredStake, decimals) : "0",
    myStake: userStakeAmount
      ? formatUnits(userStakeAmount, decimals)
      : undefined,
    jurorsRequired,
    revealDeadline,
    evidenceDeadline,
    description,
    evidence,
    claimer,
    defender,
    winner,

    // Voting Progress Fields
    commitsCount,
    revealsCount,
    userHasRevealed,

    // Payment Status Fields
    claimerPaid,
    defenderPaid,

    // Map new fields using the aliases found in IPFS
    claimerName: aliases.claimer || claimer,
    defenderName: aliases.defender || defender,
    audioEvidence,
    carouselEvidence,
    defenderDescription,
    defenderAudioEvidence,
    defenderCarouselEvidence,
  };
}
````

## File: package.json
````json
{
  "name": "slice-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "tsc && eslint .",
    "format": "npx prettier --write ."
  },
  "dependencies": {
    "@base-org/account": "^2.5.1",
    "@base-org/account-ui": "^1.0.1",
    "@coinbase/onchainkit": "^1.1.2",
    "@ducanh2912/next-pwa": "^10.2.9",
    "@farcaster/miniapp-sdk": "^0.2.1",
    "@farcaster/miniapp-wagmi-connector": "^1.1.0",
    "@farcaster/quick-auth": "^0.0.8",
    "@privy-io/react-auth": "^3.9.1",
    "@privy-io/wagmi": "^2.1.2",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@tanstack/react-query": "^5.59.20",
    "@use-gesture/react": "^10.3.1",
    "@yudiel/react-qr-scanner": "^2.5.0",
    "axios": "^1.13.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lottie-react": "^2.4.1",
    "lucide-react": "^0.556.0",
    "motion": "^12.23.26",
    "next": "16.1.1",
    "next-themes": "^0.4.6",
    "permissionless": "^0.2.57",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-qr-code": "^2.0.18",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "viem": "^2.31.3",
    "wagmi": "^2.12.31",
    "xo-connect": "^2.1.3",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.3",
    "@eslint/js": "^9.39.2",
    "@next/eslint-plugin-next": "^16.1.3",
    "@nomicfoundation/hardhat-ignition": "^3.0.6",
    "@nomicfoundation/hardhat-toolbox-viem": "^5.0.1",
    "@tailwindcss/postcss": "^4.1.17",
    "@types/node": "^22.8.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@typescript-eslint/eslint-plugin": "^8.53.0",
    "@typescript-eslint/parser": "^8.53.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.1",
    "forge-std": "github:foundry-rs/forge-std#v1.9.4",
    "globals": "^17.0.0",
    "hardhat": "^3.1.0",
    "knip": "^5.77.2",
    "tailwindcss": "^4.1.17",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.8.3"
  },
  "ignoreScripts": [
    "sharp",
    "unrs-resolver"
  ],
  "trustedDependencies": [
    "sharp",
    "unrs-resolver"
  ]
}
````

## File: src/app/disputes/[id]/evidence/submit/page.tsx
````typescript
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWriteContract, usePublicClient } from "wagmi";
import { uploadFileToIPFS } from "@/util/ipfs";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { toast } from "sonner";
import { UploadCloud, Loader2, ArrowRight } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function SubmitEvidencePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { sliceContract } = useContracts();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Configure header
  useHeader({
    title: `Evidence #${id}`,
  });

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file");

    try {
      setIsUploading(true);
      toast.info("Uploading to IPFS...");

      const ipfsHash = await uploadFileToIPFS(file);
      if (!ipfsHash) throw new Error("IPFS Upload failed");

      toast.info("Submitting to blockchain...");

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "submitEvidence",
        args: [BigInt(id), ipfsHash],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Evidence submitted successfully!");
      router.back();
    } catch (e: unknown) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to submit evidence";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-6 flex flex-col justify-center items-center gap-6">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-[#8c8fff]" />
          </div>

          <h2 className="text-xl font-bold text-[#1b1c23] mb-2">
            Upload Evidence
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Upload images or documents to support your case. This will be
            visible to all jurors.
          </p>

          <label className="block w-full cursor-pointer">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <div
              className={`
                w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-colors
                ${file ? "border-[#8c8fff] bg-[#8c8fff]/5 text-[#8c8fff]" : "border-gray-200 hover:border-gray-300 text-gray-400"}
            `}
            >
              <span className="text-sm font-bold truncate px-4">
                {file ? file.name : "Choose File"}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleSubmit}
          disabled={isUploading || !file}
          className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Submit On-Chain <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
````

## File: src/app/disputes/page.tsx
````typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Search, Archive, Filter } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

// Search bar component for the header
const SearchBar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => (
  <div className="w-full">
    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
      <Search className="w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by ID, Title or Address..."
        className="flex-1 bg-transparent text-sm font-bold text-[#1b1c23] placeholder:text-gray-300 outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <Filter className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  </div>
);

export default function DisputesExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Configure header with search bar
  useHeader({
    title: "Protocol Archive",
    children: (
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    ),
  });

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      {/* 3. The Full List (including Resolved) */}
      <div className="px-5 pb-2 pt-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">All Disputes</h3>
        </div>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto">
        {/* TODO: You would ideally pass 'searchQuery' to DisputesList
          or filter client-side within DisputesList
        */}
        <DisputesList mode="all" />
      </div>
    </div>
  );
}
````

## File: src/config/tenant.ts
````typescript
export enum Tenant {
  PRIVY = "privy", // Privy Strategy (Default)
  FARCASTER = "farcaster", // Farcaster Mini App Strategy
  COINBASE = "coinbase", // Coinbase Wallet Strategy
  BEEXO = "beexo", // Beexo Strategy (MiniApp)
}

const PRIVY_SUBDOMAINS = ["frame.", "privy.", "app."];
const FARCASTER_SUBDOMAINS = ["base."];
const COINBASE_SUBDOMAINS = ["coinbase.", "web."];
const BEEXO_SUBDOMAINS = ["beexo.", "mini."];

export const getTenantFromHost = (host: string | null): Tenant => {
  if (!host) return Tenant.PRIVY;

  const hostname = host.split(":")[0];

  if (BEEXO_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.BEEXO;
  }

  // Use Farcaster Mini App for specific subdomains
  if (
    FARCASTER_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))
  ) {
    return Tenant.FARCASTER;
  }

  // Use Coinbase Wallet for specific subdomains
  if (COINBASE_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.COINBASE;
  }

  // Use Privy for specific subdomains
  if (PRIVY_SUBDOMAINS.some((subdomain) => hostname.startsWith(subdomain))) {
    return Tenant.PRIVY;
  }

  // Default is PRIVY
  return Tenant.PRIVY;
};
````

## File: src/hooks/core/useNativeBalance.ts
````typescript
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export function useNativeBalance() {
  const { address } = useAccount();
  
  // Fetch native coin balance (ETH on Base)
  const { data, isLoading } = useBalance({ address, query: { enabled: !!address } });

  // Threshold: is a safe buffer for Base
  const MIN_GAS_THRESHOLD = 0.00001;

  const rawBalance = data?.value ?? 0n;
  const formatted = data ? formatEther(data.value) : "0";
  const numBalance = parseFloat(formatted);

  const isLowGas = !isLoading && numBalance < MIN_GAS_THRESHOLD && numBalance > 0;
  const isZeroGas = !isLoading && numBalance === 0;

  return {
    balance: rawBalance,
    formatted: Number(formatted).toFixed(4),
    symbol: data?.symbol ?? "ETH",
    isLoading,
    isLowGas,
    isZeroGas,
  };
}
````

## File: src/app/debug/page.tsx
````typescript
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useSliceVoting } from "@/hooks/voting/useSliceVoting";
import { usePayDispute } from "@/hooks/actions/usePayDispute";
import { getVoteData } from "@/util/votingStorage";
import { useExecuteRuling } from "@/hooks/actions/useExecuteRuling";
import { usePublicClient, useAccount, useWriteContract } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { GlobalStateCard } from "@/components/debug/GlobalStateCard";
import { DisputeInspector } from "@/components/debug/DisputeInspector";
import { DebugToggle } from "@/components/debug/DebugToggle";

export default function DebugPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { sliceContract } = useContracts();

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const {
    commitVote,
    revealVote,
    isProcessing: isVoting,
    logs,
  } = useSliceVoting();
  const { payDispute, isPaying } = usePayDispute();
  const { executeRuling } = useExecuteRuling();

  // State
  const [targetId, setTargetId] = useState("1");
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [rawDisputeData, setRawDisputeData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [myPartyDisputes, setMyPartyDisputes] = useState<string[]>([]);
  const [myJurorDisputes, setMyJurorDisputes] = useState<string[]>([]);

  // --- 1. Global & Context Fetching ---
  const refreshGlobalState = useCallback(async () => {
    if (!publicClient || !address || !sliceContract) return;
    try {
      const count = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputeCount",
      })) as bigint;

      const userDisputeIds = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "getUserDisputes",
        args: [address as `0x${string}`],
      })) as bigint[];

      const jurorDisputeIds = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "getJurorDisputes",
        args: [address as `0x${string}`],
      })) as bigint[];

      setMyPartyDisputes(userDisputeIds.map((id) => id.toString()));
      setMyJurorDisputes(jurorDisputeIds.map((id) => id.toString()));
      setContractInfo({ count: count.toString() });
    } catch (e) {
      console.error(e);
      // Fail silently for smoother UX on partial loads
    }
  }, [publicClient, address, sliceContract]);

  useEffect(() => {
    refreshGlobalState();
  }, [refreshGlobalState]);

  // --- 2. Dispute Inspector Fetcher ---
  const fetchRawDispute = async () => {
    if (!publicClient || !targetId || !sliceContract) return;
    setIsLoadingData(true);
    try {
      // 1. Fetch main struct
      const d = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [BigInt(targetId)],
      })) as any;

      const statusLabels = ["Created", "Commit", "Reveal", "Executed"];
      const isClaimer = d.claimer.toLowerCase() === address?.toLowerCase();
      const isDefender = d.defender.toLowerCase() === address?.toLowerCase();

      // 2. Fetch specific mappings (Reveal status)
      let hasRevealed = false;
      try {
        if (address) {
          hasRevealed = (await publicClient.readContract({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "hasRevealed",
            args: [BigInt(targetId), address as `0x${string}`],
          })) as boolean;
        }
      } catch (e) {
        console.error("hasRevealed check failed", e);
      }

      // 3. Fetch Jurors List
      let jurors: string[] = [];
      try {
        // Attempt to fetch jurors using the standard helper
        const jurorsData = (await publicClient.readContract({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "getJurors", // Standard Slice getter
          args: [BigInt(targetId)],
        })) as string[];
        jurors = jurorsData;
      } catch (e) {
        console.warn(
          "Could not fetch jurors list (getJurors might be missing from ABI)",
          e,
        );
      }

      // 4. Format complete data object
      setRawDisputeData({
        id: targetId,
        statusIndex: Number(d.status),
        status: statusLabels[Number(d.status)] || "Unknown",
        // Parties
        claimer: d.claimer,
        defender: d.defender,
        winner:
          d.winner === "0x0000000000000000000000000000000000000000"
            ? "Pending/None"
            : d.winner,
        // Config
        category: d.category,
        jurorsRequired: d.jurorsRequired.toString(),
        requiredStake: formatUnits(d.requiredStake, 6) + " USDC",
        ipfsHash: d.ipfsHash || "None",
        // Progress (Voting)
        commitsCount: Number(d.commitsCount),
        revealsCount: Number(d.revealsCount),
        // Payment Status
        claimerPaid: d.claimerPaid,
        defenderPaid: d.defenderPaid,
        // Timelines
        payDeadline: new Date(Number(d.payDeadline) * 1000).toLocaleString(),
        evidenceDeadline: new Date(
          Number(d.evidenceDeadline) * 1000,
        ).toLocaleString(),
        commitDeadline: new Date(
          Number(d.commitDeadline) * 1000,
        ).toLocaleString(),
        revealDeadline: new Date(
          Number(d.revealDeadline) * 1000,
        ).toLocaleString(),
        // Context
        userRole: isClaimer
          ? "Claimer"
          : isDefender
            ? "Defender"
            : "None/Juror",
        hasRevealedOnChain: hasRevealed,
        jurors: jurors || [], // Pass jurors to UI
      });

      if (address && sliceContract) {
        const stored = getVoteData(sliceContract, targetId, address);
        setLocalStorageData(stored);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Dispute #${targetId} not found`);
      setRawDisputeData(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- 3. Action Handlers ---
  const handleQuickCreate = async () => {
    if (!address) return toast.error("Connect wallet");
    if (!sliceContract) return toast.error("Contract address missing");

    try {
      toast.info("Sending custom createDispute tx...");

      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "createDispute",
        account: address,
        args: [
          {
            claimer: "0x3AE66a6DB20fCC27F3DB3DE5Fe74C108A52d6F29", // Bob
            defender: "0x58609c13942F56e17d36bcB926C413EBbD10e477", // Alice
            category: "General",
            ipfsHash:
              "bafkreiamcbxmdxau7daffssq4zcpaplfg3wtfwftsmwrvl6rhcesugirvi",
            jurorsRequired: BigInt(1),
            paySeconds: BigInt(86400),
            evidenceSeconds: BigInt(86400),
            commitSeconds: BigInt(86400),
            revealSeconds: BigInt(86400),
          },
        ],
      });

      toast.success("Transaction sent!");

      if (publicClient) {
        toast.info("Waiting for confirmation...");
        await publicClient.waitForTransactionReceipt({ hash });
        toast.success("Dispute created successfully!");
        refreshGlobalState();
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Create failed: ${e.shortMessage || e.message}`);
    }
  };

  const handleJoin = async () => {
    toast.info(
      "Please use the main UI to join (Code migrated to useAssignDispute)",
    );
  };

  const handleExecute = async () => {
    const success = await executeRuling(targetId);
    
    if (success) {
      // Propagation delay is already here (2000ms)
      setTimeout(() => {
        fetchRawDispute();
        refreshGlobalState();
      }, 2000);
    }
  };

  const handleSelectId = (id: string) => {
    setTargetId(id);
    setTimeout(() => {
      const btn = document.getElementById("btn-fetch");
      if (btn) btn.click();
    }, 100);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 font-manrope">
      <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
        <GlobalStateCard
          contractInfo={contractInfo}
          isCreating={isWriting}
          onCreate={handleQuickCreate}
          myPartyDisputes={myPartyDisputes}
          myJurorDisputes={myJurorDisputes}
          targetId={targetId}
          onSelectId={handleSelectId}
        />

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-[18px] border border-gray-100 shadow-sm flex items-center gap-2 sticky top-[80px] z-10">
          <div className="pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="number"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Enter Dispute ID..."
            className="flex-1 p-2 outline-none text-[#1b1c23] font-bold bg-transparent font-mono"
          />
          <button
            id="btn-fetch"
            onClick={fetchRawDispute}
            disabled={isLoadingData}
            className="bg-[#f5f6f9] text-[#1b1c23] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors min-w-[80px]"
          >
            {isLoadingData ? "..." : "Fetch"}
          </button>
        </div>

        <DisputeInspector
          data={rawDisputeData}
          localStorageData={localStorageData}
          onJoin={handleJoin}
          onPay={() =>
            payDispute(targetId, "1.0").then(() => fetchRawDispute())
          }
          onVote={(val) => commitVote(targetId, val)}
          onReveal={() => revealVote(targetId)}
          onExecute={handleExecute}
          isPaying={isPaying}
          isVoting={isVoting}
          logs={logs}
        />
      </div>

      {/* Bottom Right toggle*/}
      <DebugToggle />
    </div>
  );
}
````

## File: src/app/disputes/[id]/file/page.tsx
````typescript
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2 } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function CaseFilePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { dispute, loading } = useGetDispute(id);

  // Configure header
  useHeader({
    title: `Case #${id}`,
  });

  if (loading || !dispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <CaseFileView dispute={dispute} />
      </div>
    </div>
  );
}
````

## File: src/app/globals.css
````css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
}

:root {
    --radius: 0.625rem;
    --background: oklch(0.985 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }
    body {
        @apply bg-background text-foreground;
    }
}

/* Generic replacements for Stellar components */
:root {
    --primary: #1b1c23;
    --secondary: #8c8fff;
    --bg-color: #f6f7f9;
    --border-radius: 8px;
}

.btn {
    padding: 10px 16px;
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
}
.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.btn-primary {
    background: var(--primary);
    color: white;
}
.btn-secondary {
    background: var(--secondary);
    color: white;
}

.input-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: var(--border-radius);
    margin-top: 5px;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
}

.text-lg {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
}
.text-sm {
    font-size: 0.875rem;
    color: #666;
}
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import React from "react";
import ContextProvider from "./providers";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { AppShell } from "@/components/layout/AppShell";
import { getTenantFromHost, Tenant } from "@/config/tenant";
import { privyConfig } from "@/config/adapters/privy";
import { beexoConfig } from "@/config/adapters/beexo";
import { coinbaseConfig } from "@/config/adapters/coinbase";
import { farcasterConfig } from "@/config/adapters/farcaster";
import { cookieToInitialState } from "wagmi";

export const metadata: Metadata = {
  title: "Slice",
  description: "Get paid for doing justice",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/slice-logo-light.svg",
    apple: "/icons/icon.png",
  },
  other: {
    "base:app_id": "6966f2640c770beef0486121",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Resolve Tenant
  const headersList = await headers();
  const host = headersList.get("host");
  const tenant = getTenantFromHost(host);

  // 2. Select config based on tenant
  let config;
  switch (tenant) {
    case Tenant.PRIVY:
      config = privyConfig;
      break;
    case Tenant.BEEXO:
      config = beexoConfig;
      break;
    case Tenant.FARCASTER:
      config = farcasterConfig;
      break;
    case Tenant.COINBASE:
      config = coinbaseConfig;
      break;
    default:
      config = privyConfig;
      break;
  }

  // 3. Hydrate State
  const cookies = headersList.get("cookie");
  const initialState = cookieToInitialState(config, cookies);

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center min-h-screen bg-background text-foreground`}
      >
        {/* Pass tenant so Client Components know which Strategy to load */}
        <ContextProvider tenant={tenant} initialState={initialState}>
          <AppShell>{children}</AppShell>
        </ContextProvider>
      </body>
    </html>
  );
}
````

## File: src/app/page.tsx
````typescript
"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { BalanceCard } from "@/components/disputes/BalanceCard";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Scale, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DisputesPage() {
  const router = useRouter();
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header is now handled by AppShell via TopNavigation */}

      <div className="px-5">
        <BalanceCard />
      </div>

      {/* Section Header */}
      <div className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">
            Explore Disputes
          </h3>
        </div>
      </div>

      {/* Public Disputes Feed */}
      <DisputesList mode="all" />
      <button
        onClick={() => router.push("/juror/stake")}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 group"
      >
        <div
          className="
          relative flex items-center gap-3 px-6 py-3.5
          bg-[#8c8fff] rounded-full
          border border-[#7a7de6]
          shadow-[0_10px_40px_-10px_rgba(27,28,35,0.4)]
          hover:shadow-[0_20px_40px_-10px_rgba(140,143,255,0.3)]
          hover:-translate-y-1 active:scale-95
          transition-all duration-300 ease-out
        "
        >
          {/* Animated Gradient Background Effect (Optional subtle shine) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          {/* Icon - Switched to Brand Purple or Money Green based on preference */}
          <Sparkles className="w-4 h-4 text-white fill-white/20" />

          {/* Text - Single Line, Bold, Clean */}
          <span className="text-white font-manrope font-semibold tracking-wide pr-1">
            Start Earning
          </span>
        </div>
      </button>
    </div>
  );
}
````

## File: src/hooks/actions/useAssignDispute.ts
````typescript
import { useState } from "react";
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import { erc20Abi, parseUnits, parseEventLogs } from "viem";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";
import { toast } from "sonner";
import { useStakingToken } from "../core/useStakingToken";

export function useAssignDispute() {
  const [isDrawing, setIsDrawing] = useState(false);
  const {
    address: stakingToken,
    decimals,
    symbol,
    isLoading: isTokenLoading,
  } = useStakingToken();
  const { address } = useAccount();
  const chainId = useChainId();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { sliceContract } = getContractsForChain(chainId);

  // New "Draw" Logic - Replaces findActiveDispute + joinDispute
  const drawDispute = async (amount: string): Promise<number | null> => {
    if (!address || !publicClient || !sliceContract) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      setIsDrawing(true);
      const amountToStake = parseUnits(amount, decimals);

      console.log(`[Draft] Staking: ${amount} ${symbol} (${amountToStake})`);

      // 1. Check & Approve Allowance
      const getAllowance = async () => {
        return await publicClient.readContract({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, sliceContract],
        });
      };

      let allowance = await getAllowance();

      if (allowance < amountToStake) {
        toast.info("Approving Stake...");
        const approveHash = await writeContractAsync({
          address: stakingToken,
          abi: erc20Abi,
          functionName: "approve",
          args: [sliceContract, amountToStake],
        });

        // Wait for the transaction to be mined
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // --- Race Condition Protection ---
        // With auto-signing wallets, the next tx simulation happens so fast
        // that the RPC node might still report the old allowance.
        // We poll until the node actually confirms the new allowance.
        let retries = 0;
        while (allowance < amountToStake && retries < 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
          allowance = await getAllowance();
          retries++;
        }

        if (allowance < amountToStake) {
          // Safety fallback if RPC is extremely laggy
          toast.warning("Network lagging. Waiting for approval sync...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          toast.success("Approval confirmed.");
        }
      }

      // 2. Execute Draw
      // Now safe to simulate because we verified the node sees the allowance
      toast.info("Entering the Draft Pool...");
      const hash = await writeContractAsync({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "drawDispute",
        args: [amountToStake],
      });

      toast.info("Drafting in progress...");

      // 3. Wait for Receipt & Parse Logs
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Parse the 'JurorJoined' event to find which ID we got
      const logs = parseEventLogs({
        abi: SLICE_ABI,
        eventName: "JurorJoined",
        logs: receipt.logs,
      });

      if (logs.length > 0) {
        // The event args: { id, juror }
        const assignedId = Number(logs[0].args.id);
        toast.success(`Drafted into Dispute #${assignedId}!`);
        return assignedId;
      } else {
        // Fallback if event isn't found (rare)
        toast.warning(
          "Draft complete, but could not detect ID. Check your profile.",
        );
        return null;
      }
    } catch (error: unknown) {
      console.error("Draft failed", error);
      const err = error as { shortMessage?: string; message?: string };
      const msg = err.shortMessage || err.message || "Unknown error";
      toast.error(`Draft failed: ${msg}`);
      return null;
    } finally {
      setIsDrawing(false);
    }
  };

  return {
    drawDispute,
    isLoading: isDrawing,
    // Only ready when wallet is connected AND staking token metadata is loaded
    isReady: !!address && !isTokenLoading && !!stakingToken,
  };
}
````

## File: src/app/disputes/create/page.tsx
````typescript
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  UploadCloud,
  User,
  Gavel,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { useCreateDisputeForm } from "@/hooks/forms/useCreateDisputeForm";
import { Button } from "@/components/ui/button";
import { useHeader } from "@/lib/hooks/useHeader";

// Direct imports instead of barrel file (better tree-shaking)
import { WizardProgress } from "@/components/create/WizardProgress";
import { StepBasics } from "@/components/create/StepBasics";
import { StepParties } from "@/components/create/StepParties";
import { StepEvidence } from "@/components/create/StepEvidence";
import { StepReview } from "@/components/create/StepReview";
import type { StepDefinition } from "@/components/create/index";

// --- STEPS DEFINITION ---
const STEPS: StepDefinition[] = [
  { id: 1, title: "Protocol Settings", icon: <Gavel className="w-4 h-4" /> },
  { id: 2, title: "The Parties", icon: <User className="w-4 h-4" /> },
  { id: 3, title: "Evidence", icon: <UploadCloud className="w-4 h-4" /> },
  { id: 4, title: "Review", icon: <ShieldAlert className="w-4 h-4" /> },
];

export default function CreateDisputePage() {
  const router = useRouter();

  // --- CUSTOM HOOK ---
  const {
    formData,
    updateField,
    files,
    setFiles,
    submit,
    isProcessing
  } = useCreateDisputeForm();

  // --- WIZARD STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [showDefenderOptions, setShowDefenderOptions] = useState(false);

  // --- HANDLERS ---
  const handleNext = () => {
    // Basic Validation per step
    if (currentStep === 1 && !formData.title)
      return toast.error("Title is required");
    if (currentStep === 2 && !formData.defenderAddress)
      return toast.error("Defender address is required");
    if (currentStep === 3 && !formData.description)
      return toast.error("Description is required");

    if (currentStep < 4) setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
    else router.back();
  };

  // Configure header with progress indicator
  useHeader({
    title: "Create Dispute",
    children: <WizardProgress currentStep={currentStep} totalSteps={STEPS.length} />,
  });

  // --- RENDER CURRENT STEP ---
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics data={formData} updateField={updateField} />;
      case 2:
        return <StepParties data={formData} updateField={updateField} />;
      case 3:
        return (
          <StepEvidence
            data={formData}
            updateField={updateField}
            files={files}
            setFiles={setFiles}
          />
        );
      case 4:
        return (
          <StepReview
            data={formData}
            updateField={updateField}
            files={files}
            setFiles={setFiles}
            showDefenderOptions={showDefenderOptions}
            setShowDefenderOptions={setShowDefenderOptions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl font-extrabold text-[#1b1c23] tracking-tight">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {renderStep()}
      </div>

      {/* --- FLOATING FOOTER --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-30">
        <Button
          onClick={currentStep === 4 ? submit : handleNext}
          disabled={isProcessing}
          className={`
            w-full py-6 rounded-2xl font-manrope font-bold text-base shadow-xl
            flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]
            ${isProcessing ? "bg-gray-200 text-gray-400" : "bg-[#1b1c23] text-white"}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : currentStep === 4 ? (
            <>
              Create Dispute <CheckCircle2 className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
````

## File: src/app/juror/assign/page.tsx
````typescript
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/actions/useAssignDispute";
import { Shuffle, Loader2, AlertCircle, Scale } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

import { usePublicClient, useChainId } from "wagmi";
import { SLICE_ABI, getContractsForChain } from "@/config/contracts";

export default function JurorAssignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "50";

  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { sliceContract } = getContractsForChain(chainId);

  const { drawDispute, isLoading: isTxLoading, isReady } = useAssignDispute();

  // Configure header (minimal)
  useHeader({
    title: undefined,
  });

  // State
  const [hasDrafted, setHasDrafted] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const [noDisputesAvailable, setNoDisputesAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const initialized = useRef(false);

  // Auto-trigger: Check Queue -> Then Draft
  useEffect(() => {
    if (
      !isReady ||
      !publicClient ||
      !sliceContract ||
      initialized.current ||
      hasDrafted
    )
      return;

    const executeDraftFlow = async () => {
      initialized.current = true;
      setDraftFailed(false);
      setNoDisputesAvailable(false);
      setIsChecking(true);

      try {
        // 1. PRE-CHECK: Are there any disputes in the queue?
        // We try to read the first item in the queue. If it reverts, the queue is empty.
        try {
          await publicClient.readContract({
            address: sliceContract,
            abi: SLICE_ABI,
            functionName: "openDisputeIds",
            args: [0n], // Try to read index 0
          });
        } catch (_e) {
          // If reading index 0 fails, the array is empty
          console.warn("Queue appears empty, aborting draft.");
          setNoDisputesAvailable(true);
          setIsChecking(false);
          return;
        }

        // 2. EXECUTE DRAFT: If we passed the check, try to join
        const disputeId = await drawDispute(amount);

        if (disputeId) {
          setHasDrafted(true);
          router.replace(`/juror/assigned/${disputeId}`);
        } else {
          // If drawDispute returns null, it failed (user rejection or race condition)
          setDraftFailed(true);
          initialized.current = false; // Allow retry
        }
      } catch (err) {
        console.error("[JurorAssign] Unexpected error:", err);
        setDraftFailed(true);
        initialized.current = false;
      } finally {
        setIsChecking(false);
      }
    };

    executeDraftFlow();
  }, [
    isReady,
    drawDispute,
    amount,
    router,
    hasDrafted,
    publicClient,
    sliceContract,
  ]);

  const handleRetry = () => {
    setDraftFailed(false);
    setNoDisputesAvailable(false);
    initialized.current = false;
  };

  // Combined loading state
  const isBusy = isChecking || isTxLoading;

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-4">
        {/* SCENARIO 1: NO DISPUTES AVAILABLE */}
        {noDisputesAvailable ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-2">
              <Scale className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              No Cases Available
            </h2>
            <p className="text-gray-500 max-w-70">
              The dispute queue is currently empty. There are no active cases
              waiting for jurors right now.
            </p>
            <button
              onClick={() => router.push("/")} // Go back to dashboard
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </button>
            <button
              onClick={handleRetry}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Check Again
            </button>
          </div>
        ) : /* SCENARIO 2: GENERIC TRANSACTION FAILURE */
        draftFailed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              Draft Unsuccessful
            </h2>
            <p className="text-gray-500 max-w-65">
              We couldn&apos;t assign you to a dispute. The transaction may have
              been rejected or failed.
            </p>
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : /* SCENARIO 3: LOADING / DRAFTING */
        isBusy || !hasDrafted ? (
          <>
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/10 animate-[spin_3s_linear_infinite]" />
              <Shuffle className="w-10 h-10 text-indigo-600 animate-pulse relative z-10" />
            </div>
            <h2 className="text-xl font-bold text-[#1b1c23]">
              {isReady
                ? "Entering the Jury Pool..."
                : "Connecting to Network..."}
            </h2>
            <p className="text-gray-500 px-8 max-w-75">
              {isReady ? (
                <>
                  We are looking for open cases matching your stake of{" "}
                  <b>{amount} USDC</b>.
                </>
              ) : (
                "Establishing secure connection to the protocol..."
              )}
            </p>
          </>
        ) : (
          /* SCENARIO 4: SUCCESS REDIRECT STUB */
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        )}
      </div>
    </div>
  );
}
````

## File: src/app/juror/assigned/[id]/page.tsx
````typescript
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import {
  Loader2,
  ShieldCheck,
  ArrowRight,
  Target,
  Coins,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorAssignedPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = Number(params?.id);

  // Fetch dispute details
  const { dispute, loading: isLoadingDispute } = useGetDispute(
    disputeId.toString(),
  );

  // Configure header (minimal)
  useHeader({
    title: undefined,
  });

  // Prefer myStake (user specific) over stake (generic requirement)
  const stakeDisplay = React.useMemo(() => {
    return dispute?.myStake || dispute?.stake || null;
  }, [dispute]);

  if (isLoadingDispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8c8fff]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* --- Ambient Background Glow (Purple) --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="min-h-full flex flex-col items-center justify-center p-6 pb-20">
          {/* Main Card */}
          <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-gray-200 relative">
            {/* Status Badge - Now shows "Drafted" */}
            <div className="absolute top-6 right-6">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-green-100">
                <CheckCircle2 className="w-3 h-3" />
                Drafted
              </span>
            </div>

            {/* Hero Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative group">
                <div className="absolute inset-0 border border-[#8c8fff]/20 rounded-full scale-100 group-hover:scale-110 transition-transform duration-500" />
                <div className="w-20 h-20 bg-[#8c8fff] rounded-full flex items-center justify-center shadow-lg shadow-[#8c8fff]/30">
                  <Scale className="w-10 h-10 text-white" />
                </div>

                {/* Floating Checkmark Badge */}
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm">
                  <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-manrope font-extrabold text-[#1b1c23] mb-2 tracking-tight">
                You have been drafted!
              </h2>
              <p className="text-base text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto">
                You are now a juror for{" "}
                <span className="text-[#1b1c23] font-bold">
                  Dispute #{disputeId}
                </span>
                .
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {/* Category Box */}
              <div className="bg-[#F8F9FC] border border-gray-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#8c8fff]/30 transition-colors">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Target className="w-3 h-3" /> Area
                </span>
                <span className="text-sm font-bold text-gray-800 text-center">
                  {dispute?.category || "General"}
                </span>
              </div>

              {/* Role Box */}
              <div className="bg-[#F8F9FC] border border-gray-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#8c8fff]/30 transition-colors">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Role
                </span>
                <span className="text-sm font-bold text-gray-800">Juror</span>
              </div>
            </div>

            {/* Stake Section - Confirmation of what was staked */}
            <div className="border-t border-dashed border-gray-200 pt-6 mb-8 text-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-2">
                <Coins className="w-3.5 h-3.5" /> Your Stake
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl font-manrope font-black text-[#8c8fff] tracking-tighter drop-shadow-sm">
                  {stakeDisplay || "0"}
                </span>
                <span className="text-xl font-bold text-gray-600">USDC</span>
              </div>
            </div>

            {/* Action Button - Now just navigates to the case file */}
            <button
              onClick={() => router.push(`/disputes/${disputeId}`)}
              className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base tracking-wide hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
            >
              Open Case File
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Footer */}
          <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Secured by Slice Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: src/app/manage/page.tsx
````typescript
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useMyDisputes } from "@/hooks/disputes/useMyDisputes";
import {
  Plus,
  Loader2,
  FileText,
  Coins,
  Gavel,
  Briefcase,
  UploadCloud,
} from "lucide-react";
import { DisputeUI } from "@/util/disputeAdapter";
import { useHeader } from "@/lib/hooks/useHeader";

export default function DisputeManagerPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { disputes, isLoading } = useMyDisputes();

  // Configure header
  useHeader({
    title: "Dispute Manager",
  });

  // Filter: Only show disputes where I am Claimer or Defender
  const myCases = useMemo(() => {
    if (!address) return [];
    return disputes.filter(
      (d) =>
        d.claimer.toLowerCase() === address.toLowerCase() ||
        d.defender.toLowerCase() === address.toLowerCase(),
    );
  }, [disputes, address]);

  const handleCreate = () => router.push("/disputes/create");

  return (
    <div className="flex flex-col flex-1 font-manrope relative">
      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8c8fff]" />
        </div>
      ) : myCases.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">No Cases Found</h3>
          <p className="text-gray-600 max-w-50">
            You haven&apos;t created or been added to any disputes yet.
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 px-6 py-3 bg-[#1b1c23] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            Create your first case
          </button>
        </div>
      ) : (
        <div className="flex-1 px-6 pb-4 flex flex-col">
          {/* Intro */}
          <div className="flex items-center justify-between mb-6 shrink-0 pt-4">
            <div>
              <h1 className="text-2xl font-black text-[#1b1c23]">My Cases</h1>
              <p className="text-sm text-gray-400 font-medium">
                Manage your active disputes
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="w-12 h-12 rounded-full bg-[#1b1c23] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {myCases.map((dispute) => (
              <ManagerCaseCard
                key={dispute.id}
                dispute={dispute}
                address={address}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual case logic
const ManagerCaseCard = ({
  dispute,
  address,
}: {
  dispute: DisputeUI;
  address?: string;
}) => {
  const router = useRouter();

  // Store 'now' in state to ensure purity during render
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Determine Role
  const isClaimer = dispute.claimer.toLowerCase() === address?.toLowerCase();
  const roleLabel = isClaimer ? "Claimer" : "Defender";

  // Determine Action
  let ActionBtn = null;

  // 1. Unpaid -> Pay
  if (dispute.status === 0) {
    const iPaid = isClaimer ? dispute.claimerPaid : dispute.defenderPaid;
    if (!iPaid) {
      ActionBtn = (
        <button
          onClick={() => router.push(`/disputes/${dispute.id}/pay`)}
          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Coins className="w-3.5 h-3.5" /> Pay Stake ({dispute.stake} USDC)
        </button>
      );
    } else {
      ActionBtn = (
        <div className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for Opponent
        </div>
      );
    }
  }
  // 2. Active -> Evidence
  // Assuming status 1 (Commit) allows evidence. Check your contract logic.
  // Usually evidence is allowed until 'evidenceDeadline'.
  else if (dispute.status === 1 || dispute.status === 2) {
    // FIX: Use the state-based 'now' instead of calling Date.now() directly
    const canSubmit =
      now > 0 && now / 1000 < (dispute.evidenceDeadline || Infinity);

    if (canSubmit) {
      ActionBtn = (
        <button
          onClick={() => router.push(`/disputes/${dispute.id}/evidence/submit`)}
          className="w-full py-3 bg-[#1b1c23] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <UploadCloud className="w-3.5 h-3.5" /> Submit Additional Evidence
        </button>
      );
    }
  }
  // 3. Finished -> Execute
  else if (dispute.status === 3 && dispute.phase === "CLOSED") {
    ActionBtn = (
      <button
        onClick={() => router.push(`/disputes/${dispute.id}/execute`)}
        className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
      >
        <Gavel className="w-3.5 h-3.5" /> Execute Ruling
      </button>
    );
  }

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold">
              #{dispute.id}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">
              {roleLabel}
            </span>
          </div>
          <h3 className="font-bold text-[#1b1c23] line-clamp-1">
            {dispute.title}
          </h3>
        </div>
        <button onClick={() => router.push(`/disputes/${dispute.id}`)}>
          <FileText className="w-5 h-5 text-gray-300 hover:text-[#8c8fff]" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
        <div
          className={`w-2 h-2 rounded-full ${dispute.status === 3 ? "bg-emerald-500" : "bg-[#8c8fff]"}`}
        />
        Status: {dispute.phase}
      </div>

      {ActionBtn}
    </div>
  );
};
````

## File: src/app/disputes/[id]/review/page.tsx
````typescript
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { CaseFileView } from "@/components/dispute/CaseFileView";
import { Loader2, ArrowRight, Gavel } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { dispute, loading } = useGetDispute(id);

  // Configure header
  useHeader({
    title: "Review Evidence",
  });

  if (loading || !dispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* 2. Main Content (The Reusable Component) */}
      <div className="flex-1 overflow-hidden">
        <CaseFileView dispute={dispute} defaultTab="claimant" />
      </div>

      {/* 3. Action Footer */}
      <div className="shrink-0 p-6 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
          <button
            onClick={() => router.push(`/disputes/${id}/vote`)}
            className="group w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Gavel className="w-5 h-5 fill-white/50" />
            Proceed to Vote
            <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/app/disputes/[id]/pay/page.tsx
````typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { User, Coins } from "lucide-react";

import { SwipeButton } from "@/components/SwipeButton";
import { usePayDispute } from "@/hooks/actions/usePayDispute";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useHeader } from "@/lib/hooks/useHeader";

export default function PayDisputePage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { payDispute, isPaying } = usePayDispute();
  const { dispute, refetch } = useGetDispute(disputeId);
  const { address } = useAccount();

  // Derive stakeAmountDisplay directly from dispute
  const stakeAmountDisplay = dispute?.stake || "Loading...";

  // Configure header
  useHeader({
    title: `Fund #${disputeId}`,
  });

  useEffect(() => {
    if (dispute && dispute.status > 0) {
      // Check Status: If status > 0 (Created), payment is already done
      router.replace("/profile");
    }
  }, [dispute, router]);

  const handleSwipeComplete = async () => {
    if (!dispute) return;
    const success = await payDispute(disputeId, stakeAmountDisplay);

    if (success) {
      // Add propagation delay to allow RPC indexing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      refetch(); // Refresh local state
      router.refresh(); // Refresh the page data
      router.push("/profile");
    }
  };

  // Helper to determine role
  const userRole =
    dispute?.claimer?.toLowerCase() === address?.toLowerCase()
      ? "Claimer"
      : dispute?.defender?.toLowerCase() === address?.toLowerCase()
        ? "Defender"
        : "Observer";

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden font-manrope">
      {/* --- Ambient Background Glow --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-4 z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-white relative text-center">
          {/* Hero Animation */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#8c8fff]/10 rounded-full blur-xl scale-75" />
              <video
                src="/animations/money.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover relative z-10 scale-90"
              />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 tracking-tight">
            Fund Dispute #{disputeId}
          </h1>

          {/* Details Box */}
          <div className="bg-[#F8F9FC] rounded-2xl p-5 w-full mb-6 border border-gray-100/50">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Your Role
              </span>
              <span className="text-sm text-[#1b1c23] font-bold">
                {userRole}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Required Stake
              </span>
              <span className="text-lg text-[#8c8fff] font-black">
                {stakeAmountDisplay} USDC
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[260px] mx-auto">
            Both parties must deposit the required stake for the dispute to
            proceed to the voting phase.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action Area */}
      <div className="shrink-0 z-20 flex flex-col items-center gap-2 pb-8 pt-6 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent">
        {/* Swipe Button */}
        <div className="mt-2">
          {isPaying ? (
            <div className="w-[192px] h-10 bg-[#1b1c23] text-white rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <SwipeButton onSwipeComplete={() => void handleSwipeComplete()}>
              Fund {stakeAmountDisplay} USDC
            </SwipeButton>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: src/app/disputes/[id]/reveal/page.tsx
````typescript
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Clock, Lock, Gavel, CheckCircle2 } from "lucide-react";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { DisputeCandidateCard } from "@/components/disputes/DisputeCandidateCard";
import { useReveal } from "@/hooks/voting/useReveal";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { useDisputeParties } from "@/hooks/disputes/useDisputeParties";
import { useHeader } from "@/lib/hooks/useHeader";
import { SwipeButton } from "@/components/SwipeButton";

export default function RevealPage() {
  const router = useRouter();
  const { id: disputeId } = useParams() as { id: string };
  const [showSuccess, setShowSuccess] = useState(false);

  // Hook handles logic & state
  const { dispute, localVote, status, revealVote, isProcessing, logs } =
    useReveal(disputeId || "1");

  const parties = useDisputeParties(dispute);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () => router.push(`/disputes/${disputeId}/vote`),
  });

  // Configure header
  useHeader({
    title: "Reveal Vote",
  });

  const handleRevealClick = async () => {
    if (await revealVote()) {
      setShowSuccess(true);
      // Refresh the page data to reflect the new on-chain state
      router.refresh();
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.push("/juror/tasks");
  };

  // Helper to get the party we voted for
  const votedParty = localVote === 1 ? parties.claimer : parties.defender;

  return (
    <div className="flex flex-col flex-1 relative" {...bindSwipe()}>
      {/* 2. Content Area */}
      <div className="flex-1 flex flex-col px-6 scrollbar-hide relative z-0">
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-6 pt-4">
          {/* STATE 1: TOO EARLY (Locked) */}
          {status.isTooEarly && (
            <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center relative border border-gray-200 shadow-inner">
                <Clock className="w-10 h-10 text-gray-400" />
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#1b1c23] rounded-full flex items-center justify-center border-[4px] border-[#F8F9FC] shadow-lg">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1b1c23] tracking-tight">
                  Reveal Locked
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-[260px] mx-auto leading-relaxed">
                  The court is still voting. You can confirm your decision once
                  the commit phase ends.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: REVEAL OPEN (Actionable) */}
          {status.isRevealOpen && (
            <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4">
              {/* Title Section */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#1b1c23] leading-tight tracking-tight">
                  Confirm Vote
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-2">
                  Reveal your secret vote to the chain.
                </p>
              </div>

              {/* The "Chosen One" Card */}
              <div className="relative pt-3">
                <div className="transform transition-all duration-500 hover:scale-[1.02]">
                  <DisputeCandidateCard
                    type="reveal"
                    partyInfo={votedParty}
                    isSelected={true}
                    className="w-full h-32 border-[#1b1c23] ring-1 ring-[#1b1c23]/10 shadow-xl"
                  />

                  {/* Added z-20 to ensure it sits ON TOP of the card (which is z-10) */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b1c23] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-20 border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-[#8c8fff]" />
                    Your Choice
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8c8fff] animate-pulse bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mx-auto w-fit shadow-sm border border-[#8c8fff]/20">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{logs || "SECURING ON-CHAIN..."}</span>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: FINISHED (Post-Reveal) */}
          {status.isFinished && (
            <div className="flex flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-200">
                <Gavel className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#1b1c23] tracking-tight">
                  Dispute Closed
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto">
                  The ruling has been executed. Check your portfolio for
                  results.
                </p>
              </div>
              <button
                onClick={() => router.push(`/disputes/${disputeId}`)}
                className="mt-4 px-8 py-3.5 bg-white border border-gray-200 text-[#1b1c23] rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95"
              >
                Return to Overview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Action */}
      {status.isRevealOpen && (
        <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
          <div className="w-full max-w-sm">
            <SwipeButton
              onSwipeComplete={() => void handleRevealClick()}
              isLoading={isProcessing}
            >
              SWIPE TO REVEAL
            </SwipeButton>
          </div>
        </div>
      )}

      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
}
````

## File: src/app/juror/stake/page.tsx
````typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectAmount } from "@/components/SelectAmount";
import { SwipeButton } from "@/components/SwipeButton";
import { AlertCircle } from "lucide-react";
import { FinancialProjection } from "@/components/juror/FinancialProjection";
import { useHeader } from "@/lib/hooks/useHeader";

export default function JurorStakePage() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number>(5);

  // Configure header (no title for minimal look)
  useHeader({
    title: undefined,
  });

  const handleSwipeComplete = () => {
    router.push(`/juror/assign?amount=${selectedAmount.toString()}`);
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4 overflow-y-auto">
        {/* SINGLE UNIFIED CARD */}
        <div className="w-full bg-white rounded-4xl p-6 shadow-[0px_20px_40px_-10px_rgba(27,28,35,0.05)] border border-gray-200 relative overflow-hidden">
          {/* Ambient Background Glow (Justice Purple) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-75 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#8c8fff]/10 via-transparent to-transparent pointer-events-none opacity-60" />

          {/* 1. Header & Animation */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Animation Container */}
            <div className="w-20 h-20 my-2 relative">
              <div className="absolute inset-0 bg-[#8c8fff]/20 rounded-full blur-2xl scale-75" />
              <video
                src="/animations/money.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain relative z-10"
              />
            </div>

            <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 font-manrope tracking-tight">
              Choose your stake
            </h1>

            <p className="text-gray-600 font-medium mb-8 max-w-65 text-center leading-relaxed">
              Higher stakes unlock higher-value disputes.
            </p>

            {/* SLIDER SECTION */}
            {/* Added px-4 here to ensure the labels ($1 / $20) don't get cut off by the card edges */}
            <div className="w-full px-2 sm:px-4">
              <SelectAmount
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>
          </div>

          {/* 2. Financial Metrics (Integrated Block) */}
          <FinancialProjection stakeAmount={selectedAmount} />

          {/* 3. Risk Warning (Integrated Footer) */}
          <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
            <div className="flex gap-3 items-start">
              <div className="shrink-0 mt-0.5 text-gray-300">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
                <span className="text-[#1b1c23] font-bold">Risk Warning:</span>{" "}
                Staked funds are locked during the dispute. Incoherent votes
                result in slashing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="px-5 pb-8 pt-2 flex justify-center shrink-0 z-20">
        <SwipeButton onSwipeComplete={handleSwipeComplete}>
          <span className="font-bold ">Join Jury</span>
        </SwipeButton>
      </div>
    </div>
  );
}
````

## File: src/app/profile/page.tsx
````typescript
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { User, Users, Settings, Loader2 } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";
import { cn } from "@/lib/utils";

// Loading skeleton for tab content
const TabLoadingSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
  </div>
);

// Dynamic imports for tab content (only load when tab is active)
const ProfileOverview = dynamic(
  () =>
    import("@/components/profile/ProfileOverview").then((m) => ({
      default: m.ProfileOverview,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

const ContactsView = dynamic(
  () =>
    import("@/components/profile/ContactsView").then((m) => ({
      default: m.ContactsView,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

const SettingsView = dynamic(
  () =>
    import("@/components/profile/SettingsView").then((m) => ({
      default: m.SettingsView,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

type TabValue = "overview" | "contacts" | "settings";

// Custom tab button component (no Radix context needed)
const TabButton = ({
  value,
  activeTab,
  onSelect,
  icon: Icon,
  label,
}: {
  value: TabValue;
  activeTab: TabValue;
  onSelect: (value: TabValue) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <button
    onClick={() => onSelect(value)}
    className={cn(
      "flex-1 gap-2 rounded-xl py-3 flex items-center justify-center transition-all font-bold text-xs",
      activeTab === value
        ? "bg-[#1b1c23] text-white shadow-md"
        : "text-gray-500 hover:text-gray-700",
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// Tab navigation pills component for the header (controlled via props)
const ProfileTabsList = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (value: TabValue) => void;
}) => (
  <div className="w-full bg-white h-auto p-1 rounded-2xl border border-gray-200 shadow-sm flex">
    <TabButton
      value="overview"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={User}
      label="Overview"
    />
    <TabButton
      value="contacts"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={Users}
      label="Contacts"
    />
    <TabButton
      value="settings"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={Settings}
      label="Settings"
    />
  </div>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // Configure the header via the hook
  useHeader({
    title: "My Profile",
    showBack: true,
    children: (
      <ProfileTabsList activeTab={activeTab} onTabChange={setActiveTab} />
    ),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ProfileOverview />
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ContactsView />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SettingsView />
          </div>
        )}
      </div>
    </div>
  );
}
````

## File: src/app/disputes/[id]/vote/page.tsx
````typescript
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw, Home, Eye, ArrowRight, Lock } from "lucide-react";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { DisputeCandidateCard } from "@/components/disputes/DisputeCandidateCard";
import { VsBadge } from "@/components/disputes/VsBadge";
import { useVote } from "@/hooks/voting/useVote";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { useDisputeParties } from "@/hooks/disputes/useDisputeParties";
import { useHeader } from "@/lib/hooks/useHeader";
import { SwipeButton } from "@/components/SwipeButton";

export default function VotePage() {
  const router = useRouter();
  const { id: disputeId } = useParams() as { id: string };
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    dispute,
    selectedVote,
    hasCommittedLocally,
    isRefreshing,
    isProcessing,
    isCommitDisabled,
    isRevealDisabled,
    handleVoteSelect,
    handleCommit,
    handleRefresh,
  } = useVote(disputeId || "1");

  const parties = useDisputeParties(dispute);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () =>
      router.push(`/disputes/${disputeId}/evidence/defendant`),
  });

  // Configure header
  useHeader({
    title: "Cast Vote",
  });

  const onCommitClick = async () => {
    const success = await handleCommit();
    if (success) {
      // Refresh the page data to reflect the new on-chain state
      router.refresh();
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.push("/disputes");
  };

  return (
    <div className="flex flex-col flex-1 relative" {...bindSwipe()}>
      {/* 2. Content */}
      <div className="flex-1 flex flex-col px-6 scrollbar-hide relative z-0">
        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-6 pt-4">
          {/* Title Section - Centered & Cohesive */}
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-black text-[#1b1c23] leading-tight tracking-tight">
              Make your <br />
              <span className="text-[#8c8fff]">judgement</span>
            </h2>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              Review evidence and select a winner.
            </p>

            {/* Refresh Button */}
            <button
              onClick={() => void handleRefresh()}
              disabled={isRefreshing || isProcessing}
              className="absolute top-1 right-0 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-[#8c8fff] active:scale-90 transition-all hover:bg-gray-50"
              title="Refresh Status"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col gap-6 relative">
            <div className="relative z-10">
              <div className="transform transition-transform active:scale-[0.98]">
                <DisputeCandidateCard
                  type="vote"
                  partyInfo={parties.claimer}
                  isSelected={selectedVote === 1}
                  isDisabled={hasCommittedLocally}
                  onClick={() => handleVoteSelect(1)}
                  className="w-full h-32"
                />
              </div>
              <VsBadge />
            </div>

            <div className="transform transition-transform active:scale-[0.98]">
              <DisputeCandidateCard
                type="vote"
                partyInfo={parties.defender}
                isSelected={selectedVote === 0}
                isDisabled={hasCommittedLocally}
                onClick={() => handleVoteSelect(0)}
                className="w-full h-32"
              />
            </div>
          </div>

          {/* Status Notifications */}
          <div className="mt-8 min-h-[24px]">
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8c8fff] animate-pulse bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mx-auto w-fit shadow-sm">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>SECURING VOTE ON-CHAIN...</span>
              </div>
            )}

            {hasCommittedLocally && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#1b1c23]">
                    Vote Secured
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-tight">
                    Your decision is encrypted. You must reveal it in the next
                    phase.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Footer Action */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
        <div className="w-full max-w-sm">
          {!hasCommittedLocally ? (
            <SwipeButton
              onSwipeComplete={() => void onCommitClick()}
              isLoading={isProcessing}
              disabled={isCommitDisabled}
            >
              SWIPE TO VOTE
            </SwipeButton>
          ) : (
            <button
              onClick={() =>
                isRevealDisabled
                  ? router.push("/")
                  : router.push(`/disputes/${disputeId}/reveal`)
              }
              className={`
                w-full py-5 px-6 rounded-[20px] font-manrope font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3
                ${
                  isRevealDisabled
                    ? "bg-white text-[#1b1c23] border border-gray-200 shadow-lg hover:bg-gray-50"
                    : "bg-[#1b1c23] text-white shadow-xl shadow-gray-200 hover:scale-[1.02]"
                }
              `}
            >
              {isRevealDisabled ? (
                <>
                  <Home className="w-5 h-5" /> <span>RETURN HOME</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" /> <span>GO TO REVEAL</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
}
````

## File: src/app/disputes/[id]/page.tsx
````typescript
"use client";

import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import { shortenAddress } from "@/util/wallet";
import { DISPUTE_STATUS } from "@/config/app";
import { useHeader } from "@/lib/hooks/useHeader";
import {
  Loader2,
  Clock,
  FileText,
  ArrowRight,
  Scale,
  Coins,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DisputeOverviewPage() {
  const [now, setNow] = useState(0);
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { dispute, loading: isLoading } = useGetDispute(disputeId);

  const handleBack = () => router.back();
  const handleStartReview = () => router.push(`/disputes/${disputeId}/review`);

  const bindSwipe = usePageSwipe({
    onSwipeLeft: handleStartReview,
  });

  // Configure header
  useHeader({
    title: "Dispute Overview",
  });

  // Calculate winner logic
  const isFinished = dispute?.status === DISPUTE_STATUS.RESOLVED;
  const winnerAddress = dispute?.winner?.toLowerCase();

  // Helper to get formatted data
  const statusLabels: Record<number, string> = {
    [DISPUTE_STATUS.CREATED]: "Created",
    [DISPUTE_STATUS.COMMIT]: "Commit",
    [DISPUTE_STATUS.REVEAL]: "Reveal",
    [DISPUTE_STATUS.RESOLVED]: "Executed",
  };

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
  }, []);

  const getDeadlineLabel = () => {
    if (!dispute) return "Loading...";
    if (dispute.status === DISPUTE_STATUS.RESOLVED) return "Resolved";

    // Handle the initial render (before useEffect runs)
    if (now === 0) return "Loading...";

    let targetDeadline = 0;
    if (dispute.status === DISPUTE_STATUS.COMMIT) {
      targetDeadline = dispute.commitDeadline || 0;
    } else if (dispute.status === DISPUTE_STATUS.REVEAL) {
      targetDeadline = dispute.revealDeadline;
    } else {
      return dispute.deadlineLabel ?? "Pending";
    }

    // Use the state variable 'now' instead of calling Date.now()
    const diff = targetDeadline - now;

    if (diff <= 0) return "Ended";

    const hours = Math.ceil(diff / 3600);

    if (hours > 24) {
      const days = Math.ceil(hours / 24);
      return `${days}d left`;
    }

    return `${hours}h left`;
  };

  const displayDispute = dispute
    ? {
        id: dispute.id.toString(),
        title: dispute.title || `Dispute #${dispute.id}`,
        category: dispute.category,
        status: statusLabels[dispute.status] || "Unknown",
        claimer: {
          name: dispute.claimerName || dispute.claimer,
          shortName: shortenAddress(dispute.claimerName || dispute.claimer),
          avatar: "/images/profiles-mockup/profile-1.jpg",
          isWinner:
            isFinished && winnerAddress === dispute.claimer.toLowerCase(),
        },
        defender: {
          name: dispute.defenderName || dispute.defender,
          shortName: shortenAddress(dispute.defenderName || dispute.defender),
          avatar: "/images/profiles-mockup/profile-2.jpg",
          isWinner:
            isFinished && winnerAddress === dispute.defender.toLowerCase(),
        },
        description: dispute.description || "No description provided.",
        deadlineLabel: getDeadlineLabel(), // Use new logic
        stake: dispute.myStake || dispute.stake,
      }
    : null;

  if (isLoading || !displayDispute) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 relative overflow-hidden touch-none"
      {...bindSwipe()}
    >
      {/* Background Decorative blob */}
      <div className="absolute -top-36 -left-24 w-72 h-72 bg-[#8c8fff]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="mt-6 mx-6 flex flex-col gap-4 z-10">
        {/* Badges Row */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#8c8fff] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm shadow-[#8c8fff]/20">
            {displayDispute.category}
          </span>
          <div className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#8c8fff]" />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {displayDispute.deadlineLabel}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-manrope font-extrabold text-[#1b1c23] leading-tight tracking-tight">
          {displayDispute.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-6 z-10 scrollbar-hide">
        {/* 2. Versus Card */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#8c8fff]" /> Parties Involved
            </h3>
          </div>

          {/* Canonical: rounded-[24px] -> rounded-3xl */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-white relative">
            <div className="flex items-stretch min-h-30">
              {/* Claimer (Left) */}
              {/* Canonical: rounded-l-[18px] -> rounded-l-2xl */}
              <div className="flex-1 bg-[#F8F9FC] rounded-l-2xl rounded-r-md p-4 flex flex-col items-center justify-center gap-2 text-center border border-transparent hover:border-blue-100 transition-colors">
                <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-md overflow-hidden mb-1">
                  <img
                    src={displayDispute.claimer.avatar}
                    alt="Claimer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
                    Claimer
                  </span>
                  <div className="max-w-[100px] sm:max-w-none mx-auto">
                    <span className="inline-block text-base font-bold text-[#1b1c23] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm truncate w-full">
                      {displayDispute.claimer.shortName}
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-[#1b1c23] w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-[4px] border-white text-white">
                  <span className="text-[10px] font-black italic pr-[1px]">
                    VS
                  </span>
                </div>
              </div>

              {/* Defender (Right) */}
              {/* Canonical: rounded-r-[18px] -> rounded-r-2xl */}
              <div className="flex-1 bg-[#F8F9FC] rounded-r-2xl rounded-l-md p-4 flex flex-col items-center justify-center gap-2 text-center border border-transparent hover:border-gray-200 transition-colors">
                <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-md overflow-hidden mb-1">
                  <img
                    src={displayDispute.defender.avatar}
                    alt="Defender"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Defender
                  </span>
                  <div className="max-w-[100px] sm:max-w-none mx-auto">
                    <span className="inline-block text-base font-bold text-[#1b1c23] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm truncate w-full">
                      {displayDispute.defender.shortName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Case Context */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8c8fff]" /> Case Brief
            </h3>
          </div>

          {/* Canonical: rounded-[24px] -> rounded-3xl */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8c8fff]/20 to-transparent" />

            <p className="text-base text-gray-600 leading-relaxed font-medium">
              {displayDispute.description}
            </p>

            <div className="mt-8 pt-5 border-t border-dashed border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8c8fff]/10 flex items-center justify-center text-[#8c8fff]">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                    Juror Stake
                  </span>
                  <span className="text-base font-black text-[#1b1c23]">
                    {displayDispute.stake} USDC
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <span className="text-xs font-mono font-bold text-gray-500">
                  ID: #{displayDispute.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sticky Footer CTA */}
      <div className="shrink-0 p-6 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <button
          onClick={handleStartReview}
          // Canonical: rounded-[20px] -> rounded-2xl
          className="group w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <BookOpen className="w-5 h-5" />
          Browse Evidence
          <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
````

## File: src/hooks/disputes/useDisputeFinancials.ts
````typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { SLICE_ABI } from "@/config/contracts";
import { useContracts } from "@/hooks/core/useContracts";
import { formatUnits } from "viem";
import { useStakingToken } from "@/hooks/core/useStakingToken";

interface FinancialData {
  principal: string;     // The amount the user staked
  reward: string;        // The calculated profit
  total: string;         // Principal + Reward
  currency: string;      // USDC
  isWinner: boolean;     // Did the user vote with the majority?
  isLoading: boolean;
}

interface JurorData {
  address: string;
  hasRevealed: boolean;
  vote: number;
  stake: bigint;
}

export function useDisputeFinancials(disputeId: string, enabled = true) {
  const { address } = useAccount();
  const { sliceContract } = useContracts();
  const { decimals, symbol } = useStakingToken();
  const publicClient = usePublicClient();
  const isMountedRef = useRef(true);

  const [data, setData] = useState<FinancialData>({
    principal: "0",
    reward: "0",
    total: "0",
    currency: symbol || "USDC",
    isWinner: false,
    isLoading: true,
  });

  const calculateRewards = useCallback(async () => {
    // 1. Handle the "enabled" check (from develop)
    if (!enabled) {
      if (isMountedRef.current) {
        setData(prev => ({ ...prev, isLoading: false }));
      }
      return;
    }

    if (!publicClient || !address || !disputeId || !sliceContract) return;

    try {
      const dId = BigInt(disputeId);

      // --- FETCHING LOGIC ---
      
      // 1. Get My Stake
      const myStake = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "jurorStakes",
        args: [dId, address],
      })) as bigint;

      if (myStake === 0n) {
        if (isMountedRef.current) {
          setData((prev) => ({ ...prev, isLoading: false }));
        }
        return;
      }

      // 2. Get Dispute Info
      const disputeStruct = (await publicClient.readContract({
        address: sliceContract,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [dId],
      })) as any;
      
      const required = Number(disputeStruct.jurorsRequired || 3);
      const jurors: string[] = [];
      
      // 3. Fetch all jurors
      const jurorCalls = [];
      for (let i = 0; i < required; i++) {
         jurorCalls.push({
           address: sliceContract,
           abi: SLICE_ABI,
           functionName: "disputeJurors",
           args: [dId, BigInt(i)],
         });
      }
      
      const jurorResults = await publicClient.multicall({ contracts: jurorCalls });
      
      jurorResults.forEach((r) => {
          if (r.status === "success" && r.result) {
            jurors.push(r.result as string);
          }
      });

      // 4. Tally Votes & Stakes
      let votesFor0 = 0n;
      let votesFor1 = 0n;
      let myVote = -1;
      let myHasRevealed = false;

      // Fetch vote data for all jurors
      const voteCalls = jurors.map(juror => ({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "revealedVotes",
          args: [dId, juror],
      }));
      
      const revealedCalls = jurors.map(juror => ({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "hasRevealed",
          args: [dId, juror],
      }));
      
      const stakeCalls = jurors.map(juror => ({
          address: sliceContract,
          abi: SLICE_ABI,
          functionName: "jurorStakes",
          args: [dId, juror],
      }));

      const [voteResults, hasRevealedResults, stakeResults] = await Promise.all([
           publicClient.multicall({ contracts: voteCalls }),
           publicClient.multicall({ contracts: revealedCalls }),
           publicClient.multicall({ contracts: stakeCalls }),
      ]);

      // Store juror data for reward calculation (from feature/sli-40)
      const jurorData: JurorData[] = [];

      for (let i = 0; i < jurors.length; i++) {
          const jurorAddr = jurors[i];
          const revealResult = hasRevealedResults[i];
          const hasRevealed = revealResult.status === "success" ? Boolean(revealResult.result) : false;
          const vote = voteResults[i].status === "success" ? Number(voteResults[i].result) : -1;
          const stake = stakeResults[i].status === "success" ? (stakeResults[i].result as bigint) : 0n;

          jurorData.push({ address: jurorAddr, hasRevealed, vote, stake });

          if (jurorAddr.toLowerCase() === address.toLowerCase()) {
              if (hasRevealed) {
                  myVote = vote;
                  myHasRevealed = true;
              }
          }

          if (hasRevealed && vote >= 0) {
              if (vote === 0) votesFor0 += stake;
              else if (vote === 1) votesFor1 += stake;
          }
      }

      // 5. Determine Winner
      // Slice.sol logic: return votesFor1 > votesFor0 ? 1 : 0;
      const winningChoice = votesFor1 > votesFor0 ? 1 : 0;
      const isWinner = myHasRevealed && (myVote === winningChoice);

      // 6. Calculate Reward (Correct Logic from feature/sli-40)
      let calculatedReward = 0n;
      
      if (isWinner) {
          // Calculate pools exactly as in Slice.sol lines 406-415
          let totalWinningStake = 0n;
          let totalLosingStake = 0n;

          for (const juror of jurorData) {
              const isJurorWinner = juror.hasRevealed && juror.vote === winningChoice;
              if (isJurorWinner) {
                  totalWinningStake += juror.stake;
              } else {
                  // Losing stake includes: non-revealed jurors + revealed jurors who voted for losing choice
                  totalLosingStake += juror.stake;
              }
          }
          
          // Slice.sol: Reward = Stake + (Stake * LosingPool / WinningPool)
          // We only want the "Profit" part for the UI display
          if (totalWinningStake > 0n) {
              calculatedReward = (myStake * totalLosingStake) / totalWinningStake;
          }
      }

      const totalReturn = isWinner ? (myStake + calculatedReward) : 0n;

      if (isMountedRef.current) {
        setData({
            principal: formatUnits(myStake, decimals),
            reward: formatUnits(calculatedReward, decimals),
            total: formatUnits(totalReturn, decimals),
            currency: symbol || "USDC",
            isWinner,
            isLoading: false
        });
      }

    } catch (e) {
      console.error("Failed to calc financials", e);
      if (isMountedRef.current) {
        setData(prev => ({...prev, isLoading: false}));
      }
    }
  }, [enabled, publicClient, address, disputeId, sliceContract, decimals, symbol]);

  useEffect(() => {
    isMountedRef.current = true;
    calculateRewards();

    return () => {
      isMountedRef.current = false;
    };
  }, [calculateRewards]);

  return data;
}
````

## File: src/app/disputes/[id]/execute/page.tsx
````typescript
"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/disputes/useGetDispute";
import { useExecuteRuling } from "@/hooks/actions/useExecuteRuling";
import { useDisputeFinancials } from "@/hooks/disputes/useDisputeFinancials";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import {
  Loader2,
  Wallet,
  Trophy,
  Coins,
  Gavel,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useHeader } from "@/lib/hooks/useHeader";

export default function ExecuteRulingPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { dispute, refetch } = useGetDispute(disputeId);
  const { executeRuling, isExecuting } = useExecuteRuling();

  // Determine if ruling has been executed (status === 3)
  const isFinished = dispute?.status === 3;

  // Check if dispute is ready for execution (status === 2, in REVEAL phase)
  const isReadyForExecution = dispute?.status === 2;

  // Fetch Real Financials - Enable when ready for execution OR already finished
  const {
    principal,
    reward,
    total,
    currency,
    isWinner,
    isLoading: isFinanceLoading,
  } = useDisputeFinancials(disputeId, isReadyForExecution || isFinished);

  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const bindSwipe = usePageSwipe({
    onSwipeRight: () => router.back(),
  });

  // Configure header
  useHeader({
    title: "Ruling Phase",
  });

  const handleExecute = async () => {
    if (!dispute) return;
    if (dispute.status !== 2) {
      toast.error("Dispute is not ready for execution yet.");
      return;
    }

    // 1. Execute transaction
    const success = await executeRuling(disputeId);

    if (success) {
      // 2. CRITICAL FIX: Add a delay to allow RPC indexing
      // 2 seconds is usually enough for standard RPCs to catch up
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Now refetch. The RPC should have the new state (Status 3) by now.
      await refetch();

      // 4. Update UI
      setShowSuccess(true);

      // 5. Refresh server components
      router.refresh();
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    toast.info(
      "Ruling executed. You can review any balance updates in your Profile.",
    );
    router.push("/profile");
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 relative overflow-hidden font-manrope"
      {...bindSwipe()}
    >
      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="min-h-full flex flex-col justify-center">
          {/* 2. Hero Section: The "Bag" */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div
                className={`w-24 h-24 rounded-[32px] flex items-center justify-center rotate-3 ${
                  isFinanceLoading
                    ? "bg-gray-100"
                    : isReadyForExecution
                      ? isWinner
                        ? "bg-[#8c8fff]/10"
                        : "bg-orange-50"
                      : isFinished
                        ? isWinner
                          ? "bg-[#8c8fff]/10"
                          : "bg-red-50"
                        : "bg-gray-100"
                }`}
              >
                {isFinanceLoading ? (
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                ) : isReadyForExecution || isFinished ? (
                  isWinner ? (
                    <Wallet className="w-10 h-10 text-[#8c8fff]" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-orange-400" />
                  )
                ) : (
                  <Gavel className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1b1c23] rounded-full border-[3px] border-white flex items-center justify-center shadow-lg">
                <Coins className="w-5 h-5 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 leading-tight">
              {isFinished ? "Ruling Executed" : "Finalize Ruling"}
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-[260px]">
              {isFinanceLoading
                ? "Calculating results..."
                : isFinished
                  ? isWinner
                    ? "You voted with the majority. Your rewards have been added to your profile."
                    : "The majority voted differently. You will not receive a reward for this dispute."
                  : isReadyForExecution
                    ? isWinner
                      ? "You voted with the majority! Execute to claim your rewards."
                      : "You voted with the minority. Execute to finalize the dispute."
                    : "Execute the ruling to finalize the dispute and see your results."}
            </p>
          </div>

          {/* 3. The "Receipt" Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-500">
            {/* Dispute Context */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
              {/* Changed Icon to Purple to signify 'Victory/Completion' */}
              <div className="w-10 h-10 rounded-xl bg-[#8c8fff]/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-[#8c8fff]" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-gray-800 truncate">
                  {dispute ? dispute.title : "Loading Case..."}
                </h3>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">
                  Case #{disputeId}
                </p>
              </div>
            </div>

            {/* Financial Breakdown */}
            {isFinanceLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-gray-300" />
              </div>
            ) : isReadyForExecution || isFinished ? (
              <div className="flex flex-col gap-3">
                <RewardRow
                  label="Staked Principal"
                  value={`${principal} ${currency}`}
                  icon={
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isWinner ? "bg-gray-300" : "bg-red-300"}`}
                    />
                  }
                  strikethrough={!isWinner}
                />

                <RewardRow
                  label="Arbitration Reward"
                  value={`${isWinner ? "+" : ""}${reward} ${currency}`}
                  isHighlight={isWinner}
                  icon={
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isWinner ? "bg-[#8c8fff]" : "bg-gray-200"}`}
                    />
                  }
                />
              </div>
            ) : (
              <div className="flex justify-center py-4 text-sm text-gray-400">
                Waiting for voting to complete
              </div>
            )}

            {/* Total Section */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  {isFinished ? "Total Payout" : "Estimated Payout"}
                </span>
                <span className="text-[10px] font-medium text-[#8c8fff]">
                  Principal + Rewards
                </span>
              </div>
              <span
                className={`text-xl font-extrabold ${isFinanceLoading ? "text-gray-300" : isReadyForExecution || isFinished ? (isWinner ? "text-[#1b1c23]" : "text-gray-300") : "text-gray-300"}`}
              >
                {isFinanceLoading
                  ? "..."
                  : isReadyForExecution || isFinished
                    ? `${total} ${currency}`
                    : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Floating Action Bar */}
      <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-sm mx-auto">
          {isFinished ? (
            <button
              onClick={() => router.push("/profile")}
              className="w-full py-4 px-6 bg-[#1b1c23] border border-gray-200 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-[#2c2d33] transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Go to Profile</span>
            </button>
          ) : (
            <button
              onClick={() => void handleExecute()}
              disabled={isExecuting || !dispute || dispute.status !== 2}
              className={`
                 w-full py-4 px-6 rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(140,143,255,0.4)]
                 flex items-center justify-center gap-2
                 ${
                   isExecuting
                     ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                     : "bg-[#1b1c23] text-white hover:scale-[1.02] active:scale-[0.98]"
                 }
               `}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>EXECUTE RULING</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
}

// --- Helper Component for the "Receipt" ---
const RewardRow = ({
  label,
  value,
  icon,
  isHighlight = false,
  strikethrough = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isHighlight?: boolean;
  strikethrough?: boolean;
}) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
        {label}
      </span>
    </div>
    <span
      className={`font-semibold ${isHighlight ? "text-[#8c8fff]" : "text-[#1b1c23]"} ${strikethrough ? "line-through text-gray-300" : ""}`}
    >
      {value}
    </span>
  </div>
);
````