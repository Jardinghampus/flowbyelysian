"use client"

import { FileText, DollarSign, Bed, User, Calendar } from "lucide-react"
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
import type { AreaRequest } from "../../data/areas-data"
import { formatPrice } from "../../data/areas-data"

interface AreaRequestsProps {
  requests: AreaRequest[]
}

const statusColors = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  matched: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  closed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

export function AreaRequests({ requests }: AreaRequestsProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No active requests in this area.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Client Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{request.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {request.propertyType}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Bed className="h-3 w-3" />
                        {request.bedrooms} BR
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {formatPrice(request.budget)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {request.notes}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.agentName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${statusColors[request.status]}`}
                    >
                      {request.status}
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
