"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface OnDutyOfficer {
  id: string
  officerId: string
  clockIn: string
  officer: {
    id: string
    aoNumber: string
    pcNumber: string
    firstName: string
    lastName: string
    rank: string
    station: string
  }
}

export default function ClockOutPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<OnDutyOfficer[]>([])
  const [filtered, setFiltered] = useState<OnDutyOfficer[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<OnDutyOfficer | null>(null)
  const [breakMinutes, setBreakMinutes] = useState(0)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/attendance/on-duty")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || [])
        setFiltered(d.entries || [])
      })
  }, [])

  useEffect(() => {
    if (!search) {
      setFiltered(entries)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      entries.filter(
        (e: OnDutyOfficer) =>
          e.officer.aoNumber.toLowerCase().includes(q) ||
          e.officer.pcNumber.toLowerCase().includes(q) ||
          `${e.officer.firstName} ${e.officer.lastName}`.toLowerCase().includes(q)
      )
    )
  }, [search, entries])

  async function handleClockOut() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerId: selected.officerId,
          breakMinutes,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      router.push("/dashboard/attendance")
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to clock out")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clock Out</h1>
        <p className="text-muted-foreground">
          Record officer clock-out time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officers Currently On Duty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Officer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelected(e)}
                className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                  selected?.id === e.id ? "bg-primary/10 border-l-4 border-primary" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {e.officer.firstName} {e.officer.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    In: {formatTime(e.clockIn)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {e.officer.aoNumber} • {e.officer.rank} • {e.officer.station}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No officers currently on duty
              </p>
            )}
          </div>

          {selected && (
            <>
              <div className="space-y-2">
                <Label>Break Minutes</Label>
                <Input
                  type="number"
                  min={0}
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                variant="secondary"
                onClick={handleClockOut}
                disabled={loading}
              >
                {loading ? "Processing..." : "Clock Out"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
