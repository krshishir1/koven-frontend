"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/stores";
import DashboardLayout from "@/components/DashboardLayout"; // Your layout

// ✅ Import the stores needed to trigger the AI flow
import { useProjectStore, useFileStore } from "@/hooks/stores";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isAuthChecked } = useAuthStore();
  
  // ✅ Get the AI flow actions
  const addProject = useProjectStore((s) => s.addProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const fetchProjectFiles = useFileStore((s) => s.fetchProjectFiles);
  
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);

  // --- Effect 1: Handle Protection ---
  useEffect(() => {
    // If auth is checked and user is NOT logged in, redirect to home
    if (isAuthChecked && !isAuthenticated) {
      // router.replace("/");
    }
  }, [isAuthChecked, isAuthenticated, router]);

  // --- Effect 2: Handle the Pending Prompt Flow ---
  useEffect(() => {
    // Only run this if the user is authenticated
    if (!isAuthenticated) return;

    const pendingPrompt = sessionStorage.getItem("pendingPrompt");

    if (pendingPrompt) {
      // We found a prompt. User just logged in.
      sessionStorage.removeItem("pendingPrompt"); // Clear it
      setIsProcessingPrompt(true);

      // This is your logic from Hero.tsx, now running *after* login
      const handlePrompt = async (idea: string) => {
        console.log("Processing pending prompt:", idea);
        try {
          const project = addProject(idea);
          setActiveProject(project.id);
          // ✅ This is where you call your AI API
          await fetchProjectFiles(project.id, idea); 
          // You can add a toast or other feedback here
        } catch (error) {
          console.error("Failed to create project from pending prompt:", error);
        } finally {
          setIsProcessingPrompt(false);
        }
      };

      handlePrompt(pendingPrompt);
    }
  }, [isAuthenticated, addProject, setActiveProject, fetchProjectFiles]); // Run when auth status changes

  // --- Render Logic ---
  
  // Show a global loading screen while checking session
  if (!isAuthChecked) {
    return <div className="flex items-center justify-center h-screen">Checking your session...</div>;
  }
  
  // If not authenticated, we're redirecting, so render nothing
  if (!isAuthenticated) {
    return null;
  }

  // If processing a new prompt, show a specific loading state
  if (isProcessingPrompt) {
    return <div className="flex items-center justify-center h-screen">Generating your smart contract...</div>;
  }

  // ✅ User is authenticated and not processing a new prompt
  return <DashboardLayout />;
}