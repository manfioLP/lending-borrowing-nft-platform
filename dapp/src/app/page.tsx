'use client'

import { MetaMaskProvider, useSDK } from "@metamask/sdk-react";
import WalletIcon from "../../public/icons/WalletIcon";
import { ethers } from "ethers";

const ConnectWalletButton = () => {
  const { sdk, connected, connecting } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };

  const disconnect = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  return (
    <div className="relative">
      {connected ? (
            <button
              onClick={disconnect}
              className="block w-full pl-2 pr-4 py-2 text-left text-[#F05252] hover:bg-gray-200"
            >
              Disconnect
            </button>
      ) : (
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" disabled={connecting} onClick={connect}>
          <WalletIcon className="mr-2 h-10 w-10" /> Connect Wallet
        </button>
      )}
    </div>
  );
};

export default function App() {
  const host =
    typeof window !== "undefined" ? window.location.host : "defaultHost";

  const sdkOptions = {
    logging: { developerMode: false },
    checkInstallationImmediately: false,
    dappMetadata: {
      name: "NFT Simple Loan",
      url: host,
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
        <Home />
      </MetaMaskProvider>
    </main>
  );
}

const Home = () => {
  const { sdk, connected, chainId, balance, account } = useSDK();

  const parseBalance = (balance: string) => {
    console.log("balance", balance)
    return ethers.formatEther(parseInt(balance, 16))
  }

  return (
    <div>
      <ConnectWalletButton />
      {connected && (<div>
        <h3>Account: {account} </h3>
        <h3>ChainID: {chainId} </h3>
        <h3>Balance: {parseBalance(balance || "0x0")} </h3>
      </div>)}
    </div>
  )
}
