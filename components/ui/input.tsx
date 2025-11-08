import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

const Input = React.forwardRef<HTMLTextAreaElement, InputProps>(
  ({ className, error, onKeyDown, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="relative rounded-xl border border-border bg-card shadow-lg overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:ring-neutral-800/60 transition-all">
          <textarea
            className={cn(
              "w-full px-6 py-5 pr-32 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[120px] md:min-h-[140px] text-base md:text-lg",
              className
            )}
            ref={ref}
            onKeyDown={onKeyDown}
            {...props}
          />
        </div>
        {/* {error && (
          <p className="text-destructive text-sm mt-2 text-left">{error}</p>
        )} */}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
