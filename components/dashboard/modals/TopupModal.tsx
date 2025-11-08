"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface TopUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOPUP_AMOUNTS = [10, 25, 50, 100]

export default function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleTopUp = async () => {
    if (!selectedAmount) return

    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Top-up successful",
        description: `Added $${selectedAmount} to your account`,
      })
      onOpenChange(false)
      setSelectedAmount(null)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Account</DialogTitle>
          <DialogDescription>Add funds to your Minidev account to deploy miniapps</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {TOPUP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  selectedAmount === amount ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold text-foreground">${amount}</div>
              </button>
            ))}
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between mb-2">
                <span>Amount:</span>
                <span className="font-semibold text-foreground">${selectedAmount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee:</span>
                <span className="font-semibold text-foreground">$0</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleTopUp}
            disabled={!selectedAmount || isProcessing}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isProcessing ? "Processing..." : "Complete Top Up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
