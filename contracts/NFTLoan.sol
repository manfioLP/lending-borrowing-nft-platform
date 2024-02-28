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
    }

    uint256 public constant FEE_RATE = 1000; // 0.1% per day in basis points
    uint256 public constant DAY_IN_SECONDS = 86400;
    uint256 public loanCounter;

    mapping(uint256 => Loan) public loans;

    constructor() {
        loanCounter = 0;
    }

    event LoanRequested(uint256 loanId, address borrower, uint256 nftId, address nftAddress, uint256 loanAmount, uint256 duration);
    event LoanFunded(uint256 loanId, address lender);
    event LoanRepaid(uint256 loanId);
    event CollateralClaimed(uint256 loanId, address lender);

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
            isFunded: false
        });

        emit LoanRequested(loanCounter, msg.sender, _nftId, _nftAddress, _loanAmount, _duration);
        loanCounter++;
    }

    function fundLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(!loan.isFunded, "Loan already funded.");
        require(msg.value == loan.loanAmount, "Incorrect loan amount.");

        // Transfer the loan amount to the borrower
        payable(loan.borrower).transfer(msg.value);

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.isFunded = true;

        emit LoanFunded(_loanId, msg.sender);
    }

    function repayLoan(uint256 _loanId) external payable nonReentrant {
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

        emit LoanRepaid(_loanId);
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

        emit CollateralClaimed(_loanId, loan.lender);
    }
}
