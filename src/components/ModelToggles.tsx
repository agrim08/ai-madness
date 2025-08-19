"use client"

import { useAIStore } from "@/store/ai-store"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

const models = ["openai", "gemini", "groq", "deepseek", "anthropic"] as const

const modelInfo = {
  openai: { name: "OpenAI", color: "bg-green-100 text-green-800 border-green-200" },
  gemini: { name: "Gemini", color: "bg-blue-100 text-blue-800 border-blue-200" },
  groq: { name: "Groq", color: "bg-orange-100 text-orange-800 border-orange-200" },
  deepseek: { name: "DeepSeek", color: "bg-purple-100 text-purple-800 border-purple-200" },
  anthropic: { name: "Anthropic", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
}

interface ModelTogglesProps {
  horizontal?: boolean
}

export default function ModelToggles({ horizontal = false }: ModelTogglesProps) {
  const { keys, activeModels, toggleModel } = useAIStore()

  if (horizontal) {
    return (
      <div className="flex flex-wrap gap-3">
        {models.map((model) => {
          const hasKey = !!keys[model]
          const isActive = activeModels[model] || false
          const info = modelInfo[model]

          return (
            <div
              key={model}
              className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                {hasKey ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-400" />
                )}
                <span className="font-medium text-xs">{info.name}</span>
                {isActive && hasKey && (
                  <Badge variant="secondary" className={`text-xs px-1 py-0 ${info.color}`}>
                    Active
                  </Badge>
                )}
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => toggleModel(model, v)}
                disabled={!hasKey}
                className="data-[state=checked]:bg-primary scale-75"
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Original vertical layout
  return (
    <div className="space-y-3">
      {models.map((model) => {
        const hasKey = !!keys[model]
        const isActive = activeModels[model] || false
        const info = modelInfo[model]

        return (
          <div key={model} className="group">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {hasKey ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="font-medium text-sm">{info.name}</span>
                </div>
                {isActive && hasKey && (
                  <Badge variant="secondary" className={`text-xs ${info.color}`}>
                    Active
                  </Badge>
                )}
              </div>

              <Switch
                checked={isActive}
                onCheckedChange={(v) => toggleModel(model, v)}
                disabled={!hasKey}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {!hasKey && <p className="text-xs text-muted-foreground mt-1 ml-3">API key required</p>}
          </div>
        )
      })}
    </div>
  )
}
