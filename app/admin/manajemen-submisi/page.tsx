import { createClient } from "@/lib/supabase/server"
import ClientPage from "./client-page"

async function fetchSubmissions() {
  const supabase = await createClient()

  // First fetch all submissions with their related data
  const { data, error } = await supabase
    .from("submissions_lomba")
    .select(
      `
      id,
      submitted_at,
      preliminary_file_url,
      final_file_url,
      is_qualified_for_final,
      registrations (
        id,
        team_name,
        competitions (
          code,
          name
        ),
        profiles (
          full_name,
          email,
          school_institution
        )
      )
    `,
    )
    .not("preliminary_file_url", "is", null)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
    return []
  }

  // Filter for SCC competitions on the client side
  const sccSubmissions = (data || []).filter(
    (submission: any) => submission.registrations?.competitions?.code === "SCC",
  )

  return sccSubmissions
}

export default async function ManajemenSubmisiPage() {
  const submissions = await fetchSubmissions()

  return <ClientPage submissions={submissions} />
}
