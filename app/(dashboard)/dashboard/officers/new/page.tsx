import { OfficerForm } from "@/components/officers/officer-form"
import { prisma } from "@/lib/prisma"

export default async function NewOfficerPage() {
  const stations = await prisma.officer.findMany({
    select: { station: true },
    distinct: ["station"],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Officer</h1>
        <p className="text-muted-foreground">
          Register a new officer in the system
        </p>
      </div>

      <OfficerForm stations={stations.map((s) => s.station)} />
    </div>
  )
}
