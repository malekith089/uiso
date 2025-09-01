import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

// Fungsi bantuan untuk mendapatkan nilai properti secara aman, menghindari error
const get = (obj: any, path: string, defaultValue: any = "-") => {
  const result = path.split(".").reduce((acc, part) => acc && acc[part], obj)
  return result === undefined || result === null ? defaultValue : result
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      format = "xlsx",
      includeTeamMembers = false,
      search = "",
      status = "all",
      competition = "all",
      education = "all",
      dateFrom = "",
      dateTo = "",
      sortBy = "created_at",
      sortOrder = "desc",
      ospSubjects = [],
    } = body

    let query = supabase.from("registrations").select(
      `
        *,
        profiles!inner (
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
        competitions (
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
          alamat
        )
      `,
    )

    // Apply the same filters as the pagination API
    if (search) {
      query = query.or(`
        profiles.full_name.ilike.%${search}%,
        profiles.email.ilike.%${search}%,
        profiles.school_institution.ilike.%${search}%,
        profiles.identity_number.ilike.%${search}%
      `)
    }

    if (status !== "all") {
      query = query.eq("status", status)
    }

    if (competition !== "all") {
      query = query.eq("competitions.code", competition)
    }

    if (education !== "all") {
      query = query.eq("profiles.education_level", education)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59.999Z")
    }

    const sortColumn = sortBy.includes(".") ? sortBy : sortBy
    query = query.order(sortColumn, { ascending: sortOrder === "asc" })

    const { data: registrations, error } = await query

    if (error) {
      console.error("Error fetching registrations for export:", error)
      return NextResponse.json({ message: "Failed to fetch data for export" }, { status: 500 })
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ message: "No data found matching the filters" }, { status: 400 })
    }

    const processedRegistrations = registrations.map((reg) => {
      const ospSubject =
        reg.competitions.code === "OSP" && reg.selected_subject_id
          ? ospSubjects.find((s: any) => s.id === reg.selected_subject_id)?.name
          : null

      return {
        ...reg,
        osp_subject_name: ospSubject || "-",
      }
    })

    if (format === "xlsx") {
      const main_headers = [
        "Nama Lengkap",
        "Email",
        "No. HP",
        "Sekolah/Institusi",
        "Jenjang",
        "NISN/NIM",
        "Kompetisi",
        "Bidang OSP",
        "Status",
        "Tanggal Daftar",
        "Tanggal Update",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Jenis Kelamin",
        "Alamat",
      ]

      const worksheet_data = processedRegistrations.map((reg: any) => ({
        "Nama Lengkap": get(reg, "profiles.full_name"),
        Email: get(reg, "profiles.email"),
        "No. HP": get(reg, "profiles.phone", get(reg, "phone")),
        "Sekolah/Institusi": get(reg, "profiles.school_institution"),
        Jenjang: get(reg, "profiles.education_level"),
        "NISN/NIM": get(reg, "profiles.identity_number"),
        Kompetisi: get(reg, "competitions.name"),
        "Bidang OSP": reg.osp_subject_name,
        Status: get(reg, "status"),
        "Tanggal Daftar": new Date(get(reg, "created_at")).toLocaleDateString("id-ID"),
        "Tanggal Update": new Date(get(reg, "updated_at")).toLocaleDateString("id-ID"),
        "Tempat Lahir": get(reg, "profiles.tempat_lahir"),
        "Tanggal Lahir": get(reg, "profiles.tanggal_lahir")
          ? new Date(get(reg, "profiles.tanggal_lahir")).toLocaleDateString("id-ID")
          : "-",
        "Jenis Kelamin": get(reg, "profiles.jenis_kelamin"),
        Alamat: get(reg, "profiles.alamat"),
      }))

      const workbook = XLSX.utils.book_new()
      const main_sheet = XLSX.utils.json_to_sheet(worksheet_data, { header: main_headers })
      XLSX.utils.book_append_sheet(workbook, main_sheet, "Pendaftaran Utama")

      if (includeTeamMembers) {
        const team_headers = [
          "Nama Ketua",
          "Kompetisi",
          "Nama Anggota",
          "Email Anggota",
          "No. HP Anggota",
          "NISN/NIM Anggota",
          "Sekolah Anggota",
        ]
        const team_data: any[] = []
        processedRegistrations.forEach((reg: any) => {
          if (reg.team_members && reg.team_members.length > 0) {
            reg.team_members.forEach((member: any) => {
              team_data.push({
                "Nama Ketua": get(reg, "profiles.full_name"),
                Kompetisi: get(reg, "competitions.name"),
                "Nama Anggota": get(member, "full_name"),
                "Email Anggota": get(member, "email"),
                "No. HP Anggota": get(member, "phone"),
                "NISN/NIM Anggota": get(member, "identity_number"),
                "Sekolah Anggota": get(member, "school_institution"),
              })
            })
          }
        })

        if (team_data.length > 0) {
          const team_sheet = XLSX.utils.json_to_sheet(team_data, { header: team_headers })
          XLSX.utils.book_append_sheet(workbook, team_sheet, "Data Anggota Tim")
        }
      }

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="UISO_2025_Export_${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      })
    } else {
      // CSV format
      const headers =
        "Nama,Email,No. HP,Sekolah,Jenjang,Nomor Identitas,Kompetisi,Bidang OSP,Status,Tanggal Daftar,Tanggal Update\n"
      const csvData = processedRegistrations
        .map((reg: any) =>
          [
            `"${get(reg, "profiles.full_name")}"`,
            get(reg, "profiles.email"),
            get(reg, "profiles.phone", get(reg, "phone")),
            `"${get(reg, "profiles.school_institution")}"`,
            get(reg, "profiles.education_level"),
            get(reg, "profiles.identity_number"),
            `"${get(reg, "competitions.name")}"`,
            `"${reg.osp_subject_name}"`,
            get(reg, "status"),
            new Date(get(reg, "created_at")).toLocaleDateString("id-ID"),
            new Date(get(reg, "updated_at")).toLocaleDateString("id-ID"),
          ].join(","),
        )
        .join("\n")

      const csvContent = headers + csvData

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="UISO_2025_Export_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }
  } catch (error: any) {
    console.error("Export API Error:", error)
    return NextResponse.json({ message: error.message || "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
