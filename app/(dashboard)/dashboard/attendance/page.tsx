import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClockIn, ClockOut } from "lucide-react"
import { formatDateTime, formatTime } from "@/lib/utils"

export default async function AttendancePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayEntries = await prisma.timeEntry.findMany({
    where: {
      clockIn: { gte: today, lt: tomorrow },
    },
    include: { officer: true },
    orderBy: { clockIn: "desc" },
  })

  const onDuty = todayEntries.filter((e) => !e.clockOut)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Time capture and attendance management
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/attendance/clock-in">
            <Button className="gap-2">
              <ClockIn className="h-5 w-5" />
              Clock In
            </Button>
          </Link>
          <Link href="/dashboard/attendance/clock-out">
            <Button variant="secondary" className="gap-2">
              <ClockOut className="h-5 w-5" />
              Clock Out
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">🟢</span> Currently On Duty ({onDuty.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onDuty.length === 0 ? (
              <p className="text-sm text-muted-foreground">No officers currently on duty</p>
            ) : (
              <ul className="space-y-2">
                {onDuty.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <span className="font-medium">
                        {entry.officer.firstName} {entry.officer.lastName}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {entry.officer.rank} • {entry.officer.station}
                      </p>
                    </div>
                    <span className="text-sm">
                      In: {formatTime(entry.clockIn)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries today</p>
            ) : (
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {todayEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {entry.officer.firstName} {entry.officer.lastName}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : "On duty"}
                      </p>
                    </div>
                    {entry.hoursWorked != null && (
                      <span className={entry.isOvertime ? "text-amber-600 font-medium" : ""}>
                        {entry.hoursWorked}h {entry.isOvertime && "(OT)"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
