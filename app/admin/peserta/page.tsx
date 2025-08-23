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
    .select(`
      id,
      full_name,
      email,
      school_institution,
      education_level,
      identity_number,
      created_at,
      registrations (
        id,
        status,
        created_at,
        competitions (
          name,
          code
        )
      )
    `)
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
      participants={participants || []}
      stats={{
        total: totalParticipants,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      }}
    />
  )
}
