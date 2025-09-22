// app/dashboard/layout.tsx
import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayoutClient from "./layout-client"
import { cache } from 'react'

// Cache getUser function - ini aman karena tidak menggunakan cookies di dalam cache
const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
})

// Pindahkan profile fetching ke function terpisah tanpa unstable_cache
async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  return profile
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, error } = await getCachedUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch profile tanpa caching di server side - biarkan client side yang handle caching
  const profile = await getUserProfile(user.id)

  return (
    <DashboardLayoutClient user={user} profile={profile}>
      {children}
    </DashboardLayoutClient>
  )
}

// Hapus export yang menyebabkan masalah
// export const dynamic = 'force-dynamic'
// export const revalidate = 300