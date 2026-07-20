/**
 * Export AREA - sub-area URLs in Bayut property format:
 *   /for-sale/property/dubai/{path}/
 *   /to-rent/property/dubai/{path}/
 *
 * Usage: npx tsx scripts/export-area-property-urls.ts
 */
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  BAYUT_COMMUNITIES,
  type AreaNode,
  type CommunityDef,
} from "../data/bayut-communities.js"

/** Communities from Hampus URL pack (parents + Mudon + Tilal). */
const FOCUS_IDS = new Set([
  "villanova",
  "town-square",
  "arabian-ranches",
  "arabian-ranches-2",
  "arabian-ranches-3",
  "damac-hills",
  "mudon",
  "tilal-al-ghaf",
  "dubai-hills-estate",
])

type FlatArea = {
  community: string
  label: string
  parentArea: string
  path: string
  depth: number
}

function joinPath(...parts: string[]) {
  return parts.filter(Boolean).join("/")
}

function flatten(
  community: CommunityDef,
  nodes: AreaNode[],
  parentPath = "",
  parentName = "",
  depth = 0
): FlatArea[] {
  const out: FlatArea[] = []
  for (const node of nodes) {
    const path = joinPath(parentPath, node.slug)
    const label =
      depth === 0 && !node.slug
        ? community.name
        : parentName
          ? `${community.name} - ${node.name}`
          : `${community.name} - ${node.name}`
    out.push({
      community: community.name,
      label,
      parentArea: parentName,
      path,
      depth,
    })
    if (node.children?.length) {
      out.push(...flatten(community, node.children, path || node.slug, node.name, depth + 1))
    }
  }
  return out
}

function urlsFor(bayutPath: string) {
  return {
    forSale: `https://www.bayut.com/for-sale/property/${bayutPath}/`,
    toRent: `https://www.bayut.com/to-rent/property/${bayutPath}/`,
  }
}

const communities = BAYUT_COMMUNITIES.filter((c) => FOCUS_IDS.has(c.id))
const rows: Array<{
  areaSubArea: string
  community: string
  subArea: string
  parentArea: string
  depth: number
  forSale: string
  toRent: string
  bayutPath: string
}> = []

for (const community of communities) {
  for (const area of flatten(community, community.areas)) {
    const bayutPath = joinPath("dubai", community.basePath, area.path)
    const urls = urlsFor(bayutPath)
    const subArea =
      area.depth === 0 && !area.path
        ? "(master)"
        : area.label.replace(`${community.name} - `, "")
    rows.push({
      areaSubArea: area.label,
      community: community.name,
      subArea,
      parentArea: area.parentArea,
      depth: area.depth,
      forSale: urls.forSale,
      toRent: urls.toRent,
      bayutPath,
    })
  }
}

const csvHeader = "area_sub_area,community,sub_area,parent_area,depth,for_sale,to_rent,bayut_path"
const csvLines = [
  csvHeader,
  ...rows.map((r) =>
    [
      JSON.stringify(r.areaSubArea),
      JSON.stringify(r.community),
      JSON.stringify(r.subArea),
      JSON.stringify(r.parentArea),
      r.depth,
      r.forSale,
      r.toRent,
      r.bayutPath,
    ].join(",")
  ),
]

let md = `# Bayut AREA - sub-area URLs\n\n`
md += `Format: **AREA - sub-area** · always both \`for-sale/property\` + \`to-rent/property\`.\n\n`
md += `Generated ${new Date().toISOString().slice(0, 10)} · ${rows.length} leaves.\n\n`

let current = ""
for (const r of rows) {
  if (r.community !== current) {
    current = r.community
    md += `\n## ${current}\n\n`
  }
  md += `### ${r.areaSubArea}\n`
  md += `- for-sale: ${r.forSale}\n`
  md += `- to-rent: ${r.toRent}\n\n`
}

const outDir = resolve(import.meta.dirname, "../data")
writeFileSync(resolve(outDir, "bayut-area-property-urls.csv"), csvLines.join("\n") + "\n")
writeFileSync(resolve(outDir, "bayut-area-property-urls.md"), md)

/** Same worker input shape as input_links.csv — community,url (sale + rent per leaf). */
const scrapeLines = [
  "community,url",
  ...rows.flatMap((r) => [
    `${JSON.stringify(r.areaSubArea)},${r.forSale}`,
    `${JSON.stringify(r.areaSubArea)},${r.toRent}`,
  ]),
]
writeFileSync(resolve(outDir, "input_links-area-property.csv"), scrapeLines.join("\n") + "\n")

console.log(`Wrote ${rows.length} leaves → data/bayut-area-property-urls.{csv,md}`)
console.log(`Wrote ${rows.length * 2} scrape URLs → data/input_links-area-property.csv`)
console.log(`Scrape with: INPUT_LINKS_CSV=data/input_links-area-property.csv USE_CSV_SOURCES=true`)
