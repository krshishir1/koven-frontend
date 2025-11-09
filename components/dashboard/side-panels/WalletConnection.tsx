"use client";
import { useEffect } from "react";
import { useDisconnect, useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useAccountStore } from "@/hooks/stores";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AccountAvatar } from "@/components/ui/avatar-gen";

export default function WalletConnectPanel() {
  const { disconnect } = useDisconnect();
  const { address, isConnected, chainId } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { setAccount, setNetwork, clearAccount } = useAccountStore();

  // Get network name helper
  const getNetworkName = (chainId: number | undefined) => {
    if (!chainId) return "Unknown";
    switch (chainId) {
      case sepolia.id:
        return "Sepolia Testnet";
      case 1:
        return "Ethereum Mainnet";
      default:
        return `Chain ${chainId}`;
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      const chainIdToUse = currentChainId || chainId;
      const networkName = getNetworkName(chainIdToUse);
      setAccount(address, "", networkName, chainIdToUse);
    } else {
      clearAccount();
    }
  }, [isConnected, address, currentChainId, chainId, setAccount, clearAccount]);

  // Update network when chain changes
  useEffect(() => {
    if (isConnected) {
      const chainIdToUse = currentChainId || chainId;
      if (chainIdToUse) {
        const networkName = getNetworkName(chainIdToUse);
        setNetwork(networkName, chainIdToUse);
      }
    }
  }, [currentChainId, chainId, isConnected, setNetwork]);

  // Get network details from store or current connection
  const storeNetworkName = useAccountStore((s) => s.networkName);
  const storeChainId = useAccountStore((s) => s.chainId);
  const networkName = storeNetworkName || getNetworkName(currentChainId || chainId);
  const chainIdToDisplay = storeChainId || currentChainId || chainId;
  const isSepolia = chainIdToDisplay === sepolia.id;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-600">Network</label>
        {isConnected ? (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSepolia ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {networkName}
                </span>
              </div>
              {!isSepolia && (
                <button
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Switch to Sepolia
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 pl-2">
              Chain ID: {chainIdToDisplay || "N/A"}
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm text-gray-500">
            Connect wallet to see network
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Account</label>

        {!isConnected ? (
          <div className="mt-2">
            <ConnectButton />
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
              <div className="flex items-center gap-2">
                <AccountAvatar seed={address || "default"} className="" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {networkName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => disconnect()}
                className="text-xs text-red-500 hover:underline"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
