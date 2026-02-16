import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entries = await prisma.timeEntry.findMany({
      where: {
        clockIn: { gte: today },
        clockOut: null,
      },
      include: { officer: true },
    })

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        officerId: e.officerId,
        clockIn: e.clockIn.toISOString(),
        officer: e.officer,
      })),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
