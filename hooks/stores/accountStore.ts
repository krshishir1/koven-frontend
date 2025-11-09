import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useDeployContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ABI, BYTECODE } from "../sampleContract";
import { useTerminalStore } from "./terminalStore";
import { useEffect } from "react";

export interface DeployedContract {
  id: string;
  address: string;
  transactionHash: string;
  networkName: string;
  chainId: number;
  timestamp: number;
  abi: any[];
  functions: string[];
}

interface AccountState {
  address: string | null;
  avatar: string | null;
  isConnected: boolean;
  networkName: string | null;
  chainId: number | null;
  deployedContracts: DeployedContract[];
  setAccount: (address: string, avatar: string, networkName?: string, chainId?: number) => void;
  setNetwork: (networkName: string, chainId: number) => void;
  clearAccount: () => void;
  addDeployedContract: (contract: DeployedContract) => void;
  removeDeployedContract: (id: string) => void;
}

/**
 * Custom hook to deploy the sample contract to Sepolia testnet
 * @returns Object with deployContract function and deployment state
 */
export function useDeploySampleContract() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const addLog = useTerminalStore((state) => state.addLog);
  const addDeployedContract = useAccountStore((state) => state.addDeployedContract);
  const SEPOLIA_CHAIN_ID = 11155111;

  const {
    deployContract: deployContractAction,
    data: deployHash,
    isPending: isDeploying,
    error: deployError,
  } = useDeployContract();

  // Wait for transaction receipt after deployment
  const { data: receipt, isLoading: isWaitingReceipt } = useWaitForTransactionReceipt({
    hash: deployHash || undefined,
  });

  // Log transaction hash when it becomes available
  useEffect(() => {
    if (deployHash) {
      addLog(`Transaction hash: ${deployHash}. Waiting for transaction confirmation...`, "info");
    }
  }, [deployHash, addLog]);

  // Handle receipt when transaction is confirmed
  useEffect(() => {
    if (receipt && deployHash) {
      const contractAddress = receipt.contractAddress;
      if (contractAddress) {
        // Extract function names from ABI
        const functions = ABI.filter((item) => item.type === "function").map(
          (item) => item.name || "unknown"
        );

        addLog(`Contract deployed successfully! \n Contract Address: ${contractAddress}`, "success");
        addLog(`Transaction: ${deployHash}`, "info");
        // addLog(`Available functions: ${functions.join(", ")}`, "info");

        // Add to deployed contracts
        const deployedContract: DeployedContract = {
          id: `contract_${Date.now()}`,
          address: contractAddress,
          transactionHash: deployHash,
          networkName: "Sepolia",
          chainId: SEPOLIA_CHAIN_ID,
          timestamp: Date.now(),
          abi: ABI,
          functions,
        };

        addDeployedContract(deployedContract);
      }
    }
  }, [receipt, deployHash, addLog, addDeployedContract]);

  const deployContract = async () => {
    try {
      // Check if wallet is connected
      if (!isConnected || !address) {
        addLog("Please connect your wallet first", "error");
        throw new Error("Please connect your wallet first");
      }

      // Check if on Sepolia network
      if (chainId !== SEPOLIA_CHAIN_ID) {
        addLog(`⚠️ Switching to Sepolia testnet (Chain ID: ${SEPOLIA_CHAIN_ID})...`, "warning");
        // Try to switch to Sepolia
        try {
          await switchChain({ chainId: SEPOLIA_CHAIN_ID });
          // Wait a bit for the chain switch to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));
          addLog("Switched to Sepolia testnet", "success");
        } catch (switchError) {
          addLog(
            `Failed to switch to Sepolia testnet. Please switch manually (Chain ID: ${SEPOLIA_CHAIN_ID})`,
            "error"
          );
          throw new Error(
            `Please switch to Sepolia testnet (Chain ID: ${SEPOLIA_CHAIN_ID}) to deploy contracts`
          );
        }
      }

      addLog("Deploying contract to Sepolia testnet...", "info");
      addLog(`Contract ABI: ${ABI.length} functions`, "info");

      await deployContractAction({
        abi: ABI,
        bytecode: BYTECODE as `0x${string}`,
        args: [],
      });
    } catch (error: any) {
      console.error("Contract deployment failed:", error);
      addLog(`Deployment failed: ${error?.message || "Unknown error"}`, "error");
      const errorMessage =
        error?.message || "Contract deployment failed. Please check the console for details.";
      throw new Error(errorMessage);
    }
  };

  return {
    deployContract,
    isDeploying: isDeploying || isWaitingReceipt,
    deployHash,
    deployError,
    isConnected,
    chainId,
    isOnSepolia: chainId === SEPOLIA_CHAIN_ID,
  };
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      address: null,
      avatar: null,
      isConnected: false,
      networkName: null,
      chainId: null,
      deployedContracts: [],

      setAccount: (address, avatar, networkName, chainId) =>
        set({
          address,
          avatar,
          isConnected: true,
          networkName: networkName || null,
          chainId: chainId || null,
        }),

      setNetwork: (networkName, chainId) =>
        set({
          networkName,
          chainId,
        }),

      clearAccount: () =>
        set({
          address: null,
          avatar: null,
          isConnected: false,
          networkName: null,
          chainId: null,
        }),

      addDeployedContract: (contract) =>
        set((state) => ({
          deployedContracts: [...state.deployedContracts, contract],
        })),

      removeDeployedContract: (id) =>
        set((state) => ({
          deployedContracts: state.deployedContracts.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "account-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        deployedContracts: state.deployedContracts,
      }),
    }
  )
);
