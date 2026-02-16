import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Officers currently on duty (have clocked in today, no clock out yet)
  const onDuty = await prisma.timeEntry.findMany({
    where: {
      clockIn: { gte: today },
      clockOut: null,
    },
    include: { officer: true },
    take: 10,
  })

  // Today's attendance count
  const todayClockedIn = await prisma.timeEntry.count({
    where: {
      clockIn: { gte: today, lt: tomorrow },
    },
  })

  const totalOfficers = await prisma.officer.count({
    where: { status: "ACTIVE" },
  })

  const pendingLeaves = await prisma.leave.count({
    where: { status: "PENDING" },
  })

  const aolAlerts = await prisma.leave.count({
    where: {
      leaveType: "AOL",
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Here&apos;s your overview.
        </p>
      </div>

      <DashboardStats
        onDutyCount={onDuty.length}
        todayClockedIn={todayClockedIn}
        totalOfficers={totalOfficers}
        pendingLeaves={pendingLeaves}
        aolAlerts={aolAlerts}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">🟢</span> Currently On Duty
            </CardTitle>
            <Link href="/dashboard/attendance">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
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
                    <span className="font-medium">
                      {entry.officer.firstName} {entry.officer.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.officer.rank} • {entry.officer.station}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-amber-500">🟡</span> Pending Leave Approvals
            </CardTitle>
            <Link href="/dashboard/leave/approvals">
              <Button variant="outline" size="sm">Review</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{pendingLeaves}</p>
            <p className="text-sm text-muted-foreground">
              Leave applications awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/attendance/clock-in">
          <Button size="lg" className="gap-2">
            <Clock className="h-5 w-5" />
            Clock In
          </Button>
        </Link>
        <Link href="/dashboard/leave/apply">
          <Button variant="secondary" size="lg" className="gap-2">
            <Calendar className="h-5 w-5" />
            Apply Leave
          </Button>
        </Link>
      </div>
    </div>
  )
}
