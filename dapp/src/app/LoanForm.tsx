import React, { useState, FormEvent, ChangeEvent } from 'react';
import NFTLoanABI from "@/resources/NFTLoanABI";
import ERC721ABI from "@/resources/ERC721ABI";

import {ethers} from 'ethers';

interface LoanFormData {
	nftAddress: string;
	nftTokenId: string;
	loanAmount: string;
	duration: number;
}

// const NFTLoanContractAddress = "0x319b614Ede65b08D9A4A05fD6Ebbe186C0Ed1b15"
const NFTLoanContractAddress = "0x47FF90bad1D7d143D4a6cc4B5f19F3BEc7DDe6A7"
const LoanForm: React.FC = () => {
	const [nftAddress, setNftAddress] = useState<string>('');
	const [nftTokenId, setNftTokenId] = useState<string>('');
	const [loanAmount, setLoanAmount] = useState<string>('');
	const [duration, setDuration] = useState<number>(0);

	async function checkApproval(event: FormEvent) {
		event.preventDefault();

		// @ts-ignore
		const provider = new ethers.BrowserProvider(window.ethereum)

		// Get the signer from the provider, which is needed to sign transactions
		const signer = await provider.getSigner()
		const nftContract = new ethers.Contract(nftAddress, ERC721ABI, signer);

		const isApproved = await nftContract.getApproved(BigInt(nftTokenId));
		console.log(`Approved address for token ${nftTokenId}:`, isApproved);

		const isOperatorApproved = await nftContract.isApprovedForAll(signer.address, NFTLoanContractAddress);
		console.log(`Is operator approved:`, isOperatorApproved);
	}


	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formData: LoanFormData = { nftAddress, nftTokenId, loanAmount, duration };
		console.log(formData);
		try {
			// @ts-ignore
			const provider = new ethers.BrowserProvider(window.ethereum)
			const signer = await provider.getSigner()

			// TODO: add contract address to env var
			const contract = new ethers.Contract(NFTLoanContractAddress, NFTLoanABI, signer);

			const nftIdBN = BigInt(nftTokenId)

			const nftContract = new ethers.Contract(nftAddress, ERC721ABI, signer);
			const approveTransferTx = await nftContract.approve(NFTLoanContractAddress, nftIdBN)
			await approveTransferTx.wait()
			console.log("NFT Transfer Approved", approveTransferTx)

			const transaction = await contract.requestLoan(nftIdBN, nftAddress, ethers.parseEther(loanAmount), duration);

			console.log("transaction", transaction)
			await transaction.wait()

			console.log('Loan created successfully');
		} catch (err) {
			console.error('Error creating loan:', err);
		}
	};

	return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-md">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="flex justify-between gap-4">
					<div className="w-1/2">
						<label htmlFor="nftAddress" className="block text-sm font-medium text-gray-700">NFT Address:</label>
						<input
							id="nftAddress"
							type="text"
							value={nftAddress}
							onChange={(e) => setNftAddress(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							required
						/>
					</div>
					<div className="w-1/2">
						<label htmlFor="nftTokenId" className="block text-sm font-medium text-gray-700">NFT Token ID:</label>
						<input
							id="nftTokenId"
							type="text"
							value={nftTokenId}
							onChange={(e) => setNftTokenId(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							required
						/>
					</div>
				</div>
				<div className="flex justify-between gap-4">
					<div className="w-1/2">
						<label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount:</label>
						<input
							id="loanAmount"
							type="text"
							value={loanAmount}
							onChange={(e) => setLoanAmount(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							required
						/>
					</div>
					<div className="w-1/2">
						<label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days):</label>
						<input
							id="duration"
							type="number"
							value={duration}
							onChange={(e) => setDuration(Number(e.target.value))}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							required
						/>
					</div>
				</div>

				<button type="submit" className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
					Submit
				</button>
			</form>
			<button onClick={checkApproval}>
				Check Approval
			</button>
		</div>
	);
}

export default LoanForm
