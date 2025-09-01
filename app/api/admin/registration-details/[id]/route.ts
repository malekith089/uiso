import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: registration, error } = await supabase
      .from("registrations")
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          school_institution,
          education_level,
          identity_number,
          phone,
          kelas,
          semester,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
          alamat,
          created_at
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
          identity_card_url,
          email,
          phone,
          school_institution,
          education_level,
          kelas,
          semester,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
          alamat
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching registration details:", error)
      return NextResponse.json({ error: "Failed to fetch registration details" }, { status: 500 })
    }

    const response = NextResponse.json({ data: registration })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")

    return response
  } catch (error) {
    console.error("Error in GET /api/admin/registration-details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
