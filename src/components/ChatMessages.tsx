"use client"

import { useAIStore } from "@/store/ai-store"
import { Card, CardContent } from "@/components/ui/card"
import { User, Bot, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

export default function ChatMessages() {
  const { getCurrentChat, currentChatId } = useAIStore()

  const currentChat = getCurrentChat()

  if (!currentChatId || !currentChat) {
    return null
  }

  if (currentChat.messages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Chat Started</h3>
          <p className="text-muted-foreground">Ask a question to begin the conversation with your selected models</p>
        </div>
      </div>
    )
  }

  // Group assistant messages by timestamp to show all model responses together
  const groupedMessages: Array<{
    user?: (typeof currentChat.messages)[0]
    assistants: typeof currentChat.messages
  }> = []

  currentChat.messages.forEach((message) => {
    if (message.role === "user") {
      groupedMessages.push({
        user: message,
        assistants: [],
      })
    } else if (message.role === "assistant" && groupedMessages.length > 0) {
      const lastGroup = groupedMessages[groupedMessages.length - 1]
      lastGroup.assistants.push(message)
    }
  })

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
        color: "bg-purple-600", 
        borderColor: "border-purple-200",
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
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
      name: model ? model.charAt(0).toUpperCase() + model.slice(1) : "AI"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-foreground">Conversation History</h2>
          <Badge variant="secondary" className="text-xs">
            {currentChat.messages.filter((m) => m.role === "user").length} prompts
          </Badge>
        </div>
      </div>

      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* User Message */}
          {group.user && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-2.5 flex-shrink-0 shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-indigo-900">You</span>
                      <span className="text-xs text-indigo-600/70 bg-indigo-100 px-2 py-1 rounded-full">
                        {formatDistanceToNow(group.user.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-blue-900/90 leading-relaxed whitespace-pre-wrap">{group.user.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assistant Messages - Now in Rows */}
          {group.assistants.length > 0 && (
            <div className="space-y-3 ml-4">
              {group.assistants.map((message) => {
                const config = getModelConfig(message.model || "")
                
                return (
                  <Card
                    key={message.id}
                    className={`w-full transition-all duration-200 hover:shadow-md ${config.borderColor} border-l-4`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${config.color} rounded-lg p-2 flex-shrink-0 shadow-sm`}>
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{config.name}</span>
                              {/* <Badge variant="outline" className="text-xs font-medium">
                                {message.model}
                              </Badge> */}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
                            <p className={`${config.textColor} text-sm leading-relaxed whitespace-pre-wrap`}>
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}