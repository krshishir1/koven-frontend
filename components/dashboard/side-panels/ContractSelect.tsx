"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ContractSelectProps {
  files?: string[]; // e.g. ["MyToken.sol", "NFT.sol", "DAO.sol"]
  onSelect?: (file: string) => void;
}

export default function ContractSelect({ files = [], onSelect }: ContractSelectProps) {
  const [selected, setSelected] = useState<string>("");

  const handleChange = (value: string) => {
    setSelected(value);
    onSelect?.(value);
  };

  // Example: If you plan to fetch files dynamically later
  useEffect(() => {
    if (!selected && files.length > 0) {
      setSelected(files[0]);
    }
  }, [files]);

  return (
    <div className="w-full">
      <Label className="text-sm font-medium text-gray-700">Contract</Label>

      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-1 focus:ring-gray-400">
          <SelectValue placeholder="Select a Solidity contract" />
        </SelectTrigger>

        <SelectContent>
          {files.length > 0 ? (
            files.map((file) => (
              <SelectItem key={file} value={file}>
                {file}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No Solidity files found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
