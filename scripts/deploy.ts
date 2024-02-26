import { ethers } from "hardhat";

async function main() {
  // Fetch the contract factory
  const Contract = await ethers.getContractFactory("NFTLoan");

  // Deploy the contract
  const contract = await Contract.deploy();
  await contract.deployed();

  console.log("NFTLoan Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
