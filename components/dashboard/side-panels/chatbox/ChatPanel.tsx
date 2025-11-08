"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useProjectStore } from "@/hooks/stores";
import { useFileStore } from "@/hooks/stores"; // 1. Import the file store

interface ChatPanelProps {
  initialMessage?: string | null;
  projectId: string;
}

export default function ChatPanel({
  initialMessage,
  projectId,
}: ChatPanelProps) {
  // --- Project Store (for chat messages) ---
  const chats = useProjectStore((s) => s.chatsByProjectId[projectId] ?? []);
  const addChatMessage = useProjectStore((s) => s.addChatMessage);
  const hasRunRef = useRef(false); // To handle initial message

  // --- File Store (for AI API calls) ---
  const {
    fetchProjectFiles, // 2. Get the REAL generation function
    modifyProjectFiles, // 3. Get the REAL modify function
    artifactIdsByProjectId,
    selectedFilePath,
    isLoading, // 4. Use the REAL isLoading state from the store
  } = useFileStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 5. REAL useEffect for GENERATION ---
  // This now calls your /api/ai/generate endpoint
  useEffect(() => {
    if (hasRunRef.current) return;
    if (!initialMessage) return;
    if (chats.length >= 2) return; // Already generated

    hasRunRef.current = true;

    const runGeneration = async () => {
      // Add user message
      if (chats.length === 0) {
        addChatMessage(projectId, { role: "user", content: initialMessage });
      }
      
      addChatMessage(projectId, {
        role: "assistant",
        content: "Generating your smart contract... This may take a moment.",
      });

      try {
        // Call the REAL API
        await fetchProjectFiles(projectId, initialMessage);
        
        addChatMessage(projectId, {
          role: "assistant",
          content: "Your project is ready! Check the files on the left.",
        });
      } catch (err: any) {
        addChatMessage(projectId, {
          role: "assistant",
          content: `Generation failed: ${err.message}`,
        });
      }
    };

    runGeneration();
  }, [initialMessage, chats.length, addChatMessage, projectId, fetchProjectFiles]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // --- 6. REAL handleSendMessage for MODIFICATION ---
  // This now calls your /api/ai/modify endpoint
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return; // Check against store's isLoading

    const artifactId = artifactIdsByProjectId[projectId];
    const selectedFile = selectedFilePath;

    // This was your problem: artifactId was missing
    if (!artifactId) {
      addChatMessage(projectId, {
        role: "assistant",
        content: "Error: Project artifact ID not found. Cannot make changes."
      });
      return; // This is why no network call happened
    }

    // Add the user's message to the chat
    addChatMessage(projectId, { role: "user", content });

    // Call the real API
    try {
      // The fileStore will set isLoading = true
      await modifyProjectFiles(projectId, content, selectedFile || undefined);

      // On success, add a new message
      addChatMessage(projectId, {
        role: "assistant",
        content: "I've applied your changes to the files.",
      });

    } catch (err: any) {
      // On failure, add an error message
      addChatMessage(projectId, {
        role: "assistant",
        content: `An error occurred: ${err.message}`,
      });
    }
    // The fileStore will set isLoading = false
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-muted overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {/* ... */}
          </div>
        ) : (
          <>
            {chats.map((message) => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role as any,
                  content: message.content,
                  timestamp: new Date(message.timestamp),
                }}
              />
            ))}
            
            {/* Shows a "Thinking..." bubble while API is loading */}
            {isLoading && (
              <ChatMessage
                message={{
                  id: "loading",
                  role: "assistant",
                  content: "", // Content is handled by the isLoading flag
                  timestamp: new Date(),
                  isLoading: true, // This will show the "Thinking..."
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="h-36 pb-4 px-2">
        {/* 7. Pass the REAL isLoading state to the input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}