export default function SearchPanel() {
    return (
      <div className="p-6 bg-white h-full space-y-4 text-gray-800">
        <h2 className="font-semibold text-lg">SEARCH IN FILES</h2>
  
        <input
          placeholder="Type to search"
          className="w-full border rounded-md px-3 py-2"
        />
  
        <div>
          <label className="text-sm font-medium">Files to include</label>
          <input
            defaultValue="*.sol, *.js"
            className="w-full border rounded-md px-3 py-2 mt-1"
          />
        </div>
  
        <div>
          <label className="text-sm font-medium">Files to exclude</label>
          <input
            defaultValue=".*/**/*"
            className="w-full border rounded-md px-3 py-2 mt-1"
          />
        </div>
      </div>
    );
  }
  