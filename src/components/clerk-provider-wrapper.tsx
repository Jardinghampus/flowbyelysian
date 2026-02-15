"use client"

import { DemoUserProvider } from "@/contexts/demo-user-context"

// Demo mode: Using mock user context instead of Clerk
export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <DemoUserProvider>{children}</DemoUserProvider>
}
