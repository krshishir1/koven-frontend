"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProjectHeaderProps {
  projectId: string
}

export default function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const [copied, setCopied] = useState(false)
  const projectUrl = `https://app.minidev.fun/project/${projectId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(projectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-b border-border px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Music Launchpad</h1>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{projectUrl}</code>
        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
