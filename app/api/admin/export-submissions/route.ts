import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

// Fungsi untuk GET request ke /api/admin/export-submissions
export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 1. Verifikasi bahwa user adalah admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // 2. Ambil data submisi SCC, sama seperti di halaman page.tsx
    const { data, error } = await supabase
      .from("submissions_lomba")
      .select(
        `
        id,
        submitted_at,
        preliminary_file_url,
        final_file_url,
        is_qualified_for_final,
        registrations (
          id,
          team_name,
          competitions (
            code
          ),
          profiles:profiles!registrations_user_id_fkey (
            full_name,
            email,
            school_institution
          ),
          team_members (
            full_name
          )
        )
      `,
      )
      .not("preliminary_file_url", "is", null)
      .order("submitted_at", { ascending: false })

    if (error) {
      throw error
    }

    // Pastikan hanya data SCC yang diekspor
    const sccSubmissions = (data || []).filter(
      (submission: any) =>
        submission.registrations?.competitions?.code === "SCC",
    )

    // 3. Format data agar sesuai untuk sheet Excel
    const formattedData = sccSubmissions.map((sub: any) => {
      const registration = sub.registrations
      const profile = registration?.profiles
      const teamMembers = registration?.team_members || []

      let statusText = "Menunggu"
      if (sub.is_qualified_for_final === true) {
        statusText = "Lolos"
      } else if (sub.is_qualified_for_final === false) {
        statusText = "Tidak Lolos"
      }

      // Buat kolom dinamis untuk setiap anggota tim
      const members: { [key: string]: string } = {}
      teamMembers.forEach((member: any, index: number) => {
        members[`Anggota ${index + 1}`] = member.full_name
      })

      return {
        "Nama Tim": registration?.team_name || profile?.full_name,
        "Nama Ketua": profile?.full_name,
        "Email Ketua": profile?.email,
        "Asal Sekolah": profile?.school_institution,
        "Waktu Submisi": sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })
          : "",
        "Status Kelolosan": statusText,
        "Link Berkas Penyisihan": sub.preliminary_file_url,
        "Link Berkas Final": sub.final_file_url,
        ...members, // Gabungkan kolom anggota ke data utama
      }
    })

    // 4. Buat file Excel menggunakan library xlsx
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submisi SCC")

    // Atur lebar kolom agar lebih mudah dibaca
    worksheet["!cols"] = [
      { wch: 30 }, // Nama Tim
      { wch: 30 }, // Nama Ketua
      { wch: 30 }, // Email Ketua
      { wch: 30 }, // Asal Sekolah
      { wch: 20 }, // Waktu Submisi
      { wch: 15 }, // Status Kelolosan
      { wch: 50 }, // Link Berkas Penyisihan
      { wch: 50 }, // Link Berkas Final
    ]

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    // 5. Kirim file sebagai response untuk diunduh oleh browser
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="export_submisi_scc_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })

    return response
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ error: e.message }), {
      status: 500,
    })
  }
}
