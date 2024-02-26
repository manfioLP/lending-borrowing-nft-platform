import { expect } from 'chai';
import { ethers } from "hardhat";

describe("SimpleNFTLoan", function () {

	it("Should deploy NFTLoan", async function () {
		const NftLoanContract = await ethers.getContractFactory("NFTLoan");
		const NFTLoan = await NftLoanContract.deploy();
		await NFTLoan.deployed();

		expect(await NFTLoan.deployed()).to.equal(NFTLoan);
	});

	it("Should allow a user to request a loan by depositing an NFT", async function () {
		// get test NFT

		// get NFTLoan contract
		const NFTLoan = await ethers.getContractFactory("NFTLoan");
		const nftLoan = await NFTLoan.deploy();
		await nftLoan.deployed();

		// mint NFT
		// const [owner] = await ethers.getSigners();
		// await testNFT.mint(owner.address, 1);
		// await testNFT.approve(simpleNFTLoan.address, 1);

		// request Loan

		// verify ownership
		// verify events emitted
	});

	// Add more tests as needed
});
