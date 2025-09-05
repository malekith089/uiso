import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { registrationId, teamMemberId, verificationType, isVerified } = await request.json()

    console.log("[v1] Verification request received:", {
      registrationId,
      teamMemberId,
      verificationType,
      isVerified,
    })

    // Dapatkan ID admin yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin user not found" }, { status: 401 })
    }

    // Logika baru untuk membedakan antara verifikasi registrasi dan anggota tim
    if (teamMemberId) {
      // === Skenario 1: Verifikasi Kartu Identitas Anggota Tim ===
      const { data, error } = await supabase
        .from("team_members")
        .update({
          // Langsung gunakan nama kolom yang benar dari skema baru
          identity_card_verified: isVerified,
        })
        .eq("id", teamMemberId)
        .select()

      if (error) {
        console.error("[v1] Team member verification update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("[v1] Team member verification updated successfully:", data)
      return NextResponse.json({ success: true, data })
    } else if (registrationId) {
      // === Skenario 2: Verifikasi Berkas Registrasi Umum ===
      const updateData: any = {
        // Gunakan format nama kolom yang sudah ada
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
        console.error("[v1] Registration verification update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("[v1] Registration verification updated successfully:", data)
      return NextResponse.json({ success: true, data })
    } else {
      // Jika tidak ada ID yang diberikan
      return NextResponse.json(
        { error: "Bad Request: registrationId or teamMemberId is required" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v1] Verification API critical error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}