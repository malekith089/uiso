import { createClient } from "@/lib/supabase/server";
import CompetitionManagementClient from "./client-page";

// Define the structure of our competition data including stats
export interface CompetitionWithStats {
  id: string;
  name: string;
  code: string;
  description: string;
  participant_type: string;
  target_level: string;
  max_team_members: number;
  registration_start: string;
  registration_end: string;
  competition_date: string;
  is_active: boolean;
  // Stats
  participants: number;
  approved: number;
  pending: number;
  rejected: number;
  submissions: number; // This might need another join or query
}

export default async function CompetitionManagementPage() {
  const supabase = await createClient();

  const { data: competitions, error: competitionsError } = await supabase
    .from("competitions")
    .select("*");

  if (competitionsError) {
    console.error("Error fetching competitions:", competitionsError);
    return <div>Error loading competitions.</div>;
  }

  const competitionsWithStats: CompetitionWithStats[] = await Promise.all(
    competitions.map(async (competition) => {
      const { count: participants, error: pError } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("competition_id", competition.id);

      const { count: approved, error: aError } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("competition_id", competition.id)
        .eq("status", "approved");

      const { count: pending, error: pendError } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("competition_id", competition.id)
        .eq("status", "pending");

      const { count: rejected, error: rError } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("competition_id", competition.id)
        .eq("status", "rejected");

      // Note: Submissions count is mocked as 0 for now as the schema is not provided in detail for it.
      // You would need to query the 'submissions' table similarly.

      if (pError || aError || pendError || rError) {
        console.error(`Error fetching stats for ${competition.name}:`, pError, aError, pendError, rError);
      }

      return {
        ...competition,
        participants: participants || 0,
        approved: approved || 0,
        pending: pending || 0,
        rejected: rejected || 0,
        submissions: 0, // Placeholder
      };
    })
  );

  return <CompetitionManagementClient competitions={competitionsWithStats} />;
}
