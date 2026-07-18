"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type User = { id: string; fullName: string; email: string; role: string }
type Actual = {
  agent_id: string
  agent_name: string
  sale_deals: number
  rent_deals: number
  sale_commission_aed: number
  rent_commission_aed: number
  sale_revenue_aed: number
  rent_revenue_aed: number
  listings: number
  viewings: number
  include_deals_rollup: boolean
  notes: string
}

type Company = {
  target_deals: number
  target_sale_deals: number
  target_rent_deals: number
  target_commission_aed: number
  target_sale_commission_aed: number
  target_rent_commission_aed: number
  target_revenue_aed: number
  target_listings: number
  target_viewings: number
  notes: string
}

const emptyCompany: Company = {
  target_deals: 20,
  target_sale_deals: 8,
  target_rent_deals: 12,
  target_commission_aed: 400000,
  target_sale_commission_aed: 280000,
  target_rent_commission_aed: 120000,
  target_revenue_aed: 8000000,
  target_listings: 40,
  target_viewings: 80,
  notes: "",
}

export function AgentPerformanceEditor() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [users, setUsers] = useState<User[]>([])
  const [actuals, setActuals] = useState<Record<string, Actual>>({})
  const [company, setCompany] = useState<Company>(emptyCompany)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, aRes, tRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch(`/api/performance/actuals?year=${year}&month=${month}`),
        fetch(`/api/performance/targets?year=${year}&month=${month}`),
      ])
      const uJson = await uRes.json()
      const aJson = await aRes.json()
      const tJson = await tRes.json()

      const list: User[] = (uJson.users || []).map(
        (u: { id: string; name?: string; fullName?: string; email: string; role: string }) => ({
          id: u.id,
          fullName: u.name || u.fullName || u.email,
          email: u.email,
          role: u.role,
        })
      )
      setUsers(list)

      const map: Record<string, Actual> = {}
      for (const row of aJson.actuals || []) {
        map[row.agent_id] = row
      }
      for (const u of list) {
        if (!map[u.id]) {
          map[u.id] = {
            agent_id: u.id,
            agent_name: u.fullName,
            sale_deals: 0,
            rent_deals: 0,
            sale_commission_aed: 0,
            rent_commission_aed: 0,
            sale_revenue_aed: 0,
            rent_revenue_aed: 0,
            listings: 0,
            viewings: 0,
            include_deals_rollup: true,
            notes: "",
          }
        }
      }
      setActuals(map)

      if (tJson.company) {
        setCompany({
          target_deals: Number(tJson.company.target_deals) || 0,
          target_sale_deals: Number(tJson.company.target_sale_deals) || 0,
          target_rent_deals: Number(tJson.company.target_rent_deals) || 0,
          target_commission_aed: Number(tJson.company.target_commission_aed) || 0,
          target_sale_commission_aed: Number(tJson.company.target_sale_commission_aed) || 0,
          target_rent_commission_aed: Number(tJson.company.target_rent_commission_aed) || 0,
          target_revenue_aed: Number(tJson.company.target_revenue_aed) || 0,
          target_listings: Number(tJson.company.target_listings) || 0,
          target_viewings: Number(tJson.company.target_viewings) || 0,
          notes: tJson.company.notes || "",
        })
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to load performance admin data")
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    void load()
  }, [load])

  const saveCompany = async () => {
    setSavingId("company")
    try {
      const res = await fetch("/api/performance/targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "company", year, month, ...company }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast.success("Company KPIs saved")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingId(null)
    }
  }

  const saveAgent = async (agentId: string) => {
    setSavingId(agentId)
    try {
      const row = actuals[agentId]
      const res = await fetch("/api/performance/actuals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          agentId,
          agentName: row.agent_name,
          ...row,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast.success(`Saved ${row.agent_name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingId(null)
    }
  }

  const patch = (agentId: string, key: keyof Actual, value: string | number | boolean) => {
    setActuals((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {new Date(2000, i, 1).toLocaleString("en", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle>Company KPI standards</CardTitle>
            <CardDescription>Shared monthly targets for the brokerage</CardDescription>
          </div>
          <Button size="sm" onClick={() => void saveCompany()} disabled={savingId === "company"}>
            {savingId === "company" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save company
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["target_revenue_aed", "Revenue target AED"],
              ["target_commission_aed", "Commission target AED"],
              ["target_deals", "Total deals"],
              ["target_sale_deals", "Sale deals"],
              ["target_rent_deals", "Rent deals"],
              ["target_sale_commission_aed", "Sale commission AED"],
              ["target_rent_commission_aed", "Rent commission AED"],
              ["target_listings", "Listings"],
              ["target_viewings", "Viewings"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                value={company[key]}
                onChange={(e) => setCompany((c) => ({ ...c, [key]: Number(e.target.value) }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent monthly commission</CardTitle>
          <CardDescription>
            Enter actual sales vs rental commission per agent for the selected month.
            Turn off “+ deals?” to replace CRM closed deals entirely with these numbers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Sale deals</TableHead>
                    <TableHead>Rent deals</TableHead>
                    <TableHead>Sale comm.</TableHead>
                    <TableHead>Rent comm.</TableHead>
                    <TableHead>+ deals?</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const row = actuals[u.id]
                    if (!row) return null
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium whitespace-nowrap">{u.fullName}</TableCell>
                        <TableCell>
                          <Input
                            className="w-20"
                            type="number"
                            value={row.sale_deals}
                            onChange={(e) => patch(u.id, "sale_deals", Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-20"
                            type="number"
                            value={row.rent_deals}
                            onChange={(e) => patch(u.id, "rent_deals", Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-28"
                            type="number"
                            value={row.sale_commission_aed}
                            onChange={(e) => patch(u.id, "sale_commission_aed", Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-28"
                            type="number"
                            value={row.rent_commission_aed}
                            onChange={(e) => patch(u.id, "rent_commission_aed", Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={row.include_deals_rollup}
                            onCheckedChange={(v) => patch(u.id, "include_deals_rollup", v)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void saveAgent(u.id)}
                            disabled={savingId === u.id}
                          >
                            {savingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
