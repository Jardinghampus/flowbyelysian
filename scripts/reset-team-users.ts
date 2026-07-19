/**
 * Reset app_users to the core Zaylo team.
 * Run: npx tsx scripts/reset-team-users.ts
 */
import { createClient } from "@supabase/supabase-js"
import { hashPassword } from "../src/lib/local-auth"

const TEAM = [
  { email: "hampus@zaylo.com", fullName: "Hampus", role: "admin" as const, canAccessSocial: true },
  { email: "elsje@zaylo.com", fullName: "Elsje", role: "agent" as const, canAccessSocial: false },
  { email: "aaron@zaylo.com", fullName: "Aaron", role: "agent" as const, canAccessSocial: false },
  { email: "laura@zaylo.com", fullName: "Laura", role: "agent" as const, canAccessSocial: false },
]

const PASSWORD = "1111"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const passwordHash = hashPassword(PASSWORD)
  const now = new Date().toISOString()

  const { error: deleteError } = await supabase.from("app_users").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  if (deleteError) {
    console.error("Failed to delete existing users:", deleteError.message)
    process.exit(1)
  }

  const rows = TEAM.map((user) => ({
    email: user.email,
    password_hash: passwordHash,
    full_name: user.fullName,
    role: user.role,
    can_access_social: user.canAccessSocial,
    status: "active",
    must_change_password: false,
    updated_at: now,
  }))

  const { data, error } = await supabase.from("app_users").insert(rows).select("email, role, full_name")
  if (error) {
    console.error("Failed to insert team users:", error.message)
    process.exit(1)
  }

  console.log("Team users reset:")
  for (const row of data ?? []) {
    console.log(`  - ${row.full_name} <${row.email}> (${row.role})`)
  }
  console.log(`Password for all: ${PASSWORD}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
