import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Download } from "lucide-react"

interface Community {
  id: string
  community: string
  subCommunity: string
  propertyType: string
  transactionType: string
  bayutUrl: string
}

const communities: Community[] = [
  {"id":"ar1-saheel-villa-sale","community":"Arabian Ranches 1","subCommunity":"Saheel","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/saheel/"},
  {"id":"ar1-saheel-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Saheel","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/saheel/"},
  {"id":"ar1-mirador-villa-sale","community":"Arabian Ranches 1","subCommunity":"Mirador","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/mirador/"},
  {"id":"ar1-mirador-villa-rent","community":"Arabian Ranches 1","subCommunity":"Mirador","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/mirador/"},
  {"id":"ar1-al-reem-townhouse-sale","community":"Arabian Ranches 1","subCommunity":"Al Reem","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/al-reem/"},
  {"id":"ar1-al-reem-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Al Reem","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/al-reem/"},
  {"id":"ar1-palmera-townhouse-sale","community":"Arabian Ranches 1","subCommunity":"Palmera","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/palmera/"},
  {"id":"ar1-palmera-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Palmera","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/palmera/"},
  {"id":"ar1-alvorada-villa-sale","community":"Arabian Ranches 1","subCommunity":"Alvorada","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/alvorada/"},
  {"id":"ar1-alvorada-villa-rent","community":"Arabian Ranches 1","subCommunity":"Alvorada","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/alvorada/"},
  {"id":"ar1-aseel-villa-sale","community":"Arabian Ranches 1","subCommunity":"Aseel","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/aseel/"},
  {"id":"ar1-aseel-villa-rent","community":"Arabian Ranches 1","subCommunity":"Aseel","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/aseel/"},
  {"id":"ar1-al-mahra-villa-sale","community":"Arabian Ranches 1","subCommunity":"Al Mahra","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-1/al-mahra/"},
  {"id":"ar1-al-mahra-villa-rent","community":"Arabian Ranches 1","subCommunity":"Al Mahra","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-1/al-mahra/"},
  {"id":"ar2-casa-villa-sale","community":"Arabian Ranches 2","subCommunity":"Casa","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/casa/"},
  {"id":"ar2-casa-villa-rent","community":"Arabian Ranches 2","subCommunity":"Casa","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/casa/"},
  {"id":"ar2-lila-villa-sale","community":"Arabian Ranches 2","subCommunity":"Lila","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/lila/"},
  {"id":"ar2-lila-villa-rent","community":"Arabian Ranches 2","subCommunity":"Lila","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/lila/"},
  {"id":"ar2-palma-villa-sale","community":"Arabian Ranches 2","subCommunity":"Palma","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/palma/"},
  {"id":"ar2-palma-villa-rent","community":"Arabian Ranches 2","subCommunity":"Palma","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/palma/"},
  {"id":"ar2-rasha-villa-sale","community":"Arabian Ranches 2","subCommunity":"Rasha","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/rasha/"},
  {"id":"ar2-rasha-villa-rent","community":"Arabian Ranches 2","subCommunity":"Rasha","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/rasha/"},
  {"id":"ar2-rosa-villa-sale","community":"Arabian Ranches 2","subCommunity":"Rosa","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/rosa/"},
  {"id":"ar2-rosa-villa-rent","community":"Arabian Ranches 2","subCommunity":"Rosa","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/rosa/"},
  {"id":"ar2-yasmin-villa-sale","community":"Arabian Ranches 2","subCommunity":"Yasmin","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/yasmin/"},
  {"id":"ar2-yasmin-villa-rent","community":"Arabian Ranches 2","subCommunity":"Yasmin","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/yasmin/"},
  {"id":"ar2-samara-villa-sale","community":"Arabian Ranches 2","subCommunity":"Samara","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/samara/"},
  {"id":"ar2-samara-villa-rent","community":"Arabian Ranches 2","subCommunity":"Samara","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/samara/"},
  {"id":"ar2-azalea-villa-sale","community":"Arabian Ranches 2","subCommunity":"Azalea","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/azalea/"},
  {"id":"ar2-azalea-villa-rent","community":"Arabian Ranches 2","subCommunity":"Azalea","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/azalea/"},
  {"id":"ar2-reem-townhouse-sale","community":"Arabian Ranches 2","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/reem/"},
  {"id":"ar2-reem-townhouse-rent","community":"Arabian Ranches 2","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/reem/"},
  {"id":"ar2-camelia-townhouse-sale","community":"Arabian Ranches 2","subCommunity":"Camelia","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-2/camelia/"},
  {"id":"ar2-camelia-townhouse-rent","community":"Arabian Ranches 2","subCommunity":"Camelia","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-2/camelia/"},
  {"id":"ar3-caya-villa-sale","community":"Arabian Ranches 3","subCommunity":"Caya","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-3/caya/"},
  {"id":"ar3-caya-villa-rent","community":"Arabian Ranches 3","subCommunity":"Caya","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-3/caya/"},
  {"id":"ar3-bliss-villa-sale","community":"Arabian Ranches 3","subCommunity":"Bliss","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-3/bliss/"},
  {"id":"ar3-bliss-villa-rent","community":"Arabian Ranches 3","subCommunity":"Bliss","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-3/bliss/"},
  {"id":"ar3-june-villa-sale","community":"Arabian Ranches 3","subCommunity":"June","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-3/june/"},
  {"id":"ar3-june-villa-rent","community":"Arabian Ranches 3","subCommunity":"June","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-3/june/"},
  {"id":"ar3-anya-villa-sale","community":"Arabian Ranches 3","subCommunity":"Anya","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-3/anya/"},
  {"id":"ar3-anya-villa-rent","community":"Arabian Ranches 3","subCommunity":"Anya","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-3/anya/"},
  {"id":"ar3-sun-villa-sale","community":"Arabian Ranches 3","subCommunity":"Sun","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/arabian-ranches-3/sun/"},
  {"id":"ar3-sun-villa-rent","community":"Arabian Ranches 3","subCommunity":"Sun","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/arabian-ranches-3/sun/"},
  {"id":"mudon-arabella-townhouse-sale","community":"Mudon","subCommunity":"Arabella","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/arabella/"},
  {"id":"mudon-arabella-townhouse-rent","community":"Mudon","subCommunity":"Arabella","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/arabella/"},
  {"id":"mudon-arabella-villa-sale","community":"Mudon","subCommunity":"Arabella","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/arabella/"},
  {"id":"mudon-arabella-villa-rent","community":"Mudon","subCommunity":"Arabella","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/arabella/"},
  {"id":"mudon-al-ranim-townhouse-sale","community":"Mudon","subCommunity":"Al Ranim","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/al-ranim/"},
  {"id":"mudon-al-ranim-townhouse-rent","community":"Mudon","subCommunity":"Al Ranim","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/al-ranim/"},
  {"id":"mudon-rahat-villa-sale","community":"Mudon","subCommunity":"Rahat","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/rahat/"},
  {"id":"mudon-rahat-villa-rent","community":"Mudon","subCommunity":"Rahat","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/rahat/"},
  {"id":"mudon-al-naseem-villa-sale","community":"Mudon","subCommunity":"Al Naseem","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/al-naseem/"},
  {"id":"mudon-al-naseem-villa-rent","community":"Mudon","subCommunity":"Al Naseem","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/al-naseem/"},
  {"id":"dh-topanga-villa-sale","community":"Damac Hills","subCommunity":"Topanga","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/damac-hills/topanga/"},
  {"id":"dh-topanga-villa-rent","community":"Damac Hills","subCommunity":"Topanga","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/damac-hills/topanga/"},
  {"id":"dh-pelham-villa-sale","community":"Damac Hills","subCommunity":"Pelham","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/damac-hills/pelham/"},
  {"id":"dh-pelham-villa-rent","community":"Damac Hills","subCommunity":"Pelham","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/damac-hills/pelham/"},
  {"id":"dh-the-field-townhouse-sale","community":"Damac Hills","subCommunity":"The Field","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/damac-hills/the-field/"},
  {"id":"dh-the-field-townhouse-rent","community":"Damac Hills","subCommunity":"The Field","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/damac-hills/the-field/"},
  {"id":"dh-silver-springs-villa-sale","community":"Damac Hills","subCommunity":"Silver Springs","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/damac-hills/silver-springs/"},
  {"id":"dh-silver-springs-villa-rent","community":"Damac Hills","subCommunity":"Silver Springs","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/damac-hills/silver-springs/"},
  {"id":"dh-whitefield-townhouse-sale","community":"Damac Hills","subCommunity":"Whitefield","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/damac-hills/whitefield/"},
  {"id":"dh-whitefield-townhouse-rent","community":"Damac Hills","subCommunity":"Whitefield","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/damac-hills/whitefield/"},
  {"id":"ts-hayat-townhouse-sale","community":"Town Square","subCommunity":"Hayat","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/town-square/hayat/"},
  {"id":"ts-hayat-townhouse-rent","community":"Town Square","subCommunity":"Hayat","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/town-square/hayat/"},
  {"id":"ts-noor-townhouse-sale","community":"Town Square","subCommunity":"Noor","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/town-square/noor/"},
  {"id":"ts-noor-townhouse-rent","community":"Town Square","subCommunity":"Noor","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/town-square/noor/"},
  {"id":"ts-naseem-townhouse-sale","community":"Town Square","subCommunity":"Naseem","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/town-square/naseem/"},
  {"id":"ts-naseem-townhouse-rent","community":"Town Square","subCommunity":"Naseem","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/town-square/naseem/"},
  {"id":"ts-reem-townhouse-sale","community":"Town Square","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/town-square/reem/"},
  {"id":"ts-reem-townhouse-rent","community":"Town Square","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/town-square/reem/"},
  {"id":"ts-safi-townhouse-sale","community":"Town Square","subCommunity":"Safi","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/town-square/safi/"},
  {"id":"ts-safi-townhouse-rent","community":"Town Square","subCommunity":"Safi","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/town-square/safi/"},
  {"id":"dhe-maple-townhouse-sale","community":"Dubai Hills Estate","subCommunity":"Maple","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/dubai-hills-estate/maple/"},
  {"id":"dhe-maple-townhouse-rent","community":"Dubai Hills Estate","subCommunity":"Maple","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/dubai-hills-estate/maple/"},
  {"id":"dhe-sidra-villa-sale","community":"Dubai Hills Estate","subCommunity":"Sidra Villas","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/dubai-hills-estate/sidra-villas/"},
  {"id":"dhe-sidra-villa-rent","community":"Dubai Hills Estate","subCommunity":"Sidra Villas","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/dubai-hills-estate/sidra-villas/"},
  {"id":"dhe-golf-place-villa-sale","community":"Dubai Hills Estate","subCommunity":"Golf Place","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/dubai-hills-estate/golf-place/"},
  {"id":"dhe-golf-place-villa-rent","community":"Dubai Hills Estate","subCommunity":"Golf Place","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/dubai-hills-estate/golf-place/"},
  {"id":"dhe-fairway-villa-sale","community":"Dubai Hills Estate","subCommunity":"Fairway Vistas","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/dubai-hills-estate/fairway-vistas/"},
  {"id":"dhe-fairway-villa-rent","community":"Dubai Hills Estate","subCommunity":"Fairway Vistas","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/dubai-hills-estate/fairway-vistas/"},
  {"id":"vn-amaranta-townhouse-sale","community":"Villa Nova","subCommunity":"Amaranta","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/villa-nova/amaranta/"},
  {"id":"vn-amaranta-townhouse-rent","community":"Villa Nova","subCommunity":"Amaranta","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/villa-nova/amaranta/"},
  {"id":"vn-la-rosa-townhouse-sale","community":"Villa Nova","subCommunity":"La Rosa","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/villa-nova/la-rosa/"},
  {"id":"vn-la-rosa-townhouse-rent","community":"Villa Nova","subCommunity":"La Rosa","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/villa-nova/la-rosa/"},
  {"id":"vn-la-quinta-villa-sale","community":"Villa Nova","subCommunity":"La Quinta","propertyType":"Villa","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/villa-nova/la-quinta/"},
  {"id":"vn-la-quinta-villa-rent","community":"Villa Nova","subCommunity":"La Quinta","propertyType":"Villa","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/villa-nova/la-quinta/"},
  {"id":"vn-la-violeta-townhouse-sale","community":"Villa Nova","subCommunity":"La Violeta","propertyType":"Townhouse","transactionType":"Sale","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/villa-nova/la-violeta/"},
  {"id":"vn-la-violeta-townhouse-rent","community":"Villa Nova","subCommunity":"La Violeta","propertyType":"Townhouse","transactionType":"Rent","bayutUrl":"https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/villa-nova/la-violeta/"},
]

function groupBy<T>(arr: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of arr) {
    const k = String(item[key])
    const existing = map.get(k) ?? []
    existing.push(item)
    map.set(k, existing)
  }
  return map
}

export default function MarketPage() {
  const byCommunity = groupBy(communities, "community")
  const communityNames = Array.from(byCommunity.keys())
  const defaultTab = communityNames[0]

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Dubai community data sourced from Bayut · {communities.length} market segments
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap h-auto gap-1 mb-4">
          {communityNames.map((name) => (
            <TabsTrigger key={name} value={name} className="text-xs sm:text-sm">
              {name}
            </TabsTrigger>
          ))}
        </TabsList>

        {communityNames.map((communityName) => {
          const items = byCommunity.get(communityName) ?? []
          const bySubCommunity = groupBy(items, "subCommunity")

          return (
            <TabsContent key={communityName} value={communityName}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from(bySubCommunity.entries()).map(([subName, rows]) => (
                  <Card key={subName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{subName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{communityName}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {rows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              row.transactionType === "Sale"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            }
                          >
                            {row.propertyType} · {row.transactionType}
                          </Badge>
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                              <a href={row.bayutUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Bayut
                              </a>
                            </Button>
                            <Button size="sm" className="h-7 px-2 text-xs" asChild>
                              <a href={`/api/market/video/${encodeURIComponent(row.id)}`}>
                                <Download className="h-3 w-3 mr-1" />
                                MP4
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
