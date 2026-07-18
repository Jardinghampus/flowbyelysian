-- Unique URL for source links (idempotent curated Bayut seed upserts)
CREATE UNIQUE INDEX IF NOT EXISTS zaylo_source_links_url_uidx ON public.zaylo_source_links (url);
