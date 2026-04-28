"use client"

import { useUser, useClerk } from "@clerk/nextjs"

// Keep the same hook signatures so existing components need no changes

export function useDemoUser() {
  const { user, isLoaded, isSignedIn } = useUser()

  return {
    user: user
      ? {
          id: user.id,
          firstName: user.firstName || "User",
          lastName: user.lastName || "",
          fullName: user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User",
          primaryEmailAddress: {
            emailAddress: user.primaryEmailAddress?.emailAddress || "",
          },
          imageUrl: user.imageUrl || null,
          publicMetadata: user.publicMetadata as {
            role?: string
            phone?: string
            area?: string
          },
          update: (data: { firstName?: string; lastName?: string }) =>
            user.update(data),
        }
      : null,
    isLoaded,
    isSignedIn: !!isSignedIn,
  }
}

export function useDemoClerk() {
  const { signOut } = useClerk()
  return {
    signOut: (options?: { redirectUrl?: string }) =>
      signOut({ redirectUrl: options?.redirectUrl || "/sign-in" }),
  }
}

// Keep DemoUserProvider as a passthrough — ClerkProvider is now the real provider
export function DemoUserProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export const DEMO_USER_ID = "demo-user-001"

export type DemoUser = ReturnType<typeof useDemoUser>["user"]
