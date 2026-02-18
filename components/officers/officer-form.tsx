"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const officerSchema = z.object({
  aoNumber: z.string().min(1, "AO Number is required"),
  pcNumber: z.string().min(1, "PC Number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  rank: z.string().min(1, "Rank is required"),
  station: z.string().min(1, "Station is required"),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "RETIRED"]),
  annualLeaveEntitlement: z.number().min(0),
  sickLeaveEntitlement: z.number().min(0),
})

type OfficerFormValues = z.infer<typeof officerSchema>

interface OfficerFormProps {
  stations: string[]
  officer?: Partial<OfficerFormValues> & { id?: string }
}

export function OfficerForm({ stations, officer }: OfficerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const stationOptions = Array.from(new Set([...(officer?.station ? [officer.station] : []), ...stations]))

  const form = useForm<OfficerFormValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      aoNumber: officer?.aoNumber || "",
      pcNumber: officer?.pcNumber || "",
      firstName: officer?.firstName || "",
      lastName: officer?.lastName || "",
      rank: officer?.rank || "",
      station: officer?.station || stationOptions[0] || "Durban Central",
      contactNumber: officer?.contactNumber || "",
      email: officer?.email || "",
      dateOfJoining: officer?.dateOfJoining
        ? new Date(officer.dateOfJoining).toISOString().split("T")[0]
        : "",
      status: officer?.status || "ACTIVE",
      annualLeaveEntitlement: officer?.annualLeaveEntitlement ?? 21,
      sickLeaveEntitlement: officer?.sickLeaveEntitlement ?? 30,
    },
  })

  async function onSubmit(data: OfficerFormValues) {
    setLoading(true)
    setError("")

    try {
      const url = officer?.id ? `/api/officers/${officer.id}` : "/api/officers"
      const method = officer?.id ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateOfJoining: data.dateOfJoining,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      router.push("/dashboard/officers")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Officer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="aoNumber">AO Number *</Label>
              <Input
                id="aoNumber"
                {...form.register("aoNumber")}
                placeholder="AO001234"
                disabled={!!officer?.id}
              />
              {form.formState.errors.aoNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.aoNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pcNumber">PC Number *</Label>
              <Input
                id="pcNumber"
                {...form.register("pcNumber")}
                placeholder="PC567890"
                disabled={!!officer?.id}
              />
              {form.formState.errors.pcNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pcNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rank">Rank / Designation *</Label>
              <Input id="rank" {...form.register("rank")} placeholder="Constable" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="station">Station / Assignment *</Label>
              <Select
                value={form.watch("station")}
                onValueChange={(v) => form.setValue("station", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stationOptions.length > 0 ? (
                    stationOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Durban Central">Durban Central</SelectItem>
                      <SelectItem value="Mayville">Mayville</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                {...form.register("contactNumber")}
                placeholder="0821234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="officer@example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining *</Label>
              <Input
                id="dateOfJoining"
                type="date"
                {...form.register("dateOfJoining")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Employment Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) =>
                  form.setValue("status", v as OfficerFormValues["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="annualLeaveEntitlement">Annual Leave Entitlement (days)</Label>
              <Input
                id="annualLeaveEntitlement"
                type="number"
                {...form.register("annualLeaveEntitlement", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sickLeaveEntitlement">Sick Leave Entitlement (days)</Label>
              <Input
                id="sickLeaveEntitlement"
                type="number"
                {...form.register("sickLeaveEntitlement", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : officer?.id ? "Update" : "Create"} Officer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
