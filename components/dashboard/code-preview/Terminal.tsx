// Terminal.tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function Terminal() {
  const [output, setOutput] = useState<string[]>([
    "Welcome to Remix-like IDE ⚡",
    "Run: compile or deploy your contract...",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      const command = inputRef.current.value;
      setOutput((prev) => [...prev, `$ ${command}`]);
      inputRef.current.value = "";
      
      // Handle commands
      if (command.trim() === "clear") {
        setOutput([]);
      }
    }
  };

  return (
    <div className="h-40 bg-gray-900 text-green-400 font-mono text-sm border-t flex flex-col">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="border-t border-gray-700 p-2 flex items-center gap-2">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-green-400 outline-none"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}
