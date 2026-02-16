import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "attendance"
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    const startDate = start ? new Date(start) : new Date()
    const endDate = end ? new Date(end) : new Date()

    let csv = ""

    switch (type) {
      case "attendance": {
        const entries = await prisma.timeEntry.findMany({
          where: {
            clockIn: { gte: startDate, lte: endDate },
          },
          include: { officer: true },
          orderBy: { clockIn: "asc" },
        })
        csv = "Date,Officer,AO Number,PC Number,Clock In,Clock Out,Hours,Station\n"
        for (const e of entries) {
          csv += `${format(e.clockIn, "yyyy-MM-dd")},${e.officer.firstName} ${e.officer.lastName},${e.officer.aoNumber},${e.officer.pcNumber},${format(e.clockIn, "HH:mm")},${e.clockOut ? format(e.clockOut, "HH:mm") : "On duty"},${e.hoursWorked ?? ""},${e.officer.station}\n`
        }
        break
      }

      case "timesheet": {
        const entries = await prisma.timeEntry.findMany({
          where: {
            clockIn: { gte: startDate, lte: endDate },
            clockOut: { not: null },
          },
          include: { officer: true },
        })
        csv = "Officer,AO Number,Date,Clock In,Clock Out,Hours,Overtime\n"
        for (const e of entries) {
          csv += `${e.officer.firstName} ${e.officer.lastName},${e.officer.aoNumber},${format(e.clockIn, "yyyy-MM-dd")},${format(e.clockIn, "HH:mm")},${e.clockOut ? format(e.clockOut, "HH:mm") : ""},${e.hoursWorked ?? ""},${e.isOvertime ? "Yes" : "No"}\n`
        }
        break
      }

      case "leave": {
        const leaves = await prisma.leave.findMany({
          where: {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          include: { officer: true },
          orderBy: { startDate: "asc" },
        })
        csv = "Officer,AO Number,Leave Type,Start Date,End Date,Days,Status\n"
        for (const l of leaves) {
          csv += `${l.officer.firstName} ${l.officer.lastName},${l.officer.aoNumber},${l.leaveType},${format(l.startDate, "yyyy-MM-dd")},${format(l.endDate, "yyyy-MM-dd")},${l.daysRequested},${l.status}\n`
        }
        break
      }

      case "overtime": {
        const entries = await prisma.timeEntry.findMany({
          where: {
            clockIn: { gte: startDate, lte: endDate },
            isOvertime: true,
          },
          include: { officer: true },
        })
        csv = "Officer,AO Number,Date,Hours,Station\n"
        for (const e of entries) {
          csv += `${e.officer.firstName} ${e.officer.lastName},${e.officer.aoNumber},${format(e.clockIn, "yyyy-MM-dd")},${e.hoursWorked ?? ""},${e.officer.station}\n`
        }
        break
      }

      case "aol": {
        const leaves = await prisma.leave.findMany({
          where: {
            leaveType: "AOL",
            startDate: { gte: startDate, lte: endDate },
          },
          include: { officer: true },
        })
        csv = "Officer,AO Number,Start Date,End Date,Days,Station\n"
        for (const l of leaves) {
          csv += `${l.officer.firstName} ${l.officer.lastName},${l.officer.aoNumber},${format(l.startDate, "yyyy-MM-dd")},${format(l.endDate, "yyyy-MM-dd")},${l.daysRequested},${l.officer.station}\n`
        }
        break
      }

      case "roster": {
        const officers = await prisma.officer.findMany({
          where: { status: "ACTIVE" },
          orderBy: [{ station: "asc" }, { lastName: "asc" }],
        })
        const byStation = officers.reduce((acc, o) => {
          if (!acc[o.station]) acc[o.station] = []
          acc[o.station].push(o)
          return acc
        }, {} as Record<string, typeof officers>)
        csv = "Station,Officer,AO Number,PC Number,Rank\n"
        for (const [station, list] of Object.entries(byStation)) {
          for (const o of list) {
            csv += `${station},${o.firstName} ${o.lastName},${o.aoNumber},${o.pcNumber},${o.rank}\n`
          }
        }
        break
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="report-${type}-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
