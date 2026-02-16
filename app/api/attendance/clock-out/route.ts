import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { calculateHours } from "@/lib/utils"

const clockOutSchema = z.object({
  officerId: z.string(),
  breakMinutes: z.number().default(0),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const data = clockOutSchema.parse(body)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entry = await prisma.timeEntry.findFirst({
      where: {
        officerId: data.officerId,
        clockIn: { gte: today },
        clockOut: null,
      },
      include: { officer: true },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "No active clock-in found for this officer" },
        { status: 404 }
      )
    }

    const clockOut = new Date()
    const hoursWorked = calculateHours(
      entry.clockIn,
      clockOut,
      data.breakMinutes
    )
    const isOvertime = hoursWorked > 8

    const updated = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        clockOut,
        hoursWorked,
        isOvertime,
        breakMinutes: data.breakMinutes,
        notes: data.notes ? `${entry.notes || ""}\n${data.notes}`.trim() : entry.notes,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
