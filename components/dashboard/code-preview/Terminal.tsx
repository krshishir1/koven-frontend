"use client";
import { useEffect, useRef } from "react";
import { useTerminalStore } from "@/hooks/stores";
import { cn } from "@/lib/utils"; // optional utility if you have a className merge helper

export default function Terminal() {
  const logs = useTerminalStore((state) => state.logs);
  const addLog = useTerminalStore((state) => state.addLog);
  const clearLogs = useTerminalStore((state) => state.clearLogs);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      const command = inputRef.current.value.trim();
      if (!command) return;

      addLog(`$ ${command}`, "info");
      inputRef.current.value = "";

      // handle basic commands
      if (command === "clear") {
        clearLogs();
      } else {
        addLog(`Command not recognized: ${command}`, "warning");
      }
    }
  };

  const getLogStyles = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-700 border border-green-200 rounded-md px-3 py-1";
      case "error":
        return "bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-1";
      case "warning":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md px-3 py-1";
      default:
        return "text-gray-800 px-2";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Logs Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 font-mono text-sm bg-gray-100">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No logs yet. Type a command below.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "transition-all duration-150 ease-in-out",
                getLogStyles(log.type)
              )}
            >
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
        <span className="text-blue-600 font-semibold select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 py-1"
          placeholder="Enter command..."
        />
        <button
          onClick={() => clearLogs()}
          className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
