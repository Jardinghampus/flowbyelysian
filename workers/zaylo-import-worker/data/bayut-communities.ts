/**
 * Compact Bayut community trees for Zaylo Active Listings scrape.
 * URL pattern: /for-{rent|sale}/{villas|townhouses}/{basePath}/{areaPath}/
 * Villanova uses dubai/dubailand/villanova; others dubai/{community}.
 */

export type AreaNode = {
  name: string
  /** Path segment under community base. Empty = master community page. */
  slug: string
  children?: AreaNode[]
}

export type CommunityDef = {
  id: string
  name: string
  /** Path after dubai/ — e.g. town-square or dubailand/villanova */
  basePath: string
  areas: AreaNode[]
}

export const BAYUT_COMMUNITIES: CommunityDef[] = [
  {
    id: "town-square",
    name: "Town Square",
    basePath: "town-square",
    areas: [
      { name: "Town Square", slug: "" },
      { name: "Hayat Townhouses", slug: "hayat-townhouses" },
      { name: "Kaya", slug: "kaya" },
      { name: "Maha Townhouses", slug: "maha-townhouses" },
      { name: "Naseem Townhouses", slug: "naseem-townhouses" },
      { name: "Noor Townhouses", slug: "noor-townhouses" },
      { name: "Reem Townhouses", slug: "reem-townhouses" },
      { name: "Safi Townhouses", slug: "safi-townhouses" },
      { name: "Sama Townhouses", slug: "sama-townhouses" },
      { name: "Shams Townhouses", slug: "shams-townhouses" },
      { name: "Zahra Townhouses", slug: "zahra-townhouses" },
    ],
  },
  {
    id: "damac-hills",
    name: "DAMAC Hills",
    basePath: "damac-hills",
    areas: [
      { name: "DAMAC Hills", slug: "" },
      { name: "Akoya Park", slug: "akoya-park" },
      { name: "Brookfield", slug: "brookfield" },
      { name: "Calero", slug: "calero" },
      { name: "Club Villas", slug: "club-villas" },
      { name: "Green Acres", slug: "green-acres" },
      { name: "Jasmine", slug: "jasmine" },
      { name: "Orchid", slug: "orchid" },
      { name: "Park Residences 1", slug: "park-residences-1" },
      { name: "Park Residences 4", slug: "park-residences-4" },
      { name: "Pelham", slug: "pelham" },
      { name: "Picadilly Green", slug: "picadilly-green" },
      { name: "Queens Meadows", slug: "queens-meadows" },
      { name: "Richmond", slug: "richmond" },
      { name: "Rockwood", slug: "rockwood" },
      { name: "Silver Springs", slug: "silver-springs" },
      { name: "The Field", slug: "the-field" },
      { name: "The Park Villas", slug: "the-park-villas" },
      { name: "Topanga", slug: "topanga" },
      { name: "Trinity", slug: "trinity" },
      { name: "Trump Estates", slug: "trump-estates" },
      { name: "Ventura", slug: "ventura" },
      { name: "Whitefield", slug: "whitefield" },
    ],
  },
  {
    id: "arabian-ranches",
    name: "Arabian Ranches",
    basePath: "arabian-ranches",
    areas: [
      { name: "Arabian Ranches", slug: "" },
      { name: "Al Mahra", slug: "al-mahra" },
      {
        name: "Al Reem",
        slug: "al-reem",
        children: [
          { name: "Al Reem 1", slug: "al-reem-1" },
          { name: "Al Reem 2", slug: "al-reem-2" },
          { name: "Al Reem 3", slug: "al-reem-3" },
        ],
      },
      {
        name: "Alvorada",
        slug: "alvorada",
        children: [
          { name: "Alvorada 1", slug: "alvorada-1" },
          { name: "Alvorada 2", slug: "alvorada-2" },
          { name: "Alvorada 3", slug: "alvorada-3" },
          { name: "Alvorada 4", slug: "alvorada-4" },
        ],
      },
      {
        name: "Alma",
        slug: "alma",
        children: [
          { name: "Alma 1", slug: "alma-1" },
          { name: "Alma 2", slug: "alma-2" },
        ],
      },
      { name: "Aseel", slug: "aseel" },
      {
        name: "Hattan",
        slug: "hattan",
        children: [
          { name: "Hattan 1", slug: "hattan-1" },
          { name: "Hattan 2", slug: "hattan-2" },
          { name: "Hattan 3", slug: "hattan-3" },
        ],
      },
      {
        name: "La Avenida",
        slug: "la-avenida",
        children: [
          { name: "La Avenida 1", slug: "la-avenida-1" },
          { name: "La Avenida 2", slug: "la-avenida-2" },
        ],
      },
      { name: "Mirador", slug: "mirador" },
      {
        name: "Mirador La Coleccion",
        slug: "mirador-la-coleccion",
        children: [
          { name: "Mirador La Coleccion 1", slug: "mirador-la-coleccion-1" },
          { name: "Mirador La Coleccion 2", slug: "mirador-la-coleccion-2" },
        ],
      },
      {
        name: "Palmera",
        slug: "palmera",
        children: [
          { name: "Palmera 1", slug: "palmera-1" },
          { name: "Palmera 2", slug: "palmera-2" },
          { name: "Palmera 3", slug: "palmera-3" },
          { name: "Palmera 4", slug: "palmera-4" },
        ],
      },
      { name: "Polo Homes", slug: "polo-homes" },
      {
        name: "Saheel",
        slug: "saheel",
        children: [
          { name: "Saheel 1", slug: "saheel-1" },
          { name: "Saheel 2", slug: "saheel-2" },
          { name: "Saheel 3", slug: "saheel-3" },
        ],
      },
      {
        name: "Savannah",
        slug: "savannah",
        children: [
          { name: "Savannah 1", slug: "savannah-1" },
          { name: "Savannah 2", slug: "savannah-2" },
        ],
      },
      { name: "Terra Nova", slug: "terra-nova" },
    ],
  },
  {
    id: "arabian-ranches-2",
    name: "Arabian Ranches 2",
    basePath: "arabian-ranches-2",
    areas: [
      { name: "Arabian Ranches 2", slug: "" },
      { name: "Azalea", slug: "azalea" },
      { name: "Camelia", slug: "camelia" },
      { name: "Casa", slug: "casa" },
      { name: "Lila", slug: "lila" },
      { name: "Palma", slug: "palma" },
      { name: "Rasha", slug: "rasha" },
      { name: "Reem", slug: "reem" },
      { name: "Rosa", slug: "rosa" },
      { name: "Samara", slug: "samara" },
      { name: "Yasmin", slug: "yasmin" },
    ],
  },
  {
    id: "arabian-ranches-3",
    name: "Arabian Ranches 3",
    basePath: "arabian-ranches-3",
    areas: [
      { name: "Arabian Ranches 3", slug: "" },
      { name: "Anya", slug: "anya" },
      { name: "Anya 2", slug: "anya-2" },
      { name: "Bliss", slug: "bliss" },
      { name: "Bliss 2", slug: "bliss-2" },
      { name: "Caya", slug: "caya" },
      {
        name: "Elie Saab",
        slug: "elie-saab",
        children: [
          { name: "Elie Saab 1", slug: "elie-saab-1" },
          { name: "Elie Saab 2", slug: "elie-saab-2" },
        ],
      },
      { name: "Joy", slug: "joy" },
      { name: "June", slug: "june" },
      { name: "May", slug: "may" },
      { name: "Raya", slug: "raya" },
      { name: "Ruba", slug: "ruba" },
      { name: "Spring", slug: "spring" },
      { name: "Sun", slug: "sun" },
    ],
  },
  {
    id: "mira-oasis",
    name: "Mira Oasis",
    basePath: "reem/mira-oasis",
    areas: [
      { name: "Mira Oasis", slug: "" },
      { name: "Mira Oasis 1", slug: "mira-oasis-1" },
      { name: "Mira Oasis 2", slug: "mira-oasis-2" },
      { name: "Mira Oasis 3", slug: "mira-oasis-3" },
    ],
  },
  {
    id: "mudon",
    name: "Mudon",
    basePath: "mudon",
    areas: [
      { name: "Mudon", slug: "" },
      { name: "Al Salam", slug: "al-salam" },
      {
        name: "Arabella Townhouses",
        slug: "arabella-townhouses",
        children: [
          { name: "Arabella 1", slug: "arabella-1" },
          { name: "Arabella 2", slug: "arabella-2" },
          { name: "Arabella 3", slug: "arabella-3" },
        ],
      },
      {
        name: "Mudon Al Ranim",
        slug: "mudon-al-ranim",
        children: [
          { name: "Mudon Al Ranim 1", slug: "mudon-al-ranim-1" },
          { name: "Mudon Al Ranim 2", slug: "mudon-al-ranim-2" },
          { name: "Mudon Al Ranim 3", slug: "mudon-al-ranim-3" },
          { name: "Mudon Al Ranim 4", slug: "mudon-al-ranim-4" },
          { name: "Mudon Al Ranim 5", slug: "mudon-al-ranim-5" },
          { name: "Mudon Al Ranim 6", slug: "mudon-al-ranim-6" },
          { name: "Mudon Al Ranim 7", slug: "mudon-al-ranim-7" },
          { name: "Mudon Al Ranim 8", slug: "mudon-al-ranim-8" },
        ],
      },
      { name: "Naseem", slug: "naseem" },
      { name: "Rahat", slug: "rahat" },
    ],
  },
  {
    id: "tilal-al-ghaf",
    name: "Tilal Al Ghaf",
    basePath: "tilal-al-ghaf",
    areas: [
      { name: "Tilal Al Ghaf", slug: "" },
      {
        name: "Harmony",
        slug: "harmony",
        children: [
          { name: "Harmony 1", slug: "harmony-1" },
          { name: "Harmony 2", slug: "harmony-2" },
          { name: "Harmony 3", slug: "harmony-3" },
        ],
      },
      { name: "Elan", slug: "elan" },
      { name: "Aura Gardens", slug: "aura-gardens" },
    ],
  },
  {
    id: "dubai-hills-estate",
    name: "Dubai Hills Estate",
    basePath: "dubai-hills-estate",
    areas: [
      { name: "Dubai Hills Estate", slug: "" },
      {
        name: "Maple",
        slug: "maple",
        children: [
          { name: "Maple 1", slug: "maple-1" },
          { name: "Maple 2", slug: "maple-2" },
          { name: "Maple 3", slug: "maple-3" },
        ],
      },
      {
        name: "Sidra Villas",
        slug: "sidra-villas",
        children: [
          { name: "Sidra 1", slug: "sidra-1" },
          { name: "Sidra 2", slug: "sidra-2" },
          { name: "Sidra 3", slug: "sidra-3" },
        ],
      },
      {
        name: "Golf Place",
        slug: "golf-place",
        children: [
          { name: "Golf Place 1", slug: "golf-place-1" },
          { name: "Golf Place 2", slug: "golf-place-2" },
        ],
      },
      { name: "Golf Place Terraces", slug: "golf-place-terraces" },
      { name: "Golf Grove", slug: "golf-grove" },
      { name: "Club Villas", slug: "club-villas" },
      { name: "Fairway Vistas", slug: "fairway-vistas" },
      { name: "Parkway Vistas", slug: "parkway-vistas" },
      { name: "Majestic Vistas", slug: "majestic-vistas" },
      { name: "Emerald Hills", slug: "emerald-hills" },
    ],
  },
  {
    id: "damac-lagoons",
    name: "DAMAC Lagoons",
    basePath: "damac-lagoons",
    areas: [
      { name: "DAMAC Lagoons", slug: "" },
      { name: "Costa Brava", slug: "costa-brava" },
      { name: "Ibiza", slug: "ibiza" },
      { name: "Malta", slug: "malta" },
      { name: "Marbella", slug: "marbella" },
      { name: "Monte Carlo", slug: "monte-carlo" },
      { name: "Morocco", slug: "morocco" },
      { name: "Nice", slug: "nice" },
      { name: "Portofino", slug: "portofino" },
      { name: "Santorini", slug: "santorini" },
      { name: "Venice", slug: "venice" },
    ],
  },
  {
    id: "villanova",
    name: "Villanova",
    basePath: "dubailand/villanova",
    areas: [
      { name: "Villanova", slug: "" },
      {
        name: "Amaranta",
        slug: "amaranta",
        children: [
          { name: "Amaranta 1", slug: "amaranta-1" },
          { name: "Amaranta 2", slug: "amaranta-2" },
          { name: "Amaranta 3", slug: "amaranta-3" },
          { name: "Amaranta 4", slug: "amaranta-4" },
        ],
      },
      { name: "La Quinta", slug: "la-quinta" },
      {
        name: "La Rosa",
        slug: "la-rosa",
        children: [
          { name: "La Rosa 1", slug: "la-rosa-1" },
          { name: "La Rosa 2", slug: "la-rosa-2" },
          { name: "La Rosa 3", slug: "la-rosa-3" },
          { name: "La Rosa 4", slug: "la-rosa-4" },
          { name: "La Rosa 5", slug: "la-rosa-5" },
          { name: "La Rosa 6", slug: "la-rosa-6" },
        ],
      },
      { name: "La Tilia", slug: "la-tilia" },
      {
        name: "La Violeta",
        slug: "la-violeta",
        children: [
          { name: "La Violeta 1", slug: "la-violeta-1" },
          { name: "La Violeta 2", slug: "la-violeta-2" },
        ],
      },
      { name: "The Aldea", slug: "the-aldea" },
    ],
  },
]

