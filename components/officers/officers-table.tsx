"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Pencil, Eye } from "lucide-react"
import Link from "next/link"
import { Officer } from "@prisma/client"
import { formatDate } from "@/lib/utils"

interface OfficersTableProps {
  initialOfficers: Officer[]
  stations: string[]
}

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
  RETIRED: "outline",
}

export function OfficersTable({ initialOfficers, stations }: OfficersTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [stationFilter, setStationFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = initialOfficers.filter((o) => {
    const matchSearch =
      !search ||
      o.aoNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.pcNumber.toLowerCase().includes(search.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchStation = stationFilter === "all" || o.station === stationFilter
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStation && matchStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by AO, PC, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stationFilter} onValueChange={setStationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AO / PC</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell className="font-mono">
                  {officer.aoNumber} / {officer.pcNumber}
                </TableCell>
                <TableCell className="font-medium">
                  {officer.firstName} {officer.lastName}
                </TableCell>
                <TableCell>{officer.rank}</TableCell>
                <TableCell>{officer.station}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[officer.status] as "success" | "secondary" | "destructive" | "outline" || "outline"}>
                    {officer.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(officer.dateOfJoining)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/officers/${officer.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/officers/${officer.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">No officers found</p>
      )}
    </div>
  )
}
