export default function CompilerPanel() {
    return (
      <div className="p-6 bg-white h-full text-gray-800 space-y-4">
        <h2 className="font-semibold text-lg">SOLIDITY COMPILER</h2>
  
        <div>
          <label className="text-sm font-medium">COMPILER</label>
          <input
            defaultValue="0.8.30+commit.73712a01"
            className="w-full border rounded-md px-3 py-2 mt-1"
          />
        </div>
  
        <div className="flex flex-col space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Include nightly builds
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Auto compile
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Hide warnings
          </label>
        </div>
  
        <h3 className="font-medium mt-4">Advanced Configurations</h3>
  
        <button className="w-full bg-primary text-white rounded-md py-2 mt-2">
          ⟳ Compile .prettierrc.json
        </button>
        <button className="w-full bg-secondary text-white rounded-md py-2">
          Compile and Run Script
        </button>
      </div>
    );
  }
  