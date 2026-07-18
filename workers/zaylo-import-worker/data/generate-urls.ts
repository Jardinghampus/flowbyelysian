import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { generateCuratedUrls } from "./bayut-communities.js"

const root = path.dirname(fileURLToPath(import.meta.url))
const rows = generateCuratedUrls()
const uniqueUrls = new Set(rows.map((r) => r.url))

writeFileSync(path.join(root, "bayut-urls-curated.json"), JSON.stringify(rows, null, 2))
writeFileSync(
  path.join(root, "bayut-urls-curated.csv"),
  [
    "community,area,purpose,propertyType,url",
    ...rows.map((r) =>
      [r.community, r.area, r.purpose, r.propertyType, r.url]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n")
)

writeFileSync(
  path.join(root, "input_links.csv"),
  ["community,url", ...rows.map((r) => `"${r.area.replace(/"/g, '""')}","${r.url}"`)].join("\n")
)

console.log(`Wrote ${rows.length} curated URLs (${uniqueUrls.size} unique)`)
