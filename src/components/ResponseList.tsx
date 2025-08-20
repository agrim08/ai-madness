"use client"

import { useAIStore } from "@/store/ai-store"
import { useEffect, useState } from "react"
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { createAnthropic } from "@ai-sdk/anthropic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, AlertCircle, Bot, MessageSquare, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StreamingResponse {
  model: string
  content: string
  isLoading: boolean
  error: string | null
  finished: boolean
}

export default function ResponseList() {
  const { prompt, keys, activeModels, addResponse, getCurrentChat, currentChatId } = useAIStore()
  const [streamingResponses, setStreamingResponses] = useState<Record<string, StreamingResponse>>({})
  const [currentPrompt, setCurrentPrompt] = useState<string>("")

  const getModelInstance = (model: string, apiKey: string) => {
    switch (model) {
      case "openai":
        return createOpenAI({ apiKey })("gpt-4o-mini")
      case "gemini":
        return createGoogleGenerativeAI({ apiKey })("gemini-2.5-flash")
      case "groq":
        return createGroq({ apiKey })("meta-llama/llama-4-scout-17b-16e-instruct")
      case "deepseek":
        return createOpenAI({
          apiKey,
          baseURL: "https://api.deepseek.com/v1",
        })("deepseek-chat")
      case "anthropic":
        return createAnthropic({ apiKey })("claude-3-5-sonnet-20241022")
      default:
        throw new Error(`Unknown model: ${model}`)
    }
  }

  const streamFromModel = async (model: string, apiKey: string, messages: Array<{ role: string; content: string }>) => {
    const responseId = `${model}-${Date.now()}`

    // Initialize streaming state
    setStreamingResponses((prev) => ({
      ...prev,
      [model]: {
        model,
        content: "",
        isLoading: true,
        error: null,
        finished: false,
      },
    }))

    try {
      const modelInstance = getModelInstance(model, apiKey)

      const { textStream } = await streamText({
        model: modelInstance,
        messages: messages.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })),
      })

      let fullContent = ""

      for await (const textPart of textStream) {
        fullContent += textPart

        setStreamingResponses((prev) => ({
          ...prev,
          [model]: {
            ...prev[model],
            content: fullContent,
            isLoading: true,
            error: null,
            finished: false,
          },
        }))
      }

      // Mark as finished and save to store
      setStreamingResponses((prev) => ({
        ...prev,
        [model]: {
          ...prev[model],
          content: fullContent,
          isLoading: false,
          finished: true,
        },
      }))

      // Add to persistent store
      addResponse({
        id: responseId,
        prompt: messages[messages.length - 1]?.content || "", // Get the last user message
        model: model as any,
        content: fullContent,
        createdAt: Date.now(),
      })

      setTimeout(() => {
        setStreamingResponses((prev) => {
          const newResponses = { ...prev }
          delete newResponses[model]
          return newResponses
        })
      }, 1000) // 1 second delay to show completion state briefly
    } catch (error) {
      console.error(`Error streaming from ${model}:`, error)
      setStreamingResponses((prev) => ({
        ...prev,
        [model]: {
          model,
          content: "",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
          finished: true,
        },
      }))
    }
  }

  useEffect(() => {
    if (!prompt.trim() || !currentChatId) return

    if (prompt === currentPrompt) return
    setCurrentPrompt(prompt)

    // Get current chat and build conversation context
    const currentChat = getCurrentChat()
    if (!currentChat) return

    // Convert chat messages to AI SDK format
    const conversationMessages = currentChat.messages.map((msg) => ({
      // Ensure role is one of "user", "assistant", or "system"
      role: msg.role === "user" || msg.role === "assistant" || msg.role === "system" ? msg.role : "user",
      content: msg.content,
    }))

    // Clear previous responses
    setStreamingResponses({})

    // Start streaming from all active models
    Object.entries(activeModels).forEach(([model, isActive]) => {
      if (isActive && keys[model as keyof typeof keys]) {
        streamFromModel(model, keys[model as keyof typeof keys]!, conversationMessages)
      }
    })
  }, [prompt, activeModels, keys, currentChatId, currentPrompt])

  useEffect(() => {
    setStreamingResponses({})
    setCurrentPrompt("")
  }, [currentChatId])

  const activeModelsList = Object.entries(activeModels)
    .filter(([_, isActive]) => isActive)
    .map(([model]) => model)

  const hasActiveStreams = Object.values(streamingResponses).some(
    (response) => response.isLoading || !response.finished,
  )
  const shouldShowResponses = !currentChatId || hasActiveStreams || Object.keys(streamingResponses).length > 0

  if (!prompt.trim() || !currentChatId) {
    return (
      <div className="text-center py-16">
        {!currentChatId ? (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">Multi-Model AI Playground</h2>
              <p className="text-muted-foreground leading-relaxed">
                Start a new conversation to compare responses from different AI models in real-time
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-sm mx-auto">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Type your message to see AI responses</p>
          </div>
        )}
      </div>
    )
  }

  if (activeModelsList.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-orange-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">No Models Selected</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Enable at least one AI model in settings and make sure your API keys are configured
          </p>
        </div>
      </div>
    )
  }

  if (!shouldShowResponses) {
    return null
  }

  const getModelConfig = (model: string) => {
    const configs = {
      openai: { 
        color: "bg-green-600", 
        borderColor: "border-green-200",
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        name: "OpenAI"
      },
      gemini: { 
        color: "bg-blue-600", 
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        name: "Gemini"
      },
      groq: { 
        color: "bg-orange-600", 
        borderColor: "border-orange-200",
        bgColor: "bg-orange-50",
        textColor: "text-orange-800",
        name: "Groq"
      },
      deepseek: { 
        color: "bg-purple-600", 
        borderColor: "border-purple-200",
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        name: "DeepSeek"
      },
      anthropic: { 
        color: "bg-indigo-600", 
        borderColor: "border-indigo-200",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-800",
        name: "Claude"
      },
    }
    return configs[model as keyof typeof configs] || { 
      color: "bg-gray-600", 
      borderColor: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      name: model.charAt(0).toUpperCase() + model.slice(1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-semibold text-foreground">AI Responses</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparing responses from {activeModelsList.length} model{activeModelsList.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {activeModelsList.map((model) => {
          const response = streamingResponses[model]
          const hasKey = keys[model as keyof typeof keys]
          const config = getModelConfig(model)

          if (!hasKey) return null

          return (
            <Card
              key={model}
              className={`w-full transition-all duration-200 hover:shadow-md ${config.borderColor} border-l-4`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{config.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {response?.isLoading && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Generating...</span>
                      </div>
                    )}
                    {response?.error && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Error</span>
                      </div>
                    )}
                    {response?.finished && !response?.error && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Complete</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {response?.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800 font-medium mb-2">Failed to generate response</div>
                    <div className="text-red-600 text-sm">{response.error}</div>
                  </div>
                ) : response?.content ? (
                  <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
                    <div className={`${config.textColor} leading-relaxed whitespace-pre-wrap text-sm`}>
                      {response.content}
                      {response.isLoading && (
                        <span className={`inline-block w-2 h-5 ${config.color} animate-pulse ml-1 rounded-sm`} />
                      )}
                    </div>
                  </div>
                ) : response?.isLoading ? (
                  <div className={`${config.bgColor} rounded-lg p-6 text-center border ${config.borderColor}`}>
                    <Loader2 className={`h-6 w-6 animate-spin mx-auto mb-3 ${config.textColor}`} />
                    <div className={`${config.textColor} font-medium`}>Generating response...</div>
                    <div className={`${config.textColor} opacity-70 text-sm mt-1`}>This may take a few moments</div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse mx-auto mb-2"></div>
                    <span className="text-gray-600 text-sm">Waiting to start...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}