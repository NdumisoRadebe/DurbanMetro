import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Download } from "lucide-react"
import { ReportsList } from "@/components/reports/reports-list"

export default async function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export attendance and leave reports
        </p>
      </div>

      <ReportsList />
    </div>
  )
}
