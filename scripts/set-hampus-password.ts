/**
 * Set Hampus password only (does not touch other users).
 * Run: npx tsx scripts/set-hampus-password.ts
 */
import { createClient } from "@supabase/supabase-js"
import { hashPassword } from "../src/lib/local-auth"

const HAMPUS_EMAIL = "hampus@zaylo.com"
const NEW_PASSWORD = "Gamlastan24"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const passwordHash = hashPassword(NEW_PASSWORD)

  const { data, error } = await supabase
    .from("app_users")
    .update({
      password_hash: passwordHash,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("email", HAMPUS_EMAIL)
    .select("email, full_name")
    .maybeSingle()

  if (error) {
    console.error("Failed to update password:", error.message)
    process.exit(1)
  }

  if (!data) {
    console.error(`No user found for ${HAMPUS_EMAIL}`)
    process.exit(1)
  }

  console.log(`Password updated for ${data.full_name} <${data.email}>`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
