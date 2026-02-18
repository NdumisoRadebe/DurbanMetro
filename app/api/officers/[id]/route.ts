import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  aoNumber: z.string().optional(),
  pcNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  rank: z.string().optional(),
  station: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  dateOfJoining: z.string().transform((s) => new Date(s)).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "RETIRED"]).optional(),
  annualLeaveEntitlement: z.number().optional(),
  sickLeaveEntitlement: z.number().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const officer = await prisma.officer.findUnique({
      where: { id },
      include: {
        timeEntries: { take: 10, orderBy: { clockIn: "desc" } },
        leaves: { take: 10, orderBy: { createdAt: "desc" } },
      },
    })

    if (!officer) return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    return NextResponse.json(officer)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const data = updateSchema.parse(body)

    const officer = await prisma.officer.update({
      where: { id },
      data: {
        ...data,
        email: data.email === "" ? null : data.email,
      },
    })

    return NextResponse.json(officer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Soft delete - set status to INACTIVE
    await prisma.officer.update({
      where: { id },
      data: { status: "INACTIVE" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
