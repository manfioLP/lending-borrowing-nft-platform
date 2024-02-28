import "@nomiclabs/hardhat-waffle";
import { task } from 'hardhat/config';
import { HardhatUserConfig } from "hardhat/config";

require('dotenv').config();

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/6847f97056de449e9cea97e6eee07899",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
    }
  },
};

export default config;
