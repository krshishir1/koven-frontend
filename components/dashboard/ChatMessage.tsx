"use client";

import { Loader2 } from "lucide-react";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    isLoading?: boolean;
  };
}

function showTimestamp(timestamp: Date) {
  const str = formatDistanceToNowStrict(timestamp, { addSuffix: true });
  return str
    .replace("seconds", "secs")
    .replace("second", "sec")
    .replace("minutes", "mins")
    .replace("minute", "min")
    .replace("hours", "hrs")
    .replace("hour", "hr")
    .replace("days", "days")
    .replace("day", "day");
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? "bg-primary text-white rounded-br-none"
            : "bg-white text-muted-foreground border rounded-bl-none"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {message.isLoading && (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Thinking...</span>
          </div>
        )}
        <div className="text-xs opacity-50 mt-2">
          {showTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
