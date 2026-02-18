import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { calculateLeaveDays } from "@/lib/utils"

const leaveSchema = z.object({
  officerId: z.string(),
  leaveType: z.enum(["ANL", "SICK", "AOL", "FR", "TRN", "COMP", "MAT", "SUS"]),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  reason: z.string().optional(),
  excludeWeekends: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const officerId = searchParams.get("officerId")
    const status = searchParams.get("status")
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    const where: Record<string, unknown> = {}
    if (officerId) where.officerId = officerId
    if (status) where.status = status
    if (start && end) {
      where.OR = [
        {
          startDate: { gte: new Date(start) },
          endDate: { lte: new Date(end) },
        },
        {
          startDate: { lte: new Date(end) },
          endDate: { gte: new Date(start) },
        },
      ]
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: { officer: true },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json(leaves)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const data = leaveSchema.parse(body)

    if (data.endDate < data.startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    const daysRequested = calculateLeaveDays(
      data.startDate,
      data.endDate,
      data.excludeWeekends
    )

    const officer = await prisma.officer.findUnique({
      where: { id: data.officerId },
    })
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    // Check balance for annual/sick leave
    if (data.leaveType === "ANL") {
      const remaining = officer.annualLeaveEntitlement - officer.annualLeaveTaken
      if (daysRequested > remaining) {
        return NextResponse.json(
          { error: `Insufficient annual leave. Remaining: ${remaining} days` },
          { status: 400 }
        )
      }
    }
    if (data.leaveType === "SICK") {
      const remaining = officer.sickLeaveEntitlement - officer.sickLeaveTaken
      if (daysRequested > remaining) {
        return NextResponse.json(
          { error: `Insufficient sick leave. Remaining: ${remaining} days` },
          { status: 400 }
        )
      }
    }

    const leave = await prisma.leave.create({
      data: {
        officerId: data.officerId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        daysRequested,
        reason: data.reason,
      },
      include: { officer: true },
    })

    return NextResponse.json(leave)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
