export default function DeployPanel() {
    return (
      <div className="p-6 bg-white h-full text-gray-800 space-y-4 overflow-y-auto">
        <h2 className="font-semibold text-lg">DEPLOY & RUN TRANSACTIONS</h2>
  
        <div>
          <label className="text-sm font-medium">Environment</label>
          <select className="w-full border rounded-md px-3 py-2 mt-1">
            <option>Remix VM (Prague)</option>
          </select>
        </div>
  
        <div>
          <label className="text-sm font-medium">Account</label>
          <select className="w-full border rounded-md px-3 py-2 mt-1">
            <option>0x5B3...eddC4 (100 ETH)</option>
          </select>
        </div>
  
        <button className="w-full bg-primary text-white rounded-md py-2">
          + Authorize Delegation
        </button>
  
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
          <label className="text-sm font-medium">Contract</label>
          <input
            placeholder="No compiled contracts"
            className="w-full border rounded-md px-3 py-2 mt-1"
          />
        </div>
  
        <button className="w-full bg-secondary text-white rounded-md py-2 mt-4">
          At Address
        </button>
  
        <div className="border-t mt-6 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Transactions recorded</span>
            <span className="text-gray-500">0</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>Deployed Contracts</span>
            <span className="text-gray-500">0</span>
          </div>
        </div>
      </div>
    );
  }
  