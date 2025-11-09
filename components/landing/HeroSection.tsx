"use client"

import PromptBar, { PromptBarHandle } from "./PromptBar"
import IdeaChips from "./IdeaChips"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useProjectStore, useAuthStore, useFileStore } from "@/hooks/stores"

import { promptIdeas } from "@/hooks/promptIdeas"

export default function Hero() {
  const promptBarRef = useRef<PromptBarHandle | null>(null)
  const router = useRouter()
  const addProject = useProjectStore((s) => s.addProject)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const fetchProjectFiles = useFileStore((s) => s.fetchProjectFiles)
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (idea: string) => {
    if (isCreating || authLoading) return

    setIsCreating(true)
    try {
      
      if (!isAuthenticated) {
        console.error("Authentication failed")
        setIsCreating(false)
        return
      }

      // Create project with "Untitled Project N" naming
      const project = addProject(idea)
      
      // Set as active project
      setActiveProject(project.id)
      
      // Fetch files from backend after user is authenticated
      await fetchProjectFiles(project.id, idea)
      
      // Navigate to app dashboard
      router.push("/app")
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePillClick = (idea: string) => {
    const prompt = promptIdeas.find((p) => p.name === idea)?.prompt
    promptBarRef.current?.setIdeaAndFocus(prompt)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient and patterns */}
      
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/50 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary rounded-full blur-2xl" />
      
      <div className="container relative mx-auto md:h-[95vh] min-h-[80vh] px-4 py-16 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            Build and Deploy <span className="text-secondary">Smart Contracts</span> 3x Faster
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground text-balance mb-12">
            Your go-to playground for smart contract development.
          </p>

          {/* Enhanced PromptBar with highlighted background */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-sm" />
            <div className="relative">
              <PromptBar 
                ref={promptBarRef} 
                onSubmit={handleSubmit}
                disabled={isCreating || authLoading}
              />
            </div>
          </div>

          {/* Enhanced IdeaChips with better styling */}
          <div className="relative">
            <IdeaChips 
              ideas={promptIdeas.map((idea) => idea.name)} 
              onIdeaClick={handlePillClick} 
              className="gap-3"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
