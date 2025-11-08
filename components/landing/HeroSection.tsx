"use client"

import PromptBar, { PromptBarHandle } from "./PromptBar"
import IdeaChips from "./IdeaChips"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useProjectStore, useAuthStore, useFileStore } from "@/hooks/stores"

const IDEA_PILLS = ["Launchpad", "Betting Game", "Quiz"]

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

  const handlePillClick = (pill: string) => {
    const idea = `Create a ${pill.toLowerCase()} for music artist tokens`
    promptBarRef.current?.setIdeaAndFocus(idea)
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Build viral <span className="text-black">miniapps</span> on <span className="text-secondary">Farcaster</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground text-balance mb-12">
            Create miniapps with a single prompt—no coding required.
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
              ideas={IDEA_PILLS} 
              onIdeaClick={handlePillClick} 
              className="gap-3"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
