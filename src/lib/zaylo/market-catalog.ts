export type ZayloBedroom = 3 | 4 | 5

export type ZayloSourceKind =
  | "bayut_rent_listings"
  | "bayut_sale_listings"
  | "bayut_rent_transactions"
  | "bayut_sale_transactions"
  | "dxb_interact_transactions"
  | "manual"

export type ZayloAreaCatalogItem = {
  id: string
  city: "Dubai"
  masterCommunity: string
  community: string
  subCommunity: string
  bayutPath: string
  propertyTypes: Array<"Villa" | "Townhouse">
  bedrooms: ZayloBedroom[]
  active: boolean
}

export type ZayloSourceLink = {
  id: string
  areaId: string
  kind: ZayloSourceKind
  label: string
  url: string
  active: boolean
  notes?: string
}

const bedroomSegments: ZayloBedroom[] = [3, 4, 5]

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function area(
  masterCommunity: string,
  subCommunity: string,
  bayutPath: string,
  propertyTypes: Array<"Villa" | "Townhouse"> = ["Villa", "Townhouse"]
): ZayloAreaCatalogItem {
  return {
    id: `${slug(masterCommunity)}-${slug(subCommunity)}`,
    city: "Dubai",
    masterCommunity,
    community: masterCommunity,
    subCommunity,
    bayutPath,
    propertyTypes,
    bedrooms: bedroomSegments,
    active: true,
  }
}

export const zayloAreaCatalog: ZayloAreaCatalogItem[] = [
  area("Arabian Ranches 1", "Al Reem", "dubai/arabian-ranches/al-reem"),
  area("Arabian Ranches 1", "Alma", "dubai/arabian-ranches/alma"),
  area("Arabian Ranches 1", "Alvorada", "dubai/arabian-ranches/alvorada"),
  area("Arabian Ranches 1", "Aseel", "dubai/arabian-ranches/aseel"),
  area("Arabian Ranches 1", "Hattan", "dubai/arabian-ranches/hattan", ["Villa"]),
  area("Arabian Ranches 1", "La Avenida", "dubai/arabian-ranches/la-avenida", ["Villa"]),
  area("Arabian Ranches 1", "Mirador", "dubai/arabian-ranches/mirador", ["Villa"]),
  area("Arabian Ranches 1", "Mirador La Coleccion", "dubai/arabian-ranches/mirador-la-coleccion", ["Villa"]),
  area("Arabian Ranches 1", "Palmera", "dubai/arabian-ranches/palmera"),
  area("Arabian Ranches 1", "Polo Homes", "dubai/arabian-ranches/polo-homes", ["Villa"]),
  area("Arabian Ranches 1", "Saheel", "dubai/arabian-ranches/saheel", ["Villa"]),
  area("Arabian Ranches 1", "Savannah", "dubai/arabian-ranches/savannah", ["Villa"]),
  area("Arabian Ranches 1", "Terra Nova", "dubai/arabian-ranches/terra-nova", ["Villa"]),

  area("Arabian Ranches 2", "Azalea", "dubai/arabian-ranches-2/azalea", ["Villa"]),
  area("Arabian Ranches 2", "Camelia", "dubai/arabian-ranches-2/camelia"),
  area("Arabian Ranches 2", "Casa", "dubai/arabian-ranches-2/casa", ["Villa"]),
  area("Arabian Ranches 2", "Lila", "dubai/arabian-ranches-2/lila", ["Villa"]),
  area("Arabian Ranches 2", "Palma", "dubai/arabian-ranches-2/palma", ["Villa"]),
  area("Arabian Ranches 2", "Rasha", "dubai/arabian-ranches-2/rasha", ["Villa"]),
  area("Arabian Ranches 2", "Reem Community", "dubai/arabian-ranches-2/reem-community"),
  area("Arabian Ranches 2", "Rosa", "dubai/arabian-ranches-2/rosa", ["Villa"]),
  area("Arabian Ranches 2", "Samara", "dubai/arabian-ranches-2/samara", ["Villa"]),
  area("Arabian Ranches 2", "Yasmin", "dubai/arabian-ranches-2/yasmin", ["Villa"]),

  area("Arabian Ranches 3", "Anya", "dubai/arabian-ranches-3/anya"),
  area("Arabian Ranches 3", "Bliss", "dubai/arabian-ranches-3/bliss"),
  area("Arabian Ranches 3", "Caya", "dubai/arabian-ranches-3/caya", ["Villa"]),
  area("Arabian Ranches 3", "Elie Saab", "dubai/arabian-ranches-3/elie-saab", ["Villa"]),
  area("Arabian Ranches 3", "June", "dubai/arabian-ranches-3/june", ["Villa"]),
  area("Arabian Ranches 3", "Joy", "dubai/arabian-ranches-3/joy"),
  area("Arabian Ranches 3", "May", "dubai/arabian-ranches-3/may"),
  area("Arabian Ranches 3", "Raya", "dubai/arabian-ranches-3/raya"),
  area("Arabian Ranches 3", "Ruba", "dubai/arabian-ranches-3/ruba"),
  area("Arabian Ranches 3", "Spring", "dubai/arabian-ranches-3/spring"),
  area("Arabian Ranches 3", "Sun", "dubai/arabian-ranches-3/sun"),

  area("Mudon", "Al Ranim", "dubai/mudon/mudon-al-ranim"),
  area("Mudon", "Arabella Townhouses", "dubai/mudon/arabella-townhouses"),
  area("Mudon", "Mudon Views", "dubai/mudon/mudon-views", ["Townhouse"]),
  area("Mudon", "Naseem", "dubai/mudon/naseem", ["Villa"]),
  area("Mudon", "Rahat", "dubai/mudon/rahat", ["Villa"]),

  area("Mira", "Mira 1", "dubai/reem/mira/mira-1"),
  area("Mira", "Mira 2", "dubai/reem/mira/mira-2"),
  area("Mira", "Mira 3", "dubai/reem/mira/mira-3"),
  area("Mira", "Mira 4", "dubai/reem/mira/mira-4"),
  area("Mira", "Mira 5", "dubai/reem/mira/mira-5"),
  area("Mira Oasis", "Mira Oasis 1", "dubai/reem/mira-oasis/mira-oasis-1"),
  area("Mira Oasis", "Mira Oasis 2", "dubai/reem/mira-oasis/mira-oasis-2"),
  area("Mira Oasis", "Mira Oasis 3", "dubai/reem/mira-oasis/mira-oasis-3"),

  area("Town Square", "Hayat Townhouses", "dubai/town-square/hayat-townhouses"),
  area("Town Square", "Maha Townhouses", "dubai/town-square/maha-townhouses"),
  area("Town Square", "Naseem Townhouses", "dubai/town-square/naseem-townhouses"),
  area("Town Square", "Noor Townhouses", "dubai/town-square/noor-townhouses"),
  area("Town Square", "Reem Townhouses", "dubai/town-square/reem-townhouses"),
  area("Town Square", "Sama Townhouses", "dubai/town-square/sama-townhouses"),
  area("Town Square", "Shams Townhouses", "dubai/town-square/shams-townhouses"),
  area("Town Square", "Zahra Townhouses", "dubai/town-square/zahra-townhouses"),

  area("DAMAC Hills", "Brookfield", "dubai/damac-hills/brookfield", ["Villa"]),
  area("DAMAC Hills", "Flora", "dubai/damac-hills/flora", ["Villa"]),
  area("DAMAC Hills", "Golf Vita", "dubai/damac-hills/golf-vita", ["Townhouse"]),
  area("DAMAC Hills", "Pelham", "dubai/damac-hills/pelham", ["Villa"]),
  area("DAMAC Hills", "Picadilly Green", "dubai/damac-hills/picadilly-green", ["Villa"]),
  area("DAMAC Hills", "Queens Meadow", "dubai/damac-hills/queens-meadow", ["Villa"]),
  area("DAMAC Hills", "Richmond", "dubai/damac-hills/richmond", ["Villa"]),
  area("DAMAC Hills", "Rockwood", "dubai/damac-hills/rockwood", ["Villa"]),
  area("DAMAC Hills", "Silver Springs", "dubai/damac-hills/silver-springs", ["Villa"]),
  area("DAMAC Hills", "The Legends", "dubai/damac-hills/the-legends"),
  area("DAMAC Hills", "Topanga", "dubai/damac-hills/topanga", ["Villa"]),
  area("DAMAC Hills", "Trinity", "dubai/damac-hills/trinity", ["Villa"]),
  area("DAMAC Hills", "Veneto", "dubai/damac-hills/veneto", ["Villa"]),
  area("DAMAC Hills", "Whitefield", "dubai/damac-hills/whitefield", ["Villa"]),
]

