import { createClient } from "@/lib/supabase/server"
import RegistrationApprovalClient from "./client-page"

export interface Registration {
  id: string
  user_id: string
  competition_id: string
  team_name: string | null
  team_size: number
  status: string
  identity_card_url: string | null
  engagement_proof_url: string | null
  payment_proof_url: string | null
  created_at: string
  updated_at: string
  profiles: {
    full_name: string
    email: string
    school_institution: string
    education_level: string
    identity_number: string
    identity_card_url?: string | null
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
  }>
}

export default async function RegistrationApprovalPage() {
  const supabase = await createClient()

  // Fetch pending registrations with related data
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        email,
        school_institution,
        education_level,
        identity_number
      ),
      competitions (
        name,
        code,
        participant_type
      ),
      team_members (
        id,
        full_name,
        identity_number,
        identity_card_url
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching registrations:", error)
  }

  // Get statistics
  const { count: todayApproved } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("updated_at", new Date().toISOString().split("T")[0])

  const { count: todayRejected } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("status", "rejected")
    .gte("updated_at", new Date().toISOString().split("T")[0])

  const { count: totalRegistrations } = await supabase.from("registrations").select("id", { count: "exact", head: true })

  return (
    <RegistrationApprovalClient
      initialRegistrations={registrations || []}
      stats={{
        pending: registrations?.length || 0,
        approvedToday: todayApproved || 0,
        rejectedToday: todayRejected || 0,
        total: totalRegistrations || 0,
      }}
    />
  )
}