export type CuratedUrl = {
  communityId: string
  community: string
  area: string
  parentArea: string
  depth: number
  purpose: "rent" | "sale"
  propertyType: "villas" | "townhouses"
  source: "curated"
  url: string
  areaSlug: string
  bayutPath: string
}

function joinPath(...parts: string[]) {
  return parts.filter(Boolean).join("/")
}

function flattenAreas(
  nodes: AreaNode[],
  parentPath = "",
  parentName = "",
  depth = 0
): Array<{ name: string; path: string; parentArea: string; depth: number }> {
  const out: Array<{ name: string; path: string; parentArea: string; depth: number }> = []
  for (const node of nodes) {
    const path = joinPath(parentPath, node.slug)
    out.push({ name: node.name, path, parentArea: parentName, depth })
    if (node.children?.length) {
      out.push(...flattenAreas(node.children, path || node.slug, node.name, depth + 1))
    }
  }
  return out
}

export function generateCuratedUrls(): CuratedUrl[] {
  const purposes = ["rent", "sale"] as const
  const types = ["villas", "townhouses"] as const
  const rows: CuratedUrl[] = []

  for (const community of BAYUT_COMMUNITIES) {
    const areas = flattenAreas(community.areas)
    for (const area of areas) {
      const bayutPath = joinPath("dubai", community.basePath, area.path)
      for (const purpose of purposes) {
        for (const propertyType of types) {
          const purposeSeg = purpose === "rent" ? "for-rent" : "for-sale"
          const url = `https://www.bayut.com/${purposeSeg}/${propertyType}/${bayutPath}/`
          const areaSlug = `${community.id}--${area.path || "master"}`
            .replace(/\//g, "--")
            .replace(/[^a-z0-9-]+/gi, "-")
            .toLowerCase()
          rows.push({
            communityId: community.id,
            community: community.name,
            area: area.name,
            parentArea: area.parentArea,
            depth: area.depth,
            purpose,
            propertyType,
            source: "curated",
            url,
            areaSlug,
            bayutPath,
          })
        }
      }
    }
  }

  return rows
}
