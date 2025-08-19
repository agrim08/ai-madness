"use client"

import type React from "react"
import { useState } from "react"
import { useAIStore } from "@/store/ai-store"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, Trash2, MoreHorizontal, History, Menu, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { chatSessions, currentChatId, createNewChat, selectChat, deleteChat } = useAIStore()

  const handleNewChat = () => {
    createNewChat()
  }

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId)
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      <div
        className={cn(
          "h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm relative",
          isCollapsed ? "w-12" : "w-80",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-slate-200">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0 hover:bg-slate-100">
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
          {!isCollapsed && <span className="text-sm font-semibold text-slate-700">Chats</span>}
        </div>

        {!isCollapsed && (
          <div className="p-4 space-y-4 h-[calc(100%-60px)] flex flex-col">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-3 bg-slate-900 hover:bg-slate-800 text-white flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 px-2 mb-3 flex-shrink-0">
                <History className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Recent</h3>
                {chatSessions.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto bg-slate-200 text-slate-600">
                    {chatSessions.length}
                  </Badge>
                )}
              </div>

              {chatSessions.length === 0 ? (
                <div className="text-center py-6 space-y-2 flex-1 flex flex-col justify-center">
                  <div className="mx-auto w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">No chats yet</p>
                    <p className="text-xs text-slate-500">Start a conversation above</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1 pr-2 pb-4">
                  {chatSessions.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative rounded-lg p-3 cursor-pointer transition-all duration-150",
                        "hover:bg-slate-50 border border-transparent",
                        currentChatId === chat.id ? "bg-slate-100 border-slate-200" : "hover:border-slate-200",
                      )}
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <h4 className="text-sm font-medium truncate text-slate-800">{chat.title}</h4>
                          </div>

                          {chat.messages.length > 0 && (
                            <p className="text-xs text-slate-500 truncate leading-relaxed">
                              {chat.messages[chat.messages.length - 1]?.content.substring(0, 50)}
                              {chat.messages[chat.messages.length - 1]?.content.length > 50 ? "..." : ""}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                        </span>

                        <div className="flex items-center gap-1">
                          {Object.entries(chat.activeModels).map(([model, isActive]) =>
                            isActive ? (
                              <Badge
                                key={model}
                                variant="secondary"
                                className="text-xs px-1.5 py-0.5 capitalize bg-slate-200 text-slate-600"
                              >
                                {model}
                              </Badge>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
