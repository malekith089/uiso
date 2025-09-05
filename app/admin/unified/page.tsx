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
  }>
}

export default async function UnifiedManagementPage() {
  const supabase = await createClient()

  // Fetch all registrations with related data (not just pending)
  // Get comprehensive statistics
  const today = new Date().toISOString().split("T")[0]

  const [
    { count: totalRegistrations },
    { count: approvedCount },
    { count: pendingCount },
    { count: rejectedCount },
    { count: todayApproved },
    { count: todayRejected },
  ] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("updated_at", today),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected")
      .gte("updated_at", today),
  ])

  return (
    <UnifiedManagementClient
      stats={{
        total: totalRegistrations || 0,
        approved: approvedCount || 0,
        pending: pendingCount || 0,
        rejected: rejectedCount || 0,
        approvedToday: todayApproved || 0,
        rejectedToday: todayRejected || 0,
      }}
      ospSubjects={OSP_SUBJECTS}
    />
  )
}
