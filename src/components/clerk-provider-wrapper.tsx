"use client"

import { ClerkProvider } from "@clerk/nextjs"

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  )
}
