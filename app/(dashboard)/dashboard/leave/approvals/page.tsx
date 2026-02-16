import { prisma } from "@/lib/prisma"
import { LeaveApprovalsList } from "@/components/leave/leave-approvals-list"

export default async function LeaveApprovalsPage() {
  const pendingLeaves = await prisma.leave.findMany({
    where: { status: "PENDING" },
    include: { officer: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve pending leave applications
        </p>
      </div>

      <LeaveApprovalsList leaves={pendingLeaves} />
    </div>
  )
}
