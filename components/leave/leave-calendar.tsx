"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"

interface Leave {
  id: string
  leaveType: string
  startDate: Date | string
  endDate: Date | string
  officer: { firstName: string; lastName: string }
}

interface LeaveCalendarProps {
  leaves: Leave[]
}

export function LeaveCalendar({ leaves }: LeaveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start to align with week
  const startPadding = monthStart.getDay()
  const paddedDays = [...Array(startPadding).fill(null), ...days]

  const getLeavesForDay = (day: Date) => {
    return leaves.filter((l) => {
      const start = new Date(l.startDate)
      const end = new Date(l.endDate)
      return start <= day && end >= day
    })
  }

  const leaveColors: Record<string, string> = {
    ANL: "bg-blue-500",
    SICK: "bg-red-500",
    AOL: "bg-gray-800",
    FR: "bg-green-500",
    TRN: "bg-orange-500",
    COMP: "bg-purple-500",
    MAT: "bg-pink-500",
    SUS: "bg-gray-500",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
        >
          Previous
        </Button>
        <h3 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
        >
          Next
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="min-h-[80px] border rounded p-1 bg-muted/30" />
          }
          const dayLeaves = getLeavesForDay(day)
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] border rounded p-1 ${
                isSameDay(day, new Date()) ? "bg-primary/5 border-primary" : ""
              }`}
            >
              <span className="text-sm font-medium">{format(day, "d")}</span>
              <div className="mt-1 space-y-0.5">
                {dayLeaves.slice(0, 2).map((l) => (
                  <div
                    key={l.id}
                    className={`text-xs truncate px-1 py-0.5 rounded ${
                      leaveColors[l.leaveType] || "bg-gray-400"
                    } text-white`}
                    title={`${l.officer.firstName} ${l.officer.lastName} - ${l.leaveType}`}
                  >
                    {l.officer.firstName[0]}{l.officer.lastName[0]} {l.leaveType}
                  </div>
                ))}
                {dayLeaves.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayLeaves.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
