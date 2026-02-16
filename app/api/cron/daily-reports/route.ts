import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Verify cron secret (skip in development if not set)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // TODO: Send daily summary reports to HR managers via email
  console.log("Daily reports cron executed")
  return NextResponse.json({ success: true })
}
