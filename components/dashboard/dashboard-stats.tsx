"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Calendar, AlertTriangle, UserCheck } from "lucide-react"
import Link from "next/link"

interface DashboardStatsProps {
  onDutyCount: number
  todayClockedIn: number
  totalOfficers: number
  pendingLeaves: number
  aolAlerts: number
}

export function DashboardStats({
  onDutyCount,
  todayClockedIn,
  totalOfficers,
  pendingLeaves,
  aolAlerts,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Currently On Duty",
      value: onDutyCount,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Today's Attendance",
      value: todayClockedIn,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Officers",
      value: totalOfficers,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
    },
    {
      title: "Pending Leave",
      value: pendingLeaves,
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "AOL Alerts",
      value: aolAlerts,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
