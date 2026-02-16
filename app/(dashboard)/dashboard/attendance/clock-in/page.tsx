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

export default function ClockInPage() {
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
    status: string
  }>>([])
  const [filtered, setFiltered] = useState<typeof officers>([])
  const [selected, setSelected] = useState<typeof officers[0] | null>(null)
  const [shiftType, setShiftType] = useState<"DAY" | "NIGHT" | "SPECIAL">("DAY")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetch("/api/officers?limit=100")
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

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  async function handleClockIn() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerId: selected.id,
          shiftType,
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
      alert(e instanceof Error ? e.message : "Failed to clock in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clock In</h1>
        <p className="text-muted-foreground">
          Record officer clock-in time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Time</span>
            <span className="text-2xl font-mono text-primary">
              {currentTime.toLocaleTimeString("en-ZA")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search Officer (AO / PC / Name)</Label>
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

          <div className="space-y-2">
            <Label>Select Officer</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
              {filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                    selected?.id === o.id ? "bg-primary/10 border-l-4 border-primary" : ""
                  }`}
                >
                  <span className="font-medium">
                    {o.firstName} {o.lastName}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {o.aoNumber} • {o.rank} • {o.station}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No officers found</p>
              )}
            </div>
          </div>

          {selected && (
            <>
              <div className="space-y-2">
                <Label>Shift Type</Label>
                <Select value={shiftType} onValueChange={(v: "DAY" | "NIGHT" | "SPECIAL") => setShiftType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Day</SelectItem>
                    <SelectItem value="NIGHT">Night</SelectItem>
                    <SelectItem value="SPECIAL">Special</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={handleClockIn}
                disabled={loading}
              >
                {loading ? "Processing..." : "Clock In"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
