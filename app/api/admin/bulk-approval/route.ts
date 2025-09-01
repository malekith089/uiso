import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { registrationIds, status, reason } = body

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json({ error: "Invalid registration IDs" }, { status: 400 })
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update multiple registrations
    const { error } = await supabase
      .from("registrations")
      .update({
        status,
        updated_at: new Date().toISOString(),
        admin_notes: reason || null,
      })
      .in("id", registrationIds)

    if (error) {
      console.error("Error updating registrations:", error)
      return NextResponse.json({ error: "Failed to update registrations" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${registrationIds.length} registrations to ${status}`,
    })
  } catch (error) {
    console.error("Error in bulk approval:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
