"use client"
import { UserButton, useUser } from "@clerk/nextjs"
import { Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import SettingsDialog from "./SettingsDialog"

export default function Header() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold bg-gray-900 bg-clip-text text-transparent">
                AI-Madness
              </h1>
              <p className="text-xs text-muted-foreground">Compare AI responses side by side</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.fullName && (
            <div className="hidden sm:block text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user.fullName}</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="hover:bg-accent/80 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>

      <SettingsDialog open={open} setOpen={setOpen} />
    </header>
  )
}
