"use client"

import type React from "react"

import { useAIStore } from "@/store/ai-store"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"

export default function PromptInput() {
  const { setPrompt } = useAIStore()
  const [localPrompt, setLocalPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localPrompt.trim()) return

    setIsSubmitting(true)
    setPrompt(localPrompt)

    // Reset after a short delay to show feedback
    setTimeout(() => {
      setIsSubmitting(false)
      setLocalPrompt("")
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        <h3 className="text-sm font-semibold text-foreground">Start a new chat / Choose an existing one</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Type your prompt here... (e.g., 'Explain quantum computing')"
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="pr-4 py-3 text-base border-2 focus:border-primary/50 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={!localPrompt.trim() || isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:bg-black text-white cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
