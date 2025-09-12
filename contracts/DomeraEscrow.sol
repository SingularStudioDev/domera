// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IArbitrator {
    function createDispute(uint256 _choices, bytes memory _extraData) external payable returns (uint256 disputeID);
    function arbitrationCost(bytes memory _extraData) external view returns (uint256 fee);
}

interface IArbitrable {
    function rule(uint256 _disputeID, uint256 _ruling) external;
}

/**
 * @title DomeraEscrow
 * @dev Smart contract for handling property reservation escrows with Kleros arbitration
 */
contract DomeraEscrow is ReentrancyGuard, Ownable, IArbitrable {
    uint256 private _escrowIdCounter;
    
    IArbitrator public arbitrator;
    bytes public arbitratorExtraData;
    uint256 public constant RULING_OPTIONS = 3; // 0: Refuse, 1: Pay receiver, 2: Refund buyer
    
    enum EscrowStatus { Created, Paid, DisputeCreated, Resolved }
    enum RulingOption { Refuse, PayReceiver, RefundBuyer }
    
    struct Escrow {
        uint256 id;
        address payable buyer;
        address payable receiver;
        uint256 amount;
        uint256 timeout;
        EscrowStatus status;
        uint256 disputeID;
        string metaEvidence;
        string propertyId;
        string propertyTitle;
        bool buyerFeeRequired;
        uint256 createdAt;
    }
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public disputeIDToEscrowID;
    
    event EscrowCreated(
        uint256 indexed escrowID,
        address indexed buyer,
        address indexed receiver,
        uint256 amount,
        string propertyId
    );
    
    event Payment(uint256 indexed escrowID, address indexed payer, uint256 amount);
    event DisputeCreated(uint256 indexed escrowID, uint256 indexed disputeID);
    event Ruling(uint256 indexed escrowID, uint256 indexed disputeID, uint256 ruling);
    event EscrowResolved(uint256 indexed escrowID, address indexed winner, uint256 amount);
    
    constructor(
        IArbitrator _arbitrator,
        bytes memory _arbitratorExtraData
    ) Ownable(msg.sender) {
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
    }
    
    /**
     * @dev Creates a new escrow for property reservation
     * @param _receiver Address that will receive payment if dispute is ruled in their favor
     * @param _timeout Timeout in seconds after which buyer can reclaim without dispute
     * @param _metaEvidence IPFS hash or JSON string containing dispute evidence
     * @param _propertyId Unique identifier for the property
     * @param _propertyTitle Title of the property for identification
     */
    function createEscrow(
        address payable _receiver,
        uint256 _timeout,
        string memory _metaEvidence,
        string memory _propertyId,
        string memory _propertyTitle
    ) external payable returns (uint256 escrowID) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_receiver != address(0), "Invalid receiver address");
        require(_timeout > block.timestamp, "Timeout must be in the future");
        
        escrowID = _escrowIdCounter;
        _escrowIdCounter++;
        
        escrows[escrowID] = Escrow({
            id: escrowID,
            buyer: payable(msg.sender),
            receiver: _receiver,
            amount: msg.value,
            timeout: _timeout,
            status: EscrowStatus.Paid,
            disputeID: 0,
            metaEvidence: _metaEvidence,
            propertyId: _propertyId,
            propertyTitle: _propertyTitle,
            buyerFeeRequired: false,
            createdAt: block.timestamp
        });
        
        emit EscrowCreated(escrowID, msg.sender, _receiver, msg.value, _propertyId);
        emit Payment(escrowID, msg.sender, msg.value);
    }
    
    /**
     * @dev Allows receiver to release payment to themselves after timeout
     * @param _escrowID ID of the escrow
     */
    function releaseFunds(uint256 _escrowID) external nonReentrant {
        Escrow storage escrow = escrows[_escrowID];
        require(escrow.status == EscrowStatus.Paid, "Escrow not in paid status");
        require(msg.sender == escrow.receiver, "Only receiver can release funds");
        require(block.timestamp >= escrow.timeout, "Timeout not reached");
        
        escrow.status = EscrowStatus.Resolved;
        escrow.receiver.transfer(escrow.amount);
        
        emit EscrowResolved(_escrowID, escrow.receiver, escrow.amount);
    }
    
    /**
     * @dev Allows buyer to reclaim funds after timeout if receiver hasn't claimed
     * @param _escrowID ID of the escrow
     */
    function reclaimFunds(uint256 _escrowID) external nonReentrant {
        Escrow storage escrow = escrows[_escrowID];
        require(escrow.status == EscrowStatus.Paid, "Escrow not in paid status");
        require(msg.sender == escrow.buyer, "Only buyer can reclaim funds");
        require(block.timestamp >= escrow.timeout + 7 days, "Must wait 7 days after receiver timeout");
        
        escrow.status = EscrowStatus.Resolved;
        escrow.buyer.transfer(escrow.amount);
        
        emit EscrowResolved(_escrowID, escrow.buyer, escrow.amount);
    }
    
    /**
     * @dev Creates a dispute for the escrow
     * @param _escrowID ID of the escrow
     */
    function createDispute(uint256 _escrowID) external payable nonReentrant {
        Escrow storage escrow = escrows[_escrowID];
        require(escrow.status == EscrowStatus.Paid, "Escrow not in paid status");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.receiver,
            "Only buyer or receiver can create dispute"
        );
        
        uint256 arbitrationFee = arbitrator.arbitrationCost(arbitratorExtraData);
        require(msg.value >= arbitrationFee, "Insufficient arbitration fee");
        
        uint256 disputeID = arbitrator.createDispute{value: arbitrationFee}(
            RULING_OPTIONS,
            arbitratorExtraData
        );
        
        escrow.disputeID = disputeID;
        escrow.status = EscrowStatus.DisputeCreated;
        disputeIDToEscrowID[disputeID] = _escrowID;
        
        // Refund excess arbitration fee
        if (msg.value > arbitrationFee) {
            payable(msg.sender).transfer(msg.value - arbitrationFee);
        }
        
        emit DisputeCreated(_escrowID, disputeID);
    }
    
    /**
     * @dev Called by arbitrator to execute ruling
     * @param _disputeID ID of the dispute
     * @param _ruling The ruling decision (0: refuse, 1: pay receiver, 2: refund buyer)
     */
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(msg.sender == address(arbitrator), "Only arbitrator can rule");
        
        uint256 escrowID = disputeIDToEscrowID[_disputeID];
        Escrow storage escrow = escrows[escrowID];
        
        require(escrow.status == EscrowStatus.DisputeCreated, "Dispute not created");
        
        escrow.status = EscrowStatus.Resolved;
        
        if (_ruling == uint256(RulingOption.PayReceiver)) {
            escrow.receiver.transfer(escrow.amount);
            emit EscrowResolved(escrowID, escrow.receiver, escrow.amount);
        } else if (_ruling == uint256(RulingOption.RefundBuyer)) {
            escrow.buyer.transfer(escrow.amount);
            emit EscrowResolved(escrowID, escrow.buyer, escrow.amount);
        }
        // If ruling is Refuse (0), funds remain locked
        
        emit Ruling(escrowID, _disputeID, _ruling);
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 _escrowID) external view returns (
        address buyer,
        address receiver,
        uint256 amount,
        uint256 timeout,
        EscrowStatus status,
        string memory propertyId,
        string memory propertyTitle
    ) {
        Escrow storage escrow = escrows[_escrowID];
        return (
            escrow.buyer,
            escrow.receiver,
            escrow.amount,
            escrow.timeout,
            escrow.status,
            escrow.propertyId,
            escrow.propertyTitle
        );
    }
    
    /**
     * @dev Update arbitrator (only owner)
     */
    function updateArbitrator(IArbitrator _arbitrator, bytes memory _arbitratorExtraData) external onlyOwner {
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
    }
    
    /**
     * @dev Get current escrow counter
     */
    function getCurrentEscrowId() external view returns (uint256) {
        return _escrowIdCounter;
    }
}