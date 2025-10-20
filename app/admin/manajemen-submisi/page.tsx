// app/admin/manajemen-submisi/page.tsx
// CLEAN VERSION - tanpa debug logs
import { createClient } from "@/lib/supabase/server"
import ClientPage from "./client-page"

async function fetchSubmissions() {
  const supabase = await createClient()

  // Query dengan proper structure untuk RLS
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
        profiles:profiles!registrations_user_id_fkey (
          full_name,
          email,
          school_institution
        ),
        team_members (
          full_name,
          email,
          phone
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

  // Filter untuk SCC saja
  const sccSubmissions = (data || []).filter(
    (submission: any) => submission.registrations?.competitions?.code === "SCC",
  )

  return sccSubmissions
}

export default async function ManajemenSubmisiPage() {
  const submissions = await fetchSubmissions()

  return <ClientPage submissions={submissions} />
}