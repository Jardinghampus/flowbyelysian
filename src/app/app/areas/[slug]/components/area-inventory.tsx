"use client"

import { Building2, Bed, Bath, Maximize, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AreaListing } from "../../data/areas-data"
import { formatPrice } from "../../data/areas-data"

interface AreaInventoryProps {
  listings: AreaListing[]
}

const statusColors = {
  live: "bg-green-500/10 text-green-600 border-green-500/20",
  pocket: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  unofficial: "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

const typeIcons: Record<string, string> = {
  villa: "Villa",
  apartment: "Apt",
  townhouse: "TH",
  penthouse: "PH",
  plot: "Plot",
}

export function AreaInventory({ listings }: AreaInventoryProps) {
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No listings in this area yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Beds/Baths</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {listing.transactionType === "sale" ? "For Sale" : "For Rent"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {typeIcons[listing.type] || listing.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(listing.price)}
                    {listing.transactionType === "rent" && (
                      <span className="text-xs text-muted-foreground">/yr</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Maximize className="h-3 w-3 text-muted-foreground" />
                      {listing.size.toLocaleString()} sqft
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        {listing.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        {listing.bathrooms}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {listing.agentName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${statusColors[listing.status]}`}
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
