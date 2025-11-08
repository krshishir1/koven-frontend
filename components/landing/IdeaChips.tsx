"use client"

interface IdeaChipsProps {
  ideas: string[]
  onIdeaClick: (idea: string) => void
  label?: string
  className?: string
}

export default function IdeaChips({ 
  ideas, 
  onIdeaClick, 
  label = "Popular:",
  className = ""
}: IdeaChipsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      {ideas.map((idea) => (
        <button
          key={idea}
          onClick={() => onIdeaClick(idea)}
          className="px-4 py-2 rounded-full bg-muted border border-transparent hover:border-neutral-400 text-sm font-medium text-foreground transition-colors"
        >
          {idea}
        </button>
      ))}
    </div>
  )
}
