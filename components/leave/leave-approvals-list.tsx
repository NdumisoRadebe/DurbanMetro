"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"

interface Leave {
  id: string
  leaveType: string
  startDate: Date
  endDate: Date
  daysRequested: number
  reason: string | null
  officer: { firstName: string; lastName: string; aoNumber: string; station: string }
}

interface LeaveApprovalsListProps {
  leaves: Leave[]
}

const leaveTypeNames: Record<string, string> = {
  ANL: "Annual Leave",
  SICK: "Sick Leave",
  AOL: "Absence Without Leave",
  FR: "Family Responsibility",
  TRN: "Training Leave",
  COMP: "Compassionate Leave",
  MAT: "Maternity/Paternity",
  SUS: "Suspension",
}

export function LeaveApprovalsList({ leaves }: LeaveApprovalsListProps) {
  const router = useRouter()
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  async function handleApprove(id: string) {
    setApproving(id)
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (!res.ok) throw new Error("Failed")
      router.refresh()
    } catch {
      alert("Failed to approve")
    } finally {
      setApproving(null)
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    setRejecting(id)
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectReason,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      setRejectReason("")
      setRejecting(null)
      router.refresh()
    } catch {
      alert("Failed to reject")
      setRejecting(null)
    }
  }

  if (leaves.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No pending leave approvals
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {leaves.map((leave) => (
        <Card key={leave.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {leave.officer.firstName} {leave.officer.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {leave.officer.aoNumber} • {leave.officer.station}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {leaveTypeNames[leave.leaveType] || leave.leaveType}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Period:</span>{" "}
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
              </div>
              <div>
                <span className="text-muted-foreground">Days:</span>{" "}
                {leave.daysRequested}
              </div>
              {leave.reason && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Reason:</span>{" "}
                  {leave.reason}
                </div>
              )}
            </div>

            {rejecting === leave.id ? (
              <div className="space-y-2">
                <Label>Rejection Reason (required)</Label>
                <Input
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(leave.id)}
                    disabled={!rejectReason.trim()}
                  >
                    Confirm Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejecting(null)
                      setRejectReason("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(leave.id)}
                  disabled={!!approving}
                >
                  {approving === leave.id ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejecting(leave.id)}
                  disabled={!!approving}
                >
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
