import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OfficerForm } from "@/components/officers/officer-form"

export default async function EditOfficerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const officer = await prisma.officer.findUnique({
    where: { id },
  })

  if (!officer) notFound()

  const stations = await prisma.officer.findMany({
    select: { station: true },
    distinct: ["station"],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Officer</h1>
        <p className="text-muted-foreground">
          Update officer details
        </p>
      </div>

      <OfficerForm
        officer={{
          ...officer,
          dateOfJoining: officer.dateOfJoining.toISOString().split("T")[0],
        }}
        stations={stations.map((s) => s.station)}
      />
    </div>
  )
}
