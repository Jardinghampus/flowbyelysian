import { createClient } from "@supabase/supabase-js"

/**
 * Untyped Supabase server client for tables not yet in generated DB types.
 * Used by owner-intelligence module for owner_contacts and bulk_jobs tables.
 */
export function createUntypedServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
