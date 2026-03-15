"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Loader2, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MonthlyReportDownload() {
  const [loading, setLoading] = useState(false)
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(months[currentDate.getMonth()])
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())

  const years = Array.from({ length: 3 }, (_, i) => (currentDate.getFullYear() - i).toString())

  const downloadReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`
      )

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flow-monthly-report-${selectedMonth.toLowerCase()}-${selectedYear}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Failed to download report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Monthly Performance Report</CardTitle>
            <CardDescription>
              Download detailed PDF report with agent metrics and insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={downloadReport} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Report includes:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Executive summary with key KPIs</li>
            <li>Agent performance breakdown</li>
            <li>Revenue and commission analysis</li>
            <li>Conversion rate metrics</li>
            <li>AI-generated insights and recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
