// Demo authentication helpers for API routes
// These replace Clerk's server-side auth functions

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
  },
  privateMetadata: {},
  imageUrl: null,
  createdAt: Date.now(),
  lastActiveAt: Date.now(),
}

// Mock auth() function - always returns demo user
export async function auth() {
  return {
    userId: DEMO_USER_ID,
  }
}

// Mock currentUser() function
export async function currentUser() {
  return DEMO_USER
}

// Mock clerkClient for admin routes
export async function clerkClient() {
  return {
    users: {
      getUser: async (userId: string) => DEMO_USER,
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
