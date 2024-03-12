"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const NFTLoanABI_1 = __importDefault(require("./NFTLoanABI"));
exports.default = () => {
    const db = {}; // used for showcasing only
    let totalAmount = 0;
    // memory dbs can also me implemented with "catching up functionality":
    // retrieve current block number
    // query last events and optimize it
    // will take some time to process though
    if (!process.env.NETWORK) {
        throw new Error("No Network provided - maybe you forgot to set it on .env?");
    }
    if (!process.env.INFURA_KEY) {
        throw new Error("No Infura Key provided - maybe you forgot to set it on .env?");
    }
    if (!process.env.LOAN_CONTRACT_ADDRESS) {
        throw new Error("No NFT Loan Contract Address provided - maybe you forgot to set it on .env?");
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(`https://${process.env.NETWORK}.infura.io/v3/${process.env.INFURA_KEY}`);
    // const contractABI = require('./NFTLoanABI');
    const contractAddress = process.env.LOAN_CONTRACT_ADDRESS;
    const contract = new ethers_1.ethers.Contract(contractAddress, NFTLoanABI_1.default, provider);
    // TODO: insert to DATABASE to release onchain workload to off-chain
    // DB not added because is for showcasing only
    contract.on('LoanRequested', (borrower, loanId, amount, event) => {
        console.log(`[LoanRequested] - Loan Request created: ${loanId.toString()} for ${amount.toString()} by ${borrower}`);
        //example
        const loan = { funded: false, paid: false, id: loanId, amount, canceled: false };
        if (!db[borrower]) {
            db[borrower] = [loan];
        }
        else {
            db[borrower].push(loan);
        }
        totalAmount += amount;
    });
    contract.on('LoanCanceled', (borrower, loanId) => {
        console.log(`[LoanCanceled] - user ${borrower} canceled Loan ${loanId.toString()}`);
        const loanIndex = db[borrower].findIndex(l => l.id.toString() == loanId.toString());
        db[borrower][loanIndex].canceled = true;
    });
    contract.on('LoanFunded', (loanId, lender, borrower) => {
        console.log(`[LoanFunded] - User ${lender} funded loan ${loanId.toString()}`);
        // update funded...
    });
    contract.on('LoanRepaid', (loanId, borrower) => {
        console.log(`[LoanRepaid] - Loan ${loanId.toString()} has been repaid`);
        // update paid...
    });
    contract.on('CollateralClaimed', (loanId, lender) => {
        console.log(`[CollateralClaimed] - Loan ${loanId.toString()} has not been paid on time and user ${lender} claimed it's collateral`);
        // update collateral claimed...
    });
    console.log(`Listening for NFT Loan Smart Contract ${process.env.LOAN_CONTRACT_ADDRESS} Events`);
};
