// app/api/admin/export-submissions/route.ts

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()

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

    // 2. Ambil data submisi SCC
    const { data, error } = await supabase
      .from("submissions_lomba")
      .select(
        `
        id,
        submitted_at,
        updated_at,
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
      `
      )
      .not("preliminary_file_url", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    const sccSubmissions = (data || []).filter(
      (submission: any) =>
        submission.registrations?.competitions?.code === "SCC"
    )

    // 3. Tentukan jumlah anggota maksimal DULU
    const maxMembers = Math.max(
      0,
      ...sccSubmissions.map(
        (s: any) => s.registrations?.team_members?.length || 0
      )
    )

    // 4. Format data - PASTIKAN SETIAP ROW PUNYA SEMUA KOLOM
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
      
      const formatTime = (isoString: string | null) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleString("id-ID", {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: "Asia/Jakarta",
        });
      };

      const submissionStrings: string[] = [];
      
      // 1. Tambahkan waktu Penyisihan (dari submitted_at)
      if (sub.submitted_at) {
        submissionStrings.push(`${formatTime(sub.submitted_at)} (Penyisihan)`);
      }

      // 2. Tambahkan waktu Final (dari updated_at, JIKA file final ada)
      if (sub.final_file_url && sub.updated_at && sub.updated_at !== sub.submitted_at) {
        submissionStrings.push(`${formatTime(sub.updated_at)} (Final)`);
      }

      // 3. Gabungkan dengan newline (agar jadi 2 baris di Excel)
      const waktuSubmisiText = submissionStrings.join("\n");

      // Buat object dengan SEMUA kolom, termasuk anggota yang kosong
      const row: any = {
        "Nama Tim": registration?.team_name || profile?.full_name || "",
        "Nama Ketua": profile?.full_name || "",
        "Email Ketua": profile?.email || "",
        "Asal Universitas": profile?.school_institution || "",
        "Waktu Submisi": waktuSubmisiText,
        "Status Kelolosan": statusText,
        "Link Berkas Penyisihan": sub.preliminary_file_url || "",
        "Link Berkas Final": sub.final_file_url || "",
      }

      // PENTING: Tambahkan SEMUA kolom anggota (kosong jika tidak ada)
      for (let i = 1; i <= maxMembers; i++) {
        row[`Anggota ${i}`] = teamMembers[i - 1]?.full_name || ""
      }

      return row
    })

    // 5. Buat workbook
    const workbook = XLSX.utils.book_new()
    
    // 6. Buat worksheet dari formattedData yang sudah lengkap strukturnya
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // 7. Set column widths
    const columnWidths = [
      { wch: 30 }, // Nama Tim
      { wch: 30 }, // Nama Ketua
      { wch: 30 }, // Email Ketua
      { wch: 30 }, // Asal Universitas
      { wch: 20 }, // Waktu Submisi
      { wch: 15 }, // Status Kelolosan
      { wch: 50 }, // Link Berkas Penyisihan
      { wch: 50 }, // Link Berkas Final
    ]

    for (let i = 0; i < maxMembers; i++) {
      columnWidths.push({ wch: 30 })
    }

    worksheet["!cols"] = columnWidths

    // 8. Append sheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submisi SCC")

    // 9. Write ke buffer
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    // 10. Return response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="export_submisi_scc_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (e: any) {
    console.error("Export error:", e)
    return new NextResponse(
      JSON.stringify({ error: e.message || "Gagal mengekspor data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}