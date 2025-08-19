"use client"

import { useAIStore } from "@/store/ai-store"
import ChatMessages from "@/components/ChatMessages"
import { useEffect } from "react"
import ResponseList from "@/components/ResponseList"
import ModelToggles from "@/components/ModelToggles"

export default function Home() {
  const loadKeys = useAIStore((s) => s.loadKeys)
  const currentChatId = useAIStore((s) => s.currentChatId)

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <h4 className="text-sm font-semibold text-foreground">AI Models</h4>
        </div>
        <ModelToggles horizontal />
      </div>

      {/* Show chat history if there's an active chat */}
      {currentChatId && (
        <div className="animate-in fade-in-0 duration-300">
          <ChatMessages />
        </div>
      )}

      {/* Always show the current AI responses */}
      <div className="animate-in fade-in-0 duration-500">
        <ResponseList />
      </div>
    </div>
  )
}
