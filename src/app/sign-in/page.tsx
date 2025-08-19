"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/"   // after successful sign-in
        />
      </div>
    </div>
  )
}
