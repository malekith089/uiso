import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { registrationId, verificationType, isVerified } = await request.json()

    console.log("[v0] Verification request:", { registrationId, verificationType, isVerified })

    // Get current user (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update verification status
    const updateData: any = {
      [`${verificationType}_verified`]: isVerified,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("registrations").update(updateData).eq("id", registrationId).select()

    if (error) {
      console.error("[v0] Verification update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Verification updated successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Verification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
