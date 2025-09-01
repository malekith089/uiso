import { NextResponse, type NextRequest } from "next/server"
import * as XLSX from "xlsx"

// Fungsi bantuan untuk mendapatkan nilai properti secara aman, menghindari error
const get = (obj: any, path: string, defaultValue: any = "-") => {
  const result = path.split(".").reduce((acc, part) => acc && acc[part], obj)
  return result === undefined || result === null ? defaultValue : result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Ambil 'data' yang sudah diolah dari client, bukan 'filters'
    const { format = "xlsx", data: registrations, includeTeamMembers = false } = body

    if (!registrations || !Array.isArray(registrations)) {
      return NextResponse.json({ message: "Data pendaftaran tidak valid atau tidak ada" }, { status: 400 })
    }

    // Data sudah siap, kita hanya perlu memformatnya ke Excel atau CSV

    if (format === "xlsx") {
      const main_headers = [
        "Nama Lengkap", "Email", "No. HP", "Sekolah/Institusi", "Jenjang", 
        "NISN/NIM", "Kompetisi", "Bidang OSP", "Status", "Tanggal Daftar", 
        "Tanggal Update", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", "Alamat"
      ]

      const worksheet_data = registrations.map((reg: any) => ({
        "Nama Lengkap": get(reg, 'profiles.full_name'),
        "Email": get(reg, 'profiles.email'),
        "No. HP": get(reg, 'profiles.phone', get(reg, 'phone')), // Fallback jika phone ada di root
        "Sekolah/Institusi": get(reg, 'profiles.school_institution'),
        "Jenjang": get(reg, 'profiles.education_level'),
        "NISN/NIM": get(reg, 'profiles.identity_number'),
        "Kompetisi": get(reg, 'competitions.name'),
        "Bidang OSP": reg.osp_subject_name, // <-- Gunakan field baru yang kita buat di client
        "Status": get(reg, 'status'),
        "Tanggal Daftar": new Date(get(reg, 'created_at')).toLocaleDateString("id-ID"),
        "Tanggal Update": new Date(get(reg, 'updated_at')).toLocaleDateString("id-ID"),
        "Tempat Lahir": get(reg, 'profiles.tempat_lahir'),
        "Tanggal Lahir": get(reg, 'profiles.tanggal_lahir') ? new Date(get(reg, 'profiles.tanggal_lahir')).toLocaleDateString("id-ID") : '-',
        "Jenis Kelamin": get(reg, 'profiles.jenis_kelamin'),
        "Alamat": get(reg, 'profiles.alamat'),
      }))

      const workbook = XLSX.utils.book_new()
      const main_sheet = XLSX.utils.json_to_sheet(worksheet_data, { header: main_headers })
      XLSX.utils.book_append_sheet(workbook, main_sheet, "Pendaftaran Utama")

      if (includeTeamMembers) {
        const team_headers = ["Nama Ketua", "Kompetisi", "Nama Anggota", "Email Anggota", "No. HP Anggota", "NISN/NIM Anggota", "Sekolah Anggota"]
        const team_data: any[] = []
        registrations.forEach((reg: any) => {
          if (reg.team_members && reg.team_members.length > 0) {
            reg.team_members.forEach((member: any) => {
              team_data.push({
                "Nama Ketua": get(reg, 'profiles.full_name'),
                "Kompetisi": get(reg, 'competitions.name'),
                "Nama Anggota": get(member, 'full_name'),
                "Email Anggota": get(member, 'email'),
                "No. HP Anggota": get(member, 'phone'),
                "NISN/NIM Anggota": get(member, 'identity_number'),
                "Sekolah Anggota": get(member, 'school_institution'),
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
      // Logika untuk CSV juga diperbaiki
      const headers = "Nama,Email,No. HP,Sekolah,Jenjang,Nomor Identitas,Kompetisi,Bidang OSP,Status,Tanggal Daftar,Tanggal Update\n"
      const csvData = registrations.map((reg: any) => [
        `"${get(reg, 'profiles.full_name')}"`,
        get(reg, 'profiles.email'),
        get(reg, 'profiles.phone', get(reg, 'phone')),
        `"${get(reg, 'profiles.school_institution')}"`,
        get(reg, 'profiles.education_level'),
        get(reg, 'profiles.identity_number'),
        `"${get(reg, 'competitions.name')}"`,
        `"${reg.osp_subject_name}"`, // <-- Gunakan field baru yang kita buat di client
        get(reg, 'status'),
        new Date(get(reg, 'created_at')).toLocaleDateString("id-ID"),
        new Date(get(reg, 'updated_at')).toLocaleDateString("id-ID"),
      ].join(",")).join("\n")

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
