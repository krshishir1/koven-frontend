"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useProjectStore } from "@/hooks/stores";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatPanelProps {
  initialMessage?: string | null;
  projectId: string;
}

export default function ChatPanel({
  initialMessage,
  projectId,
}: ChatPanelProps) {
  const chats = useProjectStore((s) => s.chatsByProjectId[projectId] ?? []);
  const addChatMessage = useProjectStore((s) => s.addChatMessage);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    if (!initialMessage) return;
    if (chats.length >= 2) return;

    hasRunRef.current = true;

    // If chat is empty, seed the user message; always simulate assistant
    if (chats.length === 0) {
      addChatMessage(projectId, { role: "user", content: initialMessage });
    }
    setTimeout(() => {
      addChatMessage(projectId, {
        role: "assistant",
        content:
          "Building your miniapp... This will take a moment as we generate the smart contracts, UI, and deploy everything.",
      });
      setIsLoading(true);
      setTimeout(() => {
        addChatMessage(projectId, {
          role: "assistant",
          content: "Your miniapp is ready! Check the preview on the right.",
        });
        setIsLoading(false);
      }, 3000);
    }, 500);
  }, [initialMessage, chats.length, addChatMessage, projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    addChatMessage(projectId, { role: "user", content });
    setIsLoading(true);
    setTimeout(() => {
      addChatMessage(projectId, {
        role: "assistant",
        content: "I'm processing your request and updating the miniapp...",
      });
      setTimeout(() => {
        addChatMessage(projectId, {
          role: "assistant",
          content: "Updates applied! Your miniapp has been refreshed.",
        });
        setIsLoading(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-muted overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Start by describing your miniapp idea</p>
            </div>
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="h-36 pb-4 px-2">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* <div className="border-t border-border p-4 bg-muted">
        <div className="bg-card rounded-xl border border-border shadow-sm h-20 flex items-center px-3">
        </div>
      </div> */}
    </div>
  );
}
