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

    // STRATEGY: Fetch ALL filtered data first, sort in-memory, then paginate
    // This ensures sorting works correctly across the entire dataset
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
        profiles!registrations_user_id_fkey (
          id,
          full_name,
          email,
          school_institution,
          education_level,
          phone,
          identity_number
        ),
        competitions (
          name,
          code,
          participant_type
        )
      `,
      { count: "exact" },
    )

    // Apply all filters except pagination
    if (status !== "all") {
      query = query.eq("status", status)
    }

    if (competition !== "all") {
      query = query.eq("competitions.code", competition)
    }

    if (education !== "all") {
      query = query.eq("profiles!registrations_user_id_fkey.education_level", education)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59.999Z")
    }

    if (search) {
      query = query.or(
        `profiles!registrations_user_id_fkey.full_name.ilike.%${search}%,profiles!registrations_user_id_fkey.email.ilike.%${search}%,profiles!registrations_user_id_fkey.school_institution.ilike.%${search}%,profiles!registrations_user_id_fkey.identity_number.ilike.%${search}%`
      )
    }

    // Fetch all filtered data (without pagination for sorting)
    const { data: allRegistrations, error, count } = await query

    if (error) {
      console.error("Error fetching registrations:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    // FIXED: Apply sorting in-memory with proper data structure handling
    let sortedRegistrations = allRegistrations || []
    
    if (sortedRegistrations.length > 1) {
      sortedRegistrations = sortedRegistrations.sort((a, b) => {
        let valueA: string | number = ""
        let valueB: string | number = ""
        
        // Helper function to safely get first item from array or return object
        const getProfile = (item: any) => Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        const getCompetition = (item: any) => Array.isArray(item.competitions) ? item.competitions[0] : item.competitions
        
        switch (sortBy) {
          case "profiles.full_name":
            valueA = getProfile(a)?.full_name?.toLowerCase() || ""
            valueB = getProfile(b)?.full_name?.toLowerCase() || ""
            break
          case "profiles.education_level":
            valueA = getProfile(a)?.education_level || ""
            valueB = getProfile(b)?.education_level || ""
            break
          case "competitions.name":
            valueA = getCompetition(a)?.name || ""
            valueB = getCompetition(b)?.name || ""
            break
          case "competitions.code":
            valueA = getCompetition(a)?.code || ""
            valueB = getCompetition(b)?.code || ""
            break
          case "status":
            valueA = a.status || ""
            valueB = b.status || ""
            break
          case "created_at":
          default:
            valueA = new Date(a.created_at || 0).getTime()
            valueB = new Date(b.created_at || 0).getTime()
            break
        }
        
        let comparison = 0
        if (typeof valueA === "string" && typeof valueB === "string") {
          comparison = valueA.localeCompare(valueB, 'id', { 
            numeric: true,
            caseFirst: 'lower' 
          })
        } else {
          comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        }
        
        return sortOrder === "asc" ? comparison : -comparison
      })
    }

    // FIXED: Apply pagination AFTER sorting
    const totalItems = sortedRegistrations.length
    const from = (page - 1) * limit
    const to = from + limit
    const paginatedRegistrations = sortedRegistrations.slice(from, to)

    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1


    const response = NextResponse.json({
      data: paginatedRegistrations,
      pagination: {
        page,
        limit,
        total: count || 0, // Use original count for total records
        totalPages: Math.ceil((count || 0) / limit), // Calculate pages based on total DB records
        hasNextPage,
        hasPrevPage,
      },
    })

    // Cache for 30 seconds to reduce database load
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60")

    return response
  } catch (error) {
    console.error("Error in GET /api/admin/registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}