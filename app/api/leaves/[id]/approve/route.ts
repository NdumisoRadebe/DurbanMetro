import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
})

export async function POST(
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
    const data = approveSchema.parse(body)

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: { officer: true },
    })

    if (!leave) return NextResponse.json({ error: "Leave not found" }, { status: 404 })
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { error: "Leave has already been processed" },
        { status: 400 }
      )
    }

    if (data.action === "reject" && !data.rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.leave.update({
        where: { id },
        data: {
          status: data.action === "approve" ? "APPROVED" : "REJECTED",
          daysApproved: data.action === "approve" ? leave.daysRequested : null,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          rejectionReason: data.action === "reject" ? data.rejectionReason : null,
        },
      })

      if (data.action === "approve" && leave.leaveType === "ANL") {
        await tx.officer.update({
          where: { id: leave.officerId },
          data: {
            annualLeaveTaken: { increment: leave.daysRequested },
          },
        })
      }
      if (data.action === "approve" && leave.leaveType === "SICK") {
        await tx.officer.update({
          where: { id: leave.officerId },
          data: {
            sickLeaveTaken: { increment: leave.daysRequested },
          },
        })
      }

      return l
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
