"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAIStore } from "@/store/ai-store"
import { useState } from "react"
import { Key, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const models = ["openai", "gemini", "groq", "deepseek", "anthropic"] as const

type Model = (typeof models)[number]
type KeysType = { [K in Model]?: string }

const modelInfo = {
  openai: { name: "OpenAI GPT", description: "GPT-4 and other OpenAI models", color: "bg-green-100 text-green-800" },
  gemini: { name: "Google Gemini", description: "Google's latest AI model", color: "bg-blue-100 text-blue-800" },
  groq: { name: "Groq", description: "Ultra-fast inference", color: "bg-orange-100 text-orange-800" },
  deepseek: { name: "DeepSeek", description: "Advanced reasoning model", color: "bg-purple-100 text-purple-800" },
  anthropic: { name: "Anthropic Claude", description: "Claude 3.5 Sonnet", color: "bg-indigo-100 text-indigo-800" },
}

export default function SettingsDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const setKey = useAIStore((s) => s.setKey)
  const keys = useAIStore((s) => s.keys as KeysType)
  const [temp, setTemp] = useState<KeysType>({ ...keys })

  const handleSave = () => {
    models.forEach((model) => {
      if (temp[model]) setKey(model, temp[model])
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">API Configuration</DialogTitle>
              <p className="text-sm text-muted-foreground">Configure your API keys to enable AI models</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {models.map((model) => {
            const info = modelInfo[model]
            const hasKey = !!keys[model]
            const hasNewKey = !!temp[model]

            return (
              <div key={model} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {hasKey ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{info.name}</span>
                          <Badge variant="outline" className={`text-xs ${info.color}`}>
                            {hasKey ? "Configured" : "Required"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Input
                  type="password"
                  placeholder={`Enter ${info.name} API key`}
                  value={temp[model] || ""}
                  onChange={(e) => setTemp({ ...temp, [model]: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
