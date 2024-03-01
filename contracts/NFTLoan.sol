// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Simple NFT Loan
contract NFTLoan is ReentrancyGuard {

    fallback() external payable { }
    receive() external payable { }
    struct Loan {
        address borrower;
        address lender;
        uint256 nftId;
        address nftAddress;
        uint256 loanAmount;
        uint256 startTime;
        uint256 duration;
        bool isFunded;
        bool canceled;
    }

    uint256 public constant FEE_RATE = 1000; // 0.1% per day in basis points
    uint256 public constant DAY_IN_SECONDS = 86400;
    uint256 public loanCounter;

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public loansPerAddress;

    constructor() {
        loanCounter = 0;
    }

    modifier loanNotCanceled(uint256 loanId) {
        require(!loans[loanId].canceled, "Loan is canceled");
        _;
    }

    // Custom getter function to retrieve all loan IDs for an address
    function getLoansForAddress(address _address) external view returns (uint256[] memory) {
        return loansPerAddress[_address];
    }

    event LoanRequested(uint256 loanId, address borrower, uint256 nftId, address nftAddress, uint256 loanAmount, uint256 duration);
    event LoanFunded(uint256 loanId, address lender, address borrower);
    event LoanRepaid(uint256 loanId, address borrower);
    event LoanCanceled(address borrower, uint256 loanId);
    event CollateralClaimed(uint256 loanId, address lender, address borrower);

    function requestLoan(uint256 _nftId, address _nftAddress, uint256 _loanAmount, uint256 _duration) external {
        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _nftId);

        loans[loanCounter] = Loan({
            borrower: msg.sender,
            lender: address(0),
            nftId: _nftId,
            nftAddress: _nftAddress,
            loanAmount: _loanAmount,
            startTime: 0, // Will be set when the loan is funded
            duration: _duration,
            isFunded: false,
            canceled : false
        });

        emit LoanRequested(loanCounter, msg.sender, _nftId, _nftAddress, _loanAmount, _duration);
        loanCounter++;
    }

    function requestLoanCancellation(uint256 loanId) external loanNotCanceled(loanId) {
        require(msg.value == loans[loanId].borrower, "Only loan borrower can cancel");
        require(!loans[loanId].isFunded, "Cant cancel funded loan");

        loans[loanId].canceled = true;
        IERC721(_nftAddress).transferFrom(address(this), msg.sender, _nftId);
        emit LoanCanceled(msg.sender, loanId);
    }

    function fundLoan(uint256 _loanId) external payable loanNotCanceled(loanId) {
        Loan storage loan = loans[_loanId];
        require(!loan.isFunded, "Loan already funded");
        require(msg.value == loan.loanAmount, "Incorrect loan amount");

        // Transfer the loan amount to the borrower
        payable(loan.borrower).transfer(msg.value);

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.isFunded = true;

        emit LoanFunded(_loanId, msg.sender, loan.borrower);
    }

    function repayLoan(uint256 _loanId) external payable nonReentrant loanNotCanceled(loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.isFunded, "Loan not funded");
        require(msg.sender == loan.borrower, "Only borrower can repay a loan.");

        uint256 repaymentAmount = calculateRepaymentAmount(_loanId);
        require(msg.value >= repaymentAmount, "Incorrect repay amount.");

        payable(loan.lender).transfer(repaymentAmount);
        IERC721(loan.nftAddress).transferFrom(address(this), loan.borrower, loan.nftId);

        if (msg.value > repaymentAmount) {
            payable(msg.sender).transfer(msg.value - repaymentAmount);
        }

        emit LoanRepaid(_loanId, loan.borrower);
    }

    function calculateRepaymentAmount(uint256 _loanId) public view returns (uint256) {
        Loan storage loan = loans[_loanId];
        require(loan.isFunded, "Loan not funded.");

        uint256 durationInDays = (block.timestamp - loan.startTime + DAY_IN_SECONDS - 1) / DAY_IN_SECONDS; // ROUND UP
        uint256 fee = (loan.loanAmount * FEE_RATE * durationInDays) / 100000; // Adjust the basis points calculation as necessary
        return loan.loanAmount + fee;
    }

    function claimCollateral(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.isFunded, "Loan not funded.");
        require(block.timestamp > loan.startTime + loan.duration, "Loan period not yet over.");
        require(msg.sender == loan.lender, "Only the lender can claim the collateral.");

        IERC721(loan.nftAddress).transferFrom(address(this), loan.lender, loan.nftId);

        emit CollateralClaimed(_loanId, loan.lender, loan.borrower);
    }
}
