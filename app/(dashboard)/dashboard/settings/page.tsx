import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          System configuration and account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{session?.user?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge>{session?.user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            DMP-TMS v1.0 - Durban Metropolitan Police Time Management System
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            eThekwini Municipality
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
