import { createClient } from "@/lib/supabase/server"
import ParticipantManagementClient from "./client-page"

// Define the Participant type here to be used in this server component
// and passed to the client component.
export interface Participant {
  id: string
  full_name: string
  email: string
  school_institution: string
  education_level: string
  identity_number: string
  created_at: string
  // --- START PERUBAHAN ---
  phone: string | null
  kelas: string | null
  semester: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null
  jenis_kelamin: string | null
  alamat: string | null
  // --- AKHIR PERUBAHAN ---
  registrations: Array<{
    id: string
    status: string
    created_at: string
    competitions: {
      name: string
      code: string
    }
  }>
}

export default async function ParticipantManagement() {
  const supabase = await createClient()

  const { data: participants, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      school_institution,
      education_level,
      identity_number,
      created_at,
      phone,
      kelas,
      semester,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,

      registrations (
        id,
        status,
        created_at,
        competitions (
          name,
          code
        )
      )
    `
    )
    .neq("role", "admin")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching participants:", error)
    // Optionally return an error component
  }

  // Calculate statistics
  const totalParticipants = participants?.length || 0
  const approvedCount = participants?.filter((p) => p.registrations.some((r) => r.status === "approved")).length || 0
  const pendingCount = participants?.filter((p) => p.registrations.some((r) => r.status === "pending")).length || 0
  const rejectedCount = participants?.filter((p) => p.registrations.some((r) => r.status === "rejected")).length || 0

  return (
    <ParticipantManagementClient
      participants={(participants || []) as unknown as Participant[]}
      stats={{
        total: totalParticipants,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      }}
    />
  )
}