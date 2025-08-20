import type React from "react"
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import Header from "@/components/Header"
import PromptInput from "@/components/PromptInput"
import ClientInit from "@/components/ClientInit"
import ChatSidebar from "@/components/SidebarHistory"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-slate-50`}>
          <ClientInit />

          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>

          <SignedIn>
            <Header />
            <main className="flex min-h-[calc(100vh-80px)]">
              <aside>
                <ChatSidebar />
              </aside>

              <section className="flex-1 p-6 space-y-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-6">
                    <PromptInput />
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm p-6">
                    {children}
                  </div>
                </div>
              </section>
            </main>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}
