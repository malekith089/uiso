// app/dashboard/layout.tsx
import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayoutClient from "./layout-client"
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// Cache user profile untuk mengurangi database queries
const getCachedProfile = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return profile
  },
  ['user-profile'], // cache key
  {
    revalidate: 300, // revalidate setiap 5 menit
    tags: ['profile'] // tag untuk invalidation
  }
)

// Cache getUser function
const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, error } = await getCachedUser()

  if (error || !user) {
    redirect("/login")
  }

  // Gunakan cached profile
  const profile = await getCachedProfile(user.id)

  return (
    <DashboardLayoutClient user={user} profile={profile}>
      {children}
    </DashboardLayoutClient>
  )
}

// Tambahkan dynamic export untuk control rendering
export const dynamic = 'force-dynamic' // Bisa diganti ke 'force-static' untuk halaman tertentu
export const revalidate = 300 // Revalidate setiap 5 menit