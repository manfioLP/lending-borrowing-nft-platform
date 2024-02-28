import React, { useState, FormEvent, ChangeEvent } from 'react';

interface LoanFormData {
	nftAddress: string;
	nftTokenId: string;
	loanAmount: string;
	duration: number;
}

const LoanForm: React.FC = () => {
	const [nftAddress, setNftAddress] = useState<string>('');
	const [nftTokenId, setNftTokenId] = useState<string>('');
	const [loanAmount, setLoanAmount] = useState<string>('');
	const [duration, setDuration] = useState<number>(0);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formData: LoanFormData = { nftAddress, nftTokenId, loanAmount, duration };
		console.log(formData);
		// Add your logic here to connect with MetaMask and your smart contract
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
		</div>
	);
}

export default LoanForm
