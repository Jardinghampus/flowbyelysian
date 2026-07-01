"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { DemoUserProvider } from "@/contexts/demo-user-context"

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "clerk") {
    return <ClerkProvider>{children}</ClerkProvider>
  }

  return <DemoUserProvider>{children}</DemoUserProvider>
}
