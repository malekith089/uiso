import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const competition = searchParams.get("competition") || "all"
    const education = searchParams.get("education") || "all"
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = supabase.from("registrations").select(
  `
    id,
    status,
    team_name,
    identity_card_url,
    engagement_proof_url,
    payment_proof_url,
    created_at,
    updated_at,
    selected_subject_id,
    identity_card_verified,
    engagement_proof_verified,
    payment_proof_verified,
    verified_by,
    verified_at,
    profiles!user_id (
      id,
      full_name,
      email,
      school_institution,
      education_level,
      phone,
      identity_number
    ),
    competitions!competition_id (
      name,
      code,
      participant_type
    ),
    team_members (
      id,
      full_name,
      email,
      phone,
      school_institution,
      education_level,
      identity_number,
      identity_card_url,
      identity_card_verified,
      kelas,
      semester,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat
    )
  `,
  { count: "exact" },
)

    if (status !== "all") {
      query = query.eq("status", status)
    }
    // Filter kompetisi - gunakan foreign key reference yang benar
    if (competition !== "all") {
      query = query.eq("competitions.code", competition)
    }

    // Filter education level - gunakan foreign key reference yang benar  
    if (education !== "all") {
      query = query.eq("profiles.education_level", education)
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59.999Z")
    }
    // Search akan dihandle secara manual setelah data diambil
    let searchTerm = null
    if (search) {
      searchTerm = search.trim().toLowerCase()
    }

    const { data: allRegistrations, error, count } = await query

    let filteredRegistrations = allRegistrations || []

// Manual search filtering
if (searchTerm && filteredRegistrations.length > 0) {
  filteredRegistrations = filteredRegistrations.filter((reg: any) => {
    const profile = Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles
    if (!profile) return false
    
    const searchableText = [
      profile.full_name || '',
      profile.email || '',
      profile.school_institution || '',
      profile.identity_number || ''
    ].join(' ').toLowerCase()
    
    return searchableText.includes(searchTerm)
  })
}

// Manual filter untuk kompetisi dan education (backup jika database filter gagal)
if (competition !== "all") {
  filteredRegistrations = filteredRegistrations.filter((reg: any) => {
    const comp = Array.isArray(reg.competitions) ? reg.competitions[0] : reg.competitions
    return comp?.code === competition
  })
}

if (education !== "all") {
  filteredRegistrations = filteredRegistrations.filter((reg: any) => {
    const profile = Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles
    return profile?.education_level === education
  })
}

    if (error) {
      console.error("Error fetching registrations:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    let sortedRegistrations = filteredRegistrations
    
    if (sortedRegistrations.length > 1) {
      sortedRegistrations = sortedRegistrations.sort((a: any, b: any) => {
        const getProfile = (item: any) => (Array.isArray(item.profiles) ? item.profiles[0] : item.profiles)
        const getCompetition = (item: any) => (Array.isArray(item.competitions) ? item.competitions[0] : item.competitions)
        
        let valueA: any = ""
        let valueB: any = ""

        switch (sortBy) {
          case "profiles.full_name":
            valueA = getProfile(a)?.full_name?.toLowerCase() || ""
            valueB = getProfile(b)?.full_name?.toLowerCase() || ""
            break
          case "profiles.education_level":
            valueA = getProfile(a)?.education_level || ""
            valueB = getProfile(b)?.education_level || ""
            break
          case "competitions.code":
            valueA = getCompetition(a)?.code || ""
            valueB = getCompetition(b)?.code || ""
            break
          case "created_at":
          default:
            valueA = new Date(a.created_at || 0).getTime()
            valueB = new Date(b.created_at || 0).getTime()
            break
        }
        
        let comparison = 0
        if (typeof valueA === "string" && typeof valueB === "string") {
          comparison = valueA.localeCompare(valueB)
        } else {
          comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        }
        
        return sortOrder === "asc" ? comparison : -comparison
      })
    }

    // ========================================================================
    // PERBAIKAN DI SINI: Normalisasi struktur data sebelum mengirim ke client
    // ========================================================================
    const normalizedRegistrations = sortedRegistrations.map((reg: any) => ({
      ...reg,
      profiles: Array.isArray(reg.profiles) ? reg.profiles[0] : reg.profiles,
      competitions: Array.isArray(reg.competitions) ? reg.competitions[0] : reg.competitions,
    }));

    const from = (page - 1) * limit
    const to = from + limit
    // Gunakan data yang sudah dinormalisasi untuk paginasi
    const paginatedRegistrations = normalizedRegistrations.slice(from, to)

    // Update count berdasarkan filtered data
    const finalCount = searchTerm || competition !== "all" || education !== "all" 
      ? filteredRegistrations.length 
      : count || 0

    const totalPages = Math.ceil(finalCount / limit)

    const response = NextResponse.json({
      data: paginatedRegistrations,
      pagination: {
        page,
        limit,
        total: finalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })

    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60")
    return response

  } catch (error) {
    console.error("Error in GET /api/admin/registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}