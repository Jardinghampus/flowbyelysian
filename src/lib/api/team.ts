import type { SupabaseClient } from "@supabase/supabase-js"

const DEFAULT_TEAM_SLUG = "zaylo"

export async function getDefaultTeamId(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("slug", DEFAULT_TEAM_SLUG)
    .maybeSingle()

  if (error) {
    console.warn("Failed to resolve default team", error.message)
    return null
  }

  return typeof data?.id === "string" ? data.id : null
}

