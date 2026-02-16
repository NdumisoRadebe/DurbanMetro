import { prisma } from "@/lib/prisma"
import { OfficersTable } from "@/components/officers/officers-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function OfficersPage() {
  const officers = await prisma.officer.findMany({
    orderBy: { createdAt: "desc" },
  })
  const stations = await prisma.officer.findMany({
    select: { station: true },
    distinct: ["station"],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officers</h1>
          <p className="text-muted-foreground">
            Manage officer profiles and view duty status
          </p>
        </div>
        <Link href="/dashboard/officers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Officer
          </Button>
        </Link>
      </div>

      <OfficersTable
        initialOfficers={officers}
        stations={stations.map((s) => s.station)}
      />
    </div>
  )
}