export function createDefaultSourceLinks(areaItem: ZayloAreaCatalogItem): ZayloSourceLink[] {
  const listingBase = `https://www.bayut.com`
  const analysisBase = `https://www.bayut.com/property-market-analysis/transactions`

  return [
    {
      id: `${areaItem.id}-bayut-rent-listings`,
      areaId: areaItem.id,
      kind: "bayut_rent_listings",
      label: "Bayut rent listings",
      url: `${listingBase}/to-rent/property/${areaItem.bayutPath}/`,
      active: true,
    },
    {
      id: `${areaItem.id}-bayut-sale-listings`,
      areaId: areaItem.id,
      kind: "bayut_sale_listings",
      label: "Bayut sale listings",
      url: `${listingBase}/for-sale/property/${areaItem.bayutPath}/`,
      active: true,
    },
    {
      id: `${areaItem.id}-bayut-rent-transactions`,
      areaId: areaItem.id,
      kind: "bayut_rent_transactions",
      label: "Bayut rent transactions",
      url: `${analysisBase}/rent/property/${areaItem.bayutPath}/`,
      active: true,
      notes: "Validate path manually before first production run.",
    },
    {
      id: `${areaItem.id}-bayut-sale-transactions`,
      areaId: areaItem.id,
      kind: "bayut_sale_transactions",
      label: "Bayut sale transactions",
      url: `${analysisBase}/sale/property/${areaItem.bayutPath}/`,
      active: true,
      notes: "Validate path manually before first production run.",
    },
  ]
}

export const zayloSourceLinks: ZayloSourceLink[] = zayloAreaCatalog.flatMap(createDefaultSourceLinks)
