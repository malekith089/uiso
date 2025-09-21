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

  // --- OPTIMASI FINAL: Ambil semua data status dalam SATU request ---
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("status, updated_at")

  if (error) {
    console.error("Gagal mengambil data registrasi:", error)
    // Fallback jika query gagal, halaman tidak akan crash
    return (
      <UnifiedManagementClient
        stats={{
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          approvedToday: 0,
          rejectedToday: 0,
        }}
        ospSubjects={OSP_SUBJECTS}
      />
    )
  }

  // --- Lakukan penghitungan di sini (super cepat) ---
  const today = new Date().toISOString().split("T")[0]
  let approvedCount = 0
  let pendingCount = 0
  let rejectedCount = 0
  let todayApproved = 0
  let todayRejected = 0

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

  return (
    <UnifiedManagementClient
      stats={{
        total: registrations.length,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        approvedToday: todayApproved,
        rejectedToday: todayRejected,
      }}
      ospSubjects={OSP_SUBJECTS}
    />
  )
}
