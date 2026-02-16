import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, Clock, Calendar } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"

export default async function OfficerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const officer = await prisma.officer.findUnique({
    where: { id },
    include: {
      timeEntries: { take: 5, orderBy: { clockIn: "desc" } },
      leaves: { take: 5, orderBy: { createdAt: "desc" } },
    },
  })

  if (!officer) notFound()

  const statusColors: Record<string, string> = {
    ACTIVE: "success",
    INACTIVE: "secondary",
    SUSPENDED: "destructive",
    RETIRED: "outline",
  }

  const annualRemaining = officer.annualLeaveEntitlement - officer.annualLeaveTaken
  const sickRemaining = officer.sickLeaveEntitlement - officer.sickLeaveTaken

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {officer.firstName} {officer.lastName}
          </h1>
          <p className="text-muted-foreground">
            {officer.aoNumber} / {officer.pcNumber}
          </p>
        </div>
        <Link href={`/dashboard/officers/${id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Rank</span>
              <span>{officer.rank}</span>
              <span className="text-muted-foreground">Station</span>
              <span>{officer.station}</span>
              <span className="text-muted-foreground">Contact</span>
              <span>{officer.contactNumber || "-"}</span>
              <span className="text-muted-foreground">Email</span>
              <span>{officer.email || "-"}</span>
              <span className="text-muted-foreground">Date Joined</span>
              <span>{formatDate(officer.dateOfJoining)}</span>
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusColors[officer.status] as "success" | "secondary" | "destructive" | "outline" || "outline"}>
                {officer.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Annual Leave</span>
              <span>
                {annualRemaining} / {officer.annualLeaveEntitlement} days
              </span>
              <span className="text-muted-foreground">Sick Leave</span>
              <span>
                {sickRemaining} / {officer.sickLeaveEntitlement} days
              </span>
            </div>
            {annualRemaining < 5 && (
              <p className="text-sm text-amber-600">Low annual leave balance</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Time Entries
            </CardTitle>
            <Link href="/dashboard/attendance">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {officer.timeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No time entries</p>
            ) : (
              <ul className="space-y-2">
                {officer.timeEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex justify-between text-sm border-b pb-2 last:border-0"
                  >
                    <span>{formatDateTime(entry.clockIn)}</span>
                    <span>
                      {entry.clockOut
                        ? `${entry.hoursWorked}h`
                        : "On duty"}
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
              <Calendar className="h-5 w-5" />
              Recent Leave
            </CardTitle>
            <Link href="/dashboard/leave">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {officer.leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave records</p>
            ) : (
              <ul className="space-y-2">
                {officer.leaves.map((leave) => (
                  <li
                    key={leave.id}
                    className="flex justify-between text-sm border-b pb-2 last:border-0"
                  >
                    <span>{leave.leaveType} - {formatDate(leave.startDate)}</span>
                    <Badge variant={leave.status === "APPROVED" ? "success" : leave.status === "REJECTED" ? "destructive" : "secondary"}>
                      {leave.status}
                    </Badge>
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
