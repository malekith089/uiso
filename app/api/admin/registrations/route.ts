import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { Registration } from "@/app/types/supabase"


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

    console.log("[API] Query params:", { 
      page, limit, search, status, competition, education, 
      sortBy, sortOrder, dateFrom, dateTo 
    })

    console.log("[API] Will sort by:", sortBy, "in order:", sortOrder)

    // 🔥 FIXED: Gunakan query yang benar dengan alias relasi
    let query = supabase
      .from("registrations")
      .select(
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
        profiles!registrations_user_id_fkey (
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
        competitions!registrations_competition_id_fkey (
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
          alamat,
          identity_card_verified,
          member_order
        )
        `,
        { count: "exact" }
      )

    // 🔥 FILTERS: Apply filters properly
    if (status !== "all") {
      query = query.eq("status", status)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59.999Z")
    }

    // 🔥 SORTING: Apply sorting WITHOUT foreignTable - let JS handle complex sorts
    // Only sort by registration table fields in database
    if (sortBy === "created_at" || sortBy === "updated_at" || sortBy === "status") {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    } else {
      // For foreign table sorts, use default order and sort in JS later
      query = query.order("created_at", { ascending: false })
    }

    console.log("[API] Executing database query...")
    const { data: allRegistrations, error, count } = await query.returns<Registration[]>()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    console.log(`[API] Database returned ${allRegistrations?.length || 0} registrations`)

    // Debug: Log first registration structure
    if (allRegistrations && allRegistrations.length > 0) {
      const first = allRegistrations[0]
      console.log("[API] Sample registration structure:", {
        profiles: !!first.profiles,
        profileName: first.profiles?.full_name,
        competitions: !!first.competitions,
        competitionCode: first.competitions?.code,
        competitionName: first.competitions?.name
      })
    }

    let filteredRegistrations = allRegistrations || []

    // 🔥 POST-QUERY FILTERS: Apply complex filters after DB query
    if (search) {
      const searchTerm = search.trim().toLowerCase()
      filteredRegistrations = filteredRegistrations.filter((reg: any) => {
        const profile = reg.profiles
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

    if (competition !== "all") {
      filteredRegistrations = filteredRegistrations.filter((reg: any) => {
        return reg.competitions?.code === competition
      })
    }

    if (education !== "all") {
      filteredRegistrations = filteredRegistrations.filter((reg: any) => {
        return reg.profiles?.education_level === education
      })
    }

    // 🔥 JAVASCRIPT SORTING: Handle complex sorting after database query
    if (filteredRegistrations.length > 1) {
      filteredRegistrations = filteredRegistrations.sort((a: any, b: any) => {
        let valueA: any = ""
        let valueB: any = ""

        // Get values based on sortBy
        switch (sortBy) {
          case "profiles.full_name":
            valueA = a.profiles?.full_name?.toLowerCase() || ""
            valueB = b.profiles?.full_name?.toLowerCase() || ""
            break
          case "profiles.education_level":
            valueA = a.profiles?.education_level || ""
            valueB = b.profiles?.education_level || ""
            break
          case "competitions.code":
            valueA = a.competitions?.code || ""
            valueB = b.competitions?.code || ""
            break
          case "competitions.name":
            valueA = a.competitions?.name || ""
            valueB = b.competitions?.name || ""
            break
          case "created_at":
          case "updated_at":
          default:
            valueA = new Date(a[sortBy] || a.created_at || 0).getTime()
            valueB = new Date(b[sortBy] || b.created_at || 0).getTime()
            break
        }
        
        // Compare values
        let comparison = 0
        if (typeof valueA === "string" && typeof valueB === "string") {
          comparison = valueA.localeCompare(valueB)
        } else {
          comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        }
        
        // Apply sort order
        return sortOrder === "asc" ? comparison : -comparison
      })
    }

    console.log(`[API] Applied JS sorting: ${sortBy} ${sortOrder}`)
    
    // Debug: Log first few sorted results
    if (filteredRegistrations.length > 0) {
      const first3 = filteredRegistrations.slice(0, 3).map((reg: any) => ({
        name: reg.profiles?.full_name,
        competition: reg.competitions?.code,
        education: reg.profiles?.education_level
      }))
      console.log("[API] First 3 after sorting:", first3)
    }

    // 🔥 PAGINATION: Apply after all filters and sorting
    const totalFiltered = filteredRegistrations.length
    const from = (page - 1) * limit
    const to = from + limit
    const paginatedRegistrations = filteredRegistrations.slice(from, to)

    const totalPages = Math.ceil(totalFiltered / limit)

    console.log(`[API] Returning ${paginatedRegistrations.length} registrations (page ${page}/${totalPages})`)

    const response = NextResponse.json({
      data: paginatedRegistrations,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })

    // Short cache for quick navigation
    response.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30")
    return response

  } catch (error) {
    console.error("Error in GET /api/admin/registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}