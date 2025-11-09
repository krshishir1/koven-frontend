import WalletConnectPanel from "./WalletConnection";
import ContractSelect from "./ContractSelect";

import { useDeploySampleContract, useAccountStore } from "@/hooks/stores";
import { formatDistanceToNow } from "date-fns";

export function formatAddress(address?: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export default function DeployPanel() {
  const { deployContract, isDeploying } = useDeploySampleContract();
  const deployedContracts = useAccountStore((state) => state.deployedContracts);
  const removeDeployedContract = useAccountStore(
    (state) => state.removeDeployedContract
  );

  const handleDeployContract = async () => {
    try {
      await deployContract();
    } catch (error) {
      console.error("Deployment error:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="p-6 bg-white h-full text-gray-800 space-y-4 overflow-y-auto">
      <h2 className="font-semibold text-lg">DEPLOY & RUN TRANSACTIONS</h2>

      <WalletConnectPanel />

      <div>
        <label className="text-sm font-medium">Gas Limit</label>
        <input
          defaultValue="3000000"
          className="w-full border rounded-md px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Value</label>
        <input
          defaultValue="0"
          className="w-full border rounded-md px-3 py-2 mt-1"
        />
      </div>

      <div>
        <ContractSelect />
      </div>

      <button
        onClick={handleDeployContract}
        disabled={isDeploying}
        className={`w-full rounded-md py-2 mt-4 ${
          isDeploying
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-secondary text-white hover:bg-secondary/90"
        }`}
      >
        {isDeploying ? "Deploying..." : "Deploy Contract"}
      </button>

      {/* <div className="border-t mt-6 pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Deployed Contracts</span>
          <span className="text-gray-500 text-sm">{deployedContracts.length}</span>
        </div>

        {deployedContracts.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-4 text-center">
            No contracts deployed yet
          </div>
        ) : (
          <div className="space-y-3">
            {deployedContracts.map((contract) => (
              <div
                key={contract.id}
                className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      Contract Address
                    </div>
                    <div className="text-xs font-mono text-blue-600 break-all">
                      {contract.address}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDeployedContract(contract.id)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                    title="Remove from list"
                  >
                    ×
                  </button>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Transaction Hash</div>
                  <div className="text-xs font-mono text-gray-700 break-all">
                    {formatHash(contract.transactionHash)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Network</div>
                  <div className="text-xs text-gray-700">
                    {contract.networkName} (Chain ID: {contract.chainId})
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">Available Functions</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    {contract.functions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {contract.functions.map((func, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {func}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No functions available</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                  Deployed {formatDistanceToNow(new Date(contract.timestamp), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}

      <div className="border-t mt-6 pt-4 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-800">
            Deployed Contracts
          </span>
          <span className="text-gray-500 text-sm">
            {deployedContracts.length}
          </span>
        </div>

        {deployedContracts.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-6 text-center border border-dashed border-gray-200 rounded-md bg-gray-50">
            No contracts deployed yet
          </div>
        ) : (
          <div className="space-y-4">
            {deployedContracts.map((contract) => (
              <div
                key={contract.id}
                className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500 font-mono break-all">
                        <b>Contract at</b>{" "}
                        <a
                          href={`https://sepolia.etherscan.io/address/${contract.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {formatAddress(contract.address)}
                        </a>{" "}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeployedContract(contract.id)}
                      className="text-gray-400 hover:text-red-500 text-sm px-2 py-1"
                      title="Remove from list"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    {/* <div>
                      <div className="text-gray-600 font-medium mb-0.5">
                        Transaction Hash
                      </div>
                      <div className="font-mono text-gray-700 break-all">
                        {formatHash(contract.transactionHash)}
                      </div>
                    </div> */}
                    <div className="flex gap-2">
                      <div className="text-gray-600 font-medium mb-0.5">
                        Network:
                      </div>
                      <div className="text-blue-700">
                        {contract.networkName} <span>{contract.chainId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      Available Functions
                    </div>

                    {contract.functions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {contract.functions.map((func, idx) => (
                          <button
                            key={idx}
                            className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium rounded transition"
                          >
                            {func}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No functions available
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                    Deployed{" "}
                    {formatDistanceToNow(new Date(contract.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
