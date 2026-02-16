import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { LeaveCalendar } from "@/components/leave/leave-calendar"

const leaveTypeColors: Record<string, string> = {
  ANL: "bg-blue-100 text-blue-800",
  SICK: "bg-red-100 text-red-800",
  AOL: "bg-gray-900 text-white",
  FR: "bg-green-100 text-green-800",
  TRN: "bg-orange-100 text-orange-800",
  COMP: "bg-purple-100 text-purple-800",
  MAT: "bg-pink-100 text-pink-800",
  SUS: "bg-gray-100 text-gray-800",
}

export default async function LeavePage() {
  const pendingLeaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { officer: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const endOfMonth = new Date(startOfMonth)
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)

  const monthLeaves = await prisma.leave.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: endOfMonth },
      endDate: { gte: startOfMonth },
    },
    include: { officer: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage leave applications and approvals
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/leave/apply">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Apply Leave
            </Button>
          </Link>
          <Link href="/dashboard/leave/approvals">
            <Button variant="secondary" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approvals ({pendingLeaves.length})
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveCalendar leaves={monthLeaves} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Link href="/dashboard/leave/approvals">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            ) : (
              <ul className="space-y-2">
                {pendingLeaves.map((leave) => (
                  <li
                    key={leave.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <span className="font-medium">
                        {leave.officer.firstName} {leave.officer.lastName}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {leave.leaveType} • {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        leaveTypeColors[leave.leaveType] || "bg-gray-100"
                      }`}
                    >
                      {leave.daysRequested}d
                    </span>
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
