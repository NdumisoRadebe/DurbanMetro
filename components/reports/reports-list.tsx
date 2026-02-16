"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download } from "lucide-react"

const reportTypes = [
  { id: "attendance", name: "Daily Attendance Report", description: "Who's in, who's out, who's on leave" },
  { id: "timesheet", name: "Monthly Timesheet", description: "Hours per officer, per day" },
  { id: "leave", name: "Leave Register", description: "All leave transactions by period" },
  { id: "overtime", name: "Overtime Report", description: "Officers exceeding standard hours" },
  { id: "aol", name: "AOL Report", description: "Unauthorized absences with patterns" },
  { id: "roster", name: "Station Roster", description: "Personnel allocation by location" },
]

export function ReportsList() {
  const [reportType, setReportType] = useState("attendance")
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        start: startDate,
        end: endDate,
      })
      const res = await fetch(`/api/reports?${params}`)
      if (!res.ok) throw new Error("Failed to generate report")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${reportType}-${startDate}-${endDate}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {reportTypes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReportType(r.id)}
                className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                  reportType === r.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <FileText className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            {loading ? "Generating..." : "Generate & Download"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
