"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

const leaveTypes = [
  { code: "ANL", name: "Annual Leave", color: "#3B82F6" },
  { code: "SICK", name: "Sick Leave", color: "#EF4444" },
  { code: "AOL", name: "Absence Without Leave", color: "#1F2937" },
  { code: "FR", name: "Family Responsibility", color: "#10B981" },
  { code: "TRN", name: "Training Leave", color: "#F59E0B" },
  { code: "COMP", name: "Compassionate Leave", color: "#8B5CF6" },
  { code: "MAT", name: "Maternity/Paternity", color: "#EC4899" },
  { code: "SUS", name: "Suspension", color: "#6B7280" },
]

export default function ApplyLeavePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [officers, setOfficers] = useState<Array<{
    id: string
    aoNumber: string
    pcNumber: string
    firstName: string
    lastName: string
    rank: string
    station: string
    annualLeaveEntitlement: number
    annualLeaveTaken: number
    sickLeaveEntitlement: number
    sickLeaveTaken: number
  }>>([])
  const [filtered, setFiltered] = useState<typeof officers>([])
  const [selected, setSelected] = useState<typeof officers[0] | null>(null)
  const [leaveType, setLeaveType] = useState("ANL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [excludeWeekends, setExcludeWeekends] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/officers?limit=200")
      .then((r) => r.json())
      .then((d) => {
        const active = d.officers?.filter((o: { status: string }) => o.status === "ACTIVE") || []
        setOfficers(active)
        setFiltered(active)
      })
  }, [])

  useEffect(() => {
    if (!search) {
      setFiltered(officers)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      officers.filter(
        (o) =>
          o.aoNumber.toLowerCase().includes(q) ||
          o.pcNumber.toLowerCase().includes(q) ||
          `${o.firstName} ${o.lastName}`.toLowerCase().includes(q)
      )
    )
  }, [search, officers])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerId: selected.id,
          leaveType,
          startDate,
          endDate,
          reason: reason || undefined,
          excludeWeekends,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      router.push("/dashboard/leave")
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to apply leave")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply Leave</h1>
        <p className="text-muted-foreground">
          Submit a leave application for an officer
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Leave Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search Officer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="AO / PC / Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Officer</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                {filtered.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelected(o)}
                    className={`w-full text-left p-2 hover:bg-muted/50 ${
                      selected?.id === o.id ? "bg-primary/10" : ""
                    }`}
                  >
                    {o.firstName} {o.lastName} - {o.aoNumber} • Annual:{" "}
                    {o.annualLeaveEntitlement - o.annualLeaveTaken}d remaining
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.code} value={lt.code}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: lt.color }}
                        />
                        {lt.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
                />
                Exclude weekends from day count
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Reason / Comments</Label>
              <Input
                placeholder="Optional reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={!selected || loading}>
              {loading ? "Submitting..." : "Submit Leave Application"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
