"use client";

import type React from "react";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

import { Plus, SlidersHorizontal, Send, ArrowUp } from "lucide-react";

interface PromptBarProps {
  onSubmit: (idea: string) => void;
  placeholder?: string;
  className?: string;
}

export interface PromptBarHandle {
  setIdeaAndFocus: (value: string) => void;
}

const PromptBar = forwardRef<PromptBarHandle, PromptBarProps>(function PromptBar(
  { onSubmit, placeholder = "Describe your miniapp", className = "" },
  ref
) {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => ({
    setIdeaAndFocus: (value: string) => {
      setIdea(value);
      setError("");
      // Focus the textarea and move caret to end
      if (inputRef.current) {
        const el = inputRef.current;
        el.focus();
        const length = value.length;
        el.setSelectionRange?.(length, length);
      }
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idea.trim()) {
      setError("Tell us your idea to get started.");
      return;
    }

    setError("");
    onSubmit(idea);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleIdeaChange = (value: string) => {
    setIdea(value);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-8 ${className}`}>
      <div className="relative max-w-3xl mx-auto">
        <div className="relative">
          <Input
            value={idea}
            onChange={(e) => handleIdeaChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            error={error}
            ref={inputRef}
            className="md:pb-16"
          />
          {/* Overlay actions on md+ */}
          <div className="hidden md:block absolute w-full px-6 bottom-4 right-0">
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 flex items-center gap-1 text-gray-700">
                <button className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted">
                  <Plus strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>

                <button className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted">
                  <SlidersHorizontal
                    strokeWidth={2.5}
                    className="w-4 cursor-pointer"
                  />
                </button>
              </div>
              <div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                >
                  Generate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Stacked actions on small screens */}
          <div className="md:hidden mt-3 px-1">
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 flex items-center gap-1 text-gray-700">
                <button className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted">
                  <Plus strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>

                <button className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted">
                  <SlidersHorizontal
                    strokeWidth={2.5}
                    className="w-4 cursor-pointer"
                  />
                </button>
              </div>
              <div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                >
                  Generate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <p className="text-destructive text-sm mt-2 text-left">{error}</p>
        )}
      </div>
    </form>
  );
});

export default PromptBar;
