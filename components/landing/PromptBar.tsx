"use client";

import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  FormEvent,
  KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Plus, SlidersHorizontal } from "lucide-react";
import { useAuthStore } from "@/hooks/stores";


interface PromptBarProps {
  onSubmit: (idea: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface PromptBarHandle {
  setIdeaAndFocus: (value: string) => void;
}

const PromptBar = forwardRef<PromptBarHandle, PromptBarProps>(function PromptBar(
  { onSubmit, placeholder = "Describe your miniapp", className = "", disabled = false },
  ref
) {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Zustand store hooks
  const { checkAuth, login, isLoading: authLoading } = useAuthStore();

  useImperativeHandle(ref, () => ({
    setIdeaAndFocus: (value: string) => {
      setIdea(value);
      setError("");
      if (inputRef.current) {
        const el = inputRef.current;
        el.focus();
        const length = value.length;
        el.setSelectionRange?.(length, length);
      }
    },
  }));

  // ✅ Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (disabled || authLoading) return;

    if (!idea.trim()) {
      setError("Tell us your idea to get started.");
      return;
    }

    setError("");

    // ✅ Step 1: Check backend Auth0 session
    const authenticated = await checkAuth();

    if (!authenticated) {
      // ✅ Step 2: Redirect to backend login route
      const encodedIdea = encodeURIComponent(idea);
      window.location.href = `http://localhost:8000/login?returnTo=http://localhost:3000/app?idea=${encodedIdea}`;
      return;
    }

    // ✅ Step 3: User is authenticated — trigger parent submit handler
    onSubmit(idea);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
            ref={inputRef}
            className="md:pb-16"
            disabled={disabled || authLoading}
          />

          {/* Overlay actions on md+ */}
          <div className="hidden md:block absolute w-full px-6 bottom-4 right-0">
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 flex items-center gap-1 text-gray-700">
                <button
                  type="button"
                  className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted"
                >
                  <Plus strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>

                <button
                  type="button"
                  className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted"
                >
                  <SlidersHorizontal strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>
              </div>
              <div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                  disabled={disabled || authLoading}
                >
                  {disabled || authLoading ? "Checking..." : "Generate"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stacked actions on small screens */}
          <div className="md:hidden mt-3 px-1">
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 flex items-center gap-1 text-gray-700">
                <button
                  type="button"
                  className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted"
                >
                  <Plus strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>

                <button
                  type="button"
                  className="w-8 h-8 px-2 rounded-md text-muted-foreground hover:bg-muted"
                >
                  <SlidersHorizontal strokeWidth={2.5} className="w-4 cursor-pointer" />
                </button>
              </div>
              <div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                  disabled={disabled || authLoading}
                >
                  {disabled || authLoading ? "Checking..." : "Generate"}
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
