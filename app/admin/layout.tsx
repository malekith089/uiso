import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminLayoutClient from "./layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user profile to check for admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    // Redirect non-admin users to the regular dashboard
    redirect("/dashboard")
  }

  return (
    <AdminLayoutClient user={user} profile={profile}>
      {children}
    </AdminLayoutClient>
  )
}
