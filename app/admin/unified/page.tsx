import { createClient } from "@/lib/supabase/server"
import UnifiedManagementClient from "./client-page"

const OSP_SUBJECTS = [
  { id: "1", name: "Matematika" },
  { id: "2", name: "Fisika" },
  { id: "3", name: "Kimia" },
  { id: "4", name: "Biologi" },
  { id: "5", name: "Geografi" },
  { id: "6", name: "Kebumian" },
]

export interface UnifiedRegistration {
  id: string
  user_id: string
  competition_id: string
  team_name: string | null
  team_size: number
  status: string
  phone?: string | null
  identity_card_url: string | null
  engagement_proof_url: string | null
  payment_proof_url: string | null
  created_at: string
  updated_at: string
  selected_subject_id?: string | null
  identity_card_verified?: boolean
  engagement_proof_verified?: boolean
  payment_proof_verified?: boolean
  verified_by?: string | null
  verified_at?: string | null
  profiles: {
    id: string
    full_name: string
    email: string
    school_institution: string
    education_level: string
    identity_number: string
    phone?: string | null
    kelas?: string | null
    semester?: number | null
    tempat_lahir?: string | null
    tanggal_lahir?: string | null
    jenis_kelamin?: "Laki-laki" | "Perempuan" | null
    alamat?: string | null
    created_at: string
  }
  competitions: {
    name: string
    code: string
    participant_type: string
  }
  team_members: Array<{
    id: string
    full_name: string
    identity_number: string
    identity_card_url: string | null
    email: string
    phone: string
    school_institution: string
    education_level: string
    kelas: string | null
    semester: number | null
    tempat_lahir: string | null
    tanggal_lahir: string | null
    jenis_kelamin: "Laki-laki" | "Perempuan" | null
    alamat: string | null
    identity_card_verified: boolean
  }>
}

// 🔥 OPTIMIZED: Get stats without unstable_cache to avoid cookie issues
async function getOptimizedStats() {
  const supabase = await createClient()

  try {
    // Try RPC function first (most efficient)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_registration_stats')

    if (!rpcError && rpcData && rpcData[0]) {
      return {
        total: Number(rpcData[0].total),
        approved: Number(rpcData[0].approved),
        pending: Number(rpcData[0].pending),
        rejected: Number(rpcData[0].rejected),
        approvedToday: Number(rpcData[0].approved_today),
        rejectedToday: Number(rpcData[0].rejected_today),
      }
    }

    console.warn("RPC not available, using fallback query")
    
    // Fallback: optimized query (only get status and updated_at)
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select("status, updated_at")

    if (error) throw error

    const today = new Date().toISOString().split("T")[0]
    let approvedCount = 0, pendingCount = 0, rejectedCount = 0
    let todayApproved = 0, todayRejected = 0

    for (const reg of registrations) {
      switch (reg.status) {
        case "approved":
          approvedCount++
          if (reg.updated_at.startsWith(today)) {
            todayApproved++
          }
          break
        case "pending":
          pendingCount++
          break
        case "rejected":
          rejectedCount++
          if (reg.updated_at.startsWith(today)) {
            todayRejected++
          }
          break
      }
    }

    return {
      total: registrations.length,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      approvedToday: todayApproved,
      rejectedToday: todayRejected,
    }

  } catch (error) {
    console.error("Error fetching stats:", error)
    // Return zeros instead of crashing
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      approvedToday: 0,
      rejectedToday: 0,
    }
  }
}

export default async function UnifiedManagementPage() {
  // 🔥 OPTIMIZED: Get stats with RPC function (still much faster than before)
  const stats = await getOptimizedStats()

  return (
    <UnifiedManagementClient
      stats={stats}
      ospSubjects={OSP_SUBJECTS}
    />
  )
}