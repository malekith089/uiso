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

    console.log("[v0] API received params:", { page, sortBy, sortOrder, search })

    let query = supabase.from("registrations").select(
      `
        id,
        status,
        team_name,
        identity_card_url,
        engagement_proof_url,
        payment_proof_url,
        created_at,
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

    if (search) {
      query = query.or(`
        profiles!registrations_user_id_fkey.full_name.ilike.%${search}%,
        profiles!registrations_user_id_fkey.email.ilike.%${search}%,
        profiles!registrations_user_id_fkey.school_institution.ilike.%${search}%
      `)
    }

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

    if (sortBy === "profiles.full_name") {
      console.log("[v0] Applying profiles.full_name sort:", { sortOrder })
      query = query.order("full_name", {
        ascending: sortOrder === "asc",
        foreignTable: "profiles!registrations_user_id_fkey",
      })
    } else if (sortBy === "competitions.name") {
      query = query.order("name", {
        ascending: sortOrder === "asc",
        foreignTable: "competitions",
      })
    } else if (sortBy === "profiles.education_level") {
      query = query.order("education_level", {
        ascending: sortOrder === "asc",
        foreignTable: "profiles!registrations_user_id_fkey",
      })
    } else {
      // For registrations table fields
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: registrations, error, count } = await query

    if (error) {
      console.error("Error fetching registrations:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    console.log("[v0] Query executed successfully:", {
      resultCount: registrations?.length,
      firstItemName: registrations?.[0]?.profiles?.full_name,
      sortBy,
      sortOrder,
    })

    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = NextResponse.json({
      data: registrations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
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
