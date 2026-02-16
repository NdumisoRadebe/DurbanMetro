import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clockInSchema = z.object({
  officerId: z.string(),
  shiftType: z.enum(["DAY", "NIGHT", "SPECIAL"]).default("DAY"),
  location: z.string().optional(),
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
    const data = clockInSchema.parse(body)

    const officer = await prisma.officer.findUnique({
      where: { id: data.officerId },
    })
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }
    if (officer.status !== "ACTIVE") {
      return NextResponse.json({ error: "Officer is not active" }, { status: 400 })
    }

    // Check if already clocked in (no clock out today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existing = await prisma.timeEntry.findFirst({
      where: {
        officerId: data.officerId,
        clockIn: { gte: today },
        clockOut: null,
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Officer is already clocked in" },
        { status: 400 }
      )
    }

    const entry = await prisma.timeEntry.create({
      data: {
        officerId: data.officerId,
        clockIn: new Date(),
        shiftType: data.shiftType,
        location: data.location,
        notes: data.notes,
        createdBy: session.user.id!,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
