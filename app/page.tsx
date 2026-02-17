import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  try {
    const session = await getServerSession(authOptions)
    if (session) {
      redirect("/dashboard")
    }
  } catch {
    // If auth fails (e.g. missing env vars), still redirect to login
  }
  redirect("/login")
}
