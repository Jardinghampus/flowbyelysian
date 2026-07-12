// Auth helpers for API routes — supports local, Clerk, and demo modes.
import { isClerkAuthEnabled, isLocalAuthEnabled } from "@/lib/auth-mode"
import {
  getVerifiedSessionUser,
  listAppUsers,
  toClerkShapedUser,
  type LocalSessionUser,
} from "@/lib/local-auth"

export const DEMO_USER_ID = "demo-user-001"

export const DEMO_USER = {
  id: DEMO_USER_ID,
  firstName: "Demo",
  lastName: "User",
  fullName: "Demo User",
  emailAddresses: [{ emailAddress: "jardinghampus@gmail.com" }],
  primaryEmailAddress: { emailAddress: "jardinghampus@gmail.com" },
  publicMetadata: {
    role: "admin",
    phone: "+971 50 123 4567",
    area: "tilal-al-ghaf",
    canAccessSocial: true,
  },
  privateMetadata: {},
  imageUrl: null,
  createdAt: Date.now(),
  lastActiveAt: Date.now(),
}

export async function auth() {
  if (isLocalAuthEnabled) {
    const user = await getVerifiedSessionUser()
    return { userId: user?.id ?? null }
  }

  if (isClerkAuthEnabled) {
    const clerk = await import("@clerk/nextjs/server")
    return clerk.auth()
  }

  return {
    userId: DEMO_USER_ID,
  }
}

export async function currentUser() {
  if (isLocalAuthEnabled) {
    const user = await getVerifiedSessionUser()
    if (!user) return null
    return toClerkShapedUser(user)
  }

  if (isClerkAuthEnabled) {
    const clerk = await import("@clerk/nextjs/server")
    return clerk.currentUser()
  }

  return DEMO_USER
}

export async function getLocalSession(): Promise<LocalSessionUser | null> {
  if (!isLocalAuthEnabled) return null
  return getVerifiedSessionUser()
}

export async function clerkClient() {
  if (isLocalAuthEnabled) {
    return {
      users: {
        getUser: async (userId: string) => {
          const users = await listAppUsers()
          const row = users.find((u) => u.id === userId)
          if (!row) return null
          return toClerkShapedUser({
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            role: row.role,
            canAccessSocial: row.can_access_social,
          })
        },
        getUserList: async () => {
          const users = await listAppUsers()
          return {
            data: users.map((row) =>
              toClerkShapedUser({
                id: row.id,
                email: row.email,
                fullName: row.full_name,
                role: row.role,
                canAccessSocial: row.can_access_social,
              })
            ),
          }
        },
        updateUser: async () => {
          throw new Error("Use /api/admin/users for local auth updates")
        },
      },
      invitations: {
        createInvitation: async () => {
          throw new Error("Local auth creates users directly — password required")
        },
      },
    }
  }

  if (isClerkAuthEnabled) {
    const clerk = await import("@clerk/nextjs/server")
    return clerk.clerkClient()
  }

  return {
    users: {
      getUser: async () => DEMO_USER,
      getUserList: async () => ({
        data: [
          DEMO_USER,
          {
            id: "demo-agent-001",
            firstName: "Agent",
            lastName: "Demo",
            fullName: "Agent Demo",
            emailAddresses: [{ emailAddress: "agent@demo.com" }],
            publicMetadata: { role: "agent", area: "palm-jumeirah" },
            imageUrl: null,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
          },
        ],
      }),
      updateUser: async (userId: string, data: unknown) => {
        console.log("Demo mode: User update simulated", userId, data)
        return DEMO_USER
      },
    },
    invitations: {
      createInvitation: async (data: unknown) => {
        console.log("Demo mode: Invitation creation simulated", data)
        return {
          id: "demo-invitation-001",
          emailAddress: (data as { emailAddress: string }).emailAddress,
          status: "pending",
          createdAt: Date.now(),
        }
      },
    },
  }
}
