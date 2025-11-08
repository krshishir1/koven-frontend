"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Plus, SlidersHorizontal, Send, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // if (e.key === "Enter" && !e.shiftKey) {
    //     setInput((prev) => `${prev}\n`)
    // }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
      setRows(Math.min(Math.ceil(newHeight / 24), 5));
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
      setRows(1);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="flex h-full gap-2">
      <div className="px-3 w-full rounded-md bg-white shadow-lg border-0 border-primary flex flex-col">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Describe modifications in smart contract..."
          className="flex-1 pt-3 pb-1 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none resize-none"
          rows={rows}
          disabled={isLoading}
          aria-label="Chat message input"
          aria-describedby="chat-input-help"
        />

        <div className="flex justify-between items-center gap-3 pb-2">
          {/* Left Icons */}
          <div className="flex items-center gap-1 text-gray-700">
            <button className="w-8 h-8 px-2 rounded-md text-muted-foreground">
              <Plus className="w-4 h-4 cursor-pointer hover:text-primary" />
            </button>

            <button className="w-8 h-8 px-2 rounded-md text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4 cursor-pointer hover:text-primary" />
            </button>
          </div>

          {/* Right Shortcut Indicator */}
          <div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="self-end bg-secondary"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </div>
      {/* <div id="chat-input-help" className="sr-only">
        Press Enter to send, Shift+Enter for new line
      </div> */}
    </div>
  );
}
