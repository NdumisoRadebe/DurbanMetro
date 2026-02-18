import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const officerSchema = z.object({
  aoNumber: z.string().min(1, "AO Number is required"),
  pcNumber: z.string().min(1, "PC Number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rank: z.string().min(1, "Rank is required"),
  station: z.string().min(1, "Station is required"),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  dateOfJoining: z.string().transform((s) => new Date(s)),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "RETIRED"]).default("ACTIVE"),
  annualLeaveEntitlement: z.number().default(21),
  sickLeaveEntitlement: z.number().default(30),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const station = searchParams.get("station")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { aoNumber: { contains: search, mode: "insensitive" } },
        { pcNumber: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ]
    }
    if (station) where.station = station
    if (status) where.status = status

    const [officers, total] = await Promise.all([
      prisma.officer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.officer.count({ where }),
    ])

    return NextResponse.json({
      officers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
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
    const data = officerSchema.parse(body)

    const existing = await prisma.officer.findFirst({
      where: {
        OR: [{ aoNumber: data.aoNumber }, { pcNumber: data.pcNumber }],
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Officer with this AO or PC number already exists" },
        { status: 400 }
      )
    }

    const officer = await prisma.officer.create({
      data: {
        ...data,
        email: data.email || undefined,
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
