import "dotenv/config"
import { z } from "zod"

const ConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BROWSER_PROFILE_DIR: z.string().default(".browser-profile"),
  INPUT_LINKS_CSV: z.string().default("data/input_links.csv"),
  DETAIL_PAGE_DELAY_MIN_MS: z.coerce.number().int().nonnegative().default(1500),
  DETAIL_PAGE_DELAY_MAX_MS: z.coerce.number().int().nonnegative().default(3500),
  SEARCH_PAGE_DELAY_MIN_MS: z.coerce.number().int().nonnegative().default(2000),
  SEARCH_PAGE_DELAY_MAX_MS: z.coerce.number().int().nonnegative().default(5000),
})

export const config = ConfigSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  BROWSER_PROFILE_DIR: process.env.BROWSER_PROFILE_DIR ?? ".browser-profile",
  INPUT_LINKS_CSV: process.env.INPUT_LINKS_CSV ?? "data/input_links.csv",
  DETAIL_PAGE_DELAY_MIN_MS: process.env.DETAIL_PAGE_DELAY_MIN_MS ?? 1500,
  DETAIL_PAGE_DELAY_MAX_MS: process.env.DETAIL_PAGE_DELAY_MAX_MS ?? 3500,
  SEARCH_PAGE_DELAY_MIN_MS: process.env.SEARCH_PAGE_DELAY_MIN_MS ?? 2000,
  SEARCH_PAGE_DELAY_MAX_MS: process.env.SEARCH_PAGE_DELAY_MAX_MS ?? 5000,
})
