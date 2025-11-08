"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type PublishStatus = "draft" | "published" | "error";

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: PublishStatus
  onStatusChange: (status: PublishStatus) => void
}

export default function PublishModal({ open, onOpenChange, status, onStatusChange }: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const { toast } = useToast()

  const handlePublish = async () => {
    setIsPublishing(true)
    // Simulate publishing
    setTimeout(() => {
      setIsPublishing(false)
      onStatusChange("published")
      toast({
        title: "Miniapp published",
        description: "Your miniapp is now live on Farcaster",
      })
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Miniapp</DialogTitle>
          <DialogDescription>Deploy your miniapp to Farcaster and start earning $MINI</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            {/* <div>
              <div className="text-sm text-muted-foreground mb-1">Current Status</div>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                {status === "draft" && "Draft"}
                {status === "preview-ready" && "Preview Ready"}
                {status === "published" && "Published"}
              </div>
            </div> */}

            <div>
              <div className="text-sm text-muted-foreground mb-2">Deployment Details</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-medium">Base Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="font-mono text-xs">0x1234...5678</span>
                </div>
              </div>
            </div>
          </div>

          {status !== "published" && (
            <Button onClick={handlePublish} disabled={isPublishing} className="w-full bg-primary hover:bg-primary/90">
              {isPublishing ? "Publishing..." : "Publish Now"}
            </Button>
          )}

          {status === "published" && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-sm text-green-700 dark:text-green-300">
              Your miniapp is live and earning rewards!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
