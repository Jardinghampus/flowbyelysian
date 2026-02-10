"use client"

import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Clerk
const SignIn = dynamic(
  () => import("@clerk/nextjs").then(mod => mod.SignIn),
  { ssr: false, loading: () => <div className="animate-pulse h-96 w-80 bg-muted rounded-lg" /> }
)

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <SignIn
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
