import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { registrationId, teamMemberId, verificationType, isVerified } = await request.json()

    console.log("[API] Verification request:", {
      registrationId, teamMemberId, verificationType, isVerified
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (teamMemberId) {
      // Update team member verification
      const { data, error } = await supabase
        .from("team_members")
        .update({ identity_card_verified: isVerified })
        .eq("id", teamMemberId)
        .select()

      if (error) {
        console.error("[API] Team member verification error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("[API] Team member verification updated successfully")
      return NextResponse.json({ success: true, data })

    } else if (registrationId) {
      // Update registration verification
      const updateData = {
        [`${verificationType}_verified`]: isVerified,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("registrations")
        .update(updateData)
        .eq("id", registrationId)
        .select()

      if (error) {
        console.error("[API] Registration verification error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("[API] Registration verification updated successfully")
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: "Missing required ID" }, { status: 400 })
  } catch (error) {
    console.error("[API] Verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}