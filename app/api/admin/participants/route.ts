import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, full_name, email, school_institution, education_level, identity_number } = body

    // Update participant profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        email,
        school_institution,
        education_level,
        identity_number,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating participant:", error)
      return NextResponse.json({ error: "Failed to update participant" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/admin/participants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id } = body

    // Delete participant registrations first (due to foreign key constraints)
    const { error: regError } = await supabase.from("registrations").delete().eq("user_id", id)

    if (regError) {
      console.error("Error deleting registrations:", regError)
      return NextResponse.json({ error: "Failed to delete participant registrations" }, { status: 500 })
    }

    // Delete participant profile
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
      return NextResponse.json({ error: "Failed to delete participant profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/participants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
