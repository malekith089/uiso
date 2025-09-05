import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

// helper aman ambil properti nested
const get = (obj: any, path: string, defaultValue: any = "-") => {
  const result = path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
  return result === undefined || result === null ? defaultValue : result
}

const formatLocalDate = (v: any) => {
  if (!v) return "-"
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("id-ID")
  } catch {
    return "-"
  }
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
      competition = "all", // kode: OSP | SCC | EGK
      education = "all",
      dateFrom = "",
      dateTo = "",
      sortBy = "created_at",
      sortOrder = "desc",
      ospSubjects = [],
    } = body

    // --- SELECT dengan alias ---
    let query = supabase.from("registrations").select(
      `
        *,
        applicant:profiles!registrations_user_id_fkey (
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
        verifier:profiles!registrations_verified_by_fkey (
          id,
          full_name
        ),
        competitions (
          id,
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

    // --- FILTERS ---
    if (search) {
      query = query.or(
        `
        applicant.full_name.ilike.%${search}%,
        applicant.email.ilike.%${search}%,
        applicant.school_institution.ilike.%${search}%,
        applicant.identity_number.ilike.%${search}%`,
      )
    }

    if (status !== "all") {
      query = query.eq("status", status)
    }

  if (education !== "all") {
    const { data: profs, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("education_level", education)

    if (!profErr && profs?.length > 0) {
      const ids = profs.map((p) => p.id)
      query = query.in("user_id", ids)
    } else {
      // biar hasil kosong kalau ga ada
      query = query.in("user_id", ["-"])
    }
  }

    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00.000+07:00`)
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59.999+07:00`)
    }

    // --- FILTER KOMPETISI (PAKE competition_id) ---
    if (competition !== "all") {
      const { data: comp, error: compError } = await supabase
        .from("competitions")
        .select("id")
        .eq("code", competition)
        .single()

      if (!compError && comp) {
        query = query.eq("competition_id", comp.id)
      }
    }

    // --- SORT ---
    let sortColumn: string = String(sortBy || "created_at")
    let foreignTable: string | undefined

    if (sortColumn.startsWith("profiles.")) {
      sortColumn = sortColumn.replace(/^profiles\./, "applicant.")
    }
    if (sortColumn.startsWith("applicant.")) {
      foreignTable = "applicant"
      sortColumn = sortColumn.split(".")[1]
    } else if (sortColumn.startsWith("competitions.")) {
      foreignTable = "competitions"
      sortColumn = sortColumn.split(".")[1]
    }

    if (foreignTable) {
      // @ts-ignore
      query = query.order(sortColumn, { ascending: sortOrder === "asc", foreignTable })
    } else {
      query = query.order(sortColumn, { ascending: sortOrder === "asc" })
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error("Error fetching registrations for export:", error)
      return NextResponse.json({ message: "Failed to fetch data for export" }, { status: 500 })
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ message: "No data found matching the filters" }, { status: 400 })
    }

    // Normalisasi embed
    const normalized = registrations.map((reg: any) => ({
      ...reg,
      applicant: Array.isArray(reg.applicant) ? reg.applicant[0] : reg.applicant,
      competitions: Array.isArray(reg.competitions) ? reg.competitions[0] : reg.competitions,
    }))

    // Tambahkan nama bidang OSP
    const processedRegistrations = normalized.map((reg: any) => {
      const ospSubject =
        reg.competitions?.code === "OSP" && reg.selected_subject_id
          ? ospSubjects.find((s: any) => s.id === reg.selected_subject_id)?.name
          : null
      return { ...reg, osp_subject_name: ospSubject || "-" }
    })

    // === OUTPUT (XLSX / CSV) ===
    if (format === "xlsx") {
      const wb = XLSX.utils.book_new()

      // --- Sheet Ringkasan Filter ---
      const filterSheetData = [
        ["Filter", "Nilai"],
        ["Pencarian", search || "-"],
        ["Status", status],
        ["Kompetisi", competition],
        ["Jenjang", education],
        ["Tanggal Dari", dateFrom || "-"],
        ["Tanggal Sampai", dateTo || "-"],
        ["Sort By", sortBy],
        ["Sort Order", sortOrder.toUpperCase()],
      ]
      const filterSheet = XLSX.utils.aoa_to_sheet(filterSheetData)
      filterSheet["!cols"] = [{ wch: 20 }, { wch: 40 }]
      XLSX.utils.book_append_sheet(wb, filterSheet, "Ringkasan Filter")

      // --- Sheet Utama ---
      const main_headers = [
        "Nama Lengkap",
        "Email",
        "No. HP",
        "Sekolah/Institusi",
        "Jenjang",
        "Kelas/Semester",
        "NISN/NIM",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Jenis Kelamin",
        "Alamat",
        "Kompetisi",
        "Bidang OSP",
        "Status",
        "Tanggal Daftar",
        "Tanggal Update",
      ]

      const rows = processedRegistrations.map((reg: any) => {
        const jenjang = get(reg, "applicant.education_level")
        const kelasSemester =
          jenjang === "SMA/Sederajat"
            ? get(reg, "applicant.kelas")
            : get(reg, "applicant.semester")
            ? `Semester ${get(reg, "applicant.semester")}`
            : "-"

        return {
          "Nama Lengkap": get(reg, "applicant.full_name"),
          Email: get(reg, "applicant.email"),
          "No. HP": get(reg, "applicant.phone", get(reg, "phone")),
          "Sekolah/Institusi": get(reg, "applicant.school_institution"),
          Jenjang: jenjang,
          "Kelas/Semester": kelasSemester,
          "NISN/NIM": get(reg, "applicant.identity_number"),
          "Tempat Lahir": get(reg, "applicant.tempat_lahir"),
          "Tanggal Lahir": formatLocalDate(get(reg, "applicant.tanggal_lahir")),
          "Jenis Kelamin": get(reg, "applicant.jenis_kelamin"),
          Alamat: get(reg, "applicant.alamat"),
          Kompetisi: get(reg, "competitions.name"),
          "Bidang OSP": reg.osp_subject_name,
          Status: get(reg, "status"),
          "Tanggal Daftar": formatLocalDate(get(reg, "created_at")),
          "Tanggal Update": formatLocalDate(get(reg, "updated_at")),
        }
      })

      const mainSheet = XLSX.utils.json_to_sheet([])
      XLSX.utils.sheet_add_aoa(mainSheet, [main_headers])
      XLSX.utils.sheet_add_json(mainSheet, rows, { origin: "A2", skipHeader: true })
      mainSheet["!cols"] = main_headers.map((h) => ({ wch: Math.max(14, h.length + 2) }))
      XLSX.utils.book_append_sheet(wb, mainSheet, "Pendaftaran Utama")

      // --- Sheet Anggota Tim ---
      if (includeTeamMembers) {
        const team_headers = [
          "Nama Ketua",
          "Kompetisi",
          "Nama Anggota",
          "Email Anggota",
          "No. HP Anggota",
          "NISN/NIM Anggota",
          "Sekolah Anggota",
          "Jenjang Anggota",
          "Kelas/Semester Anggota",
          "Tempat Lahir",
          "Tanggal Lahir",
          "Jenis Kelamin",
          "Alamat",
        ]

        const teamRows: any[] = []
        processedRegistrations.forEach((reg: any) => {
          const members: any[] = reg.team_members || []
          members.forEach((m) => {
            const jenjangM = get(m, "education_level")
            const kelasSemM =
              jenjangM === "SMA/Sederajat"
                ? get(m, "kelas")
                : get(m, "semester")
                ? `Semester ${get(m, "semester")}`
                : "-"

            teamRows.push({
              "Nama Ketua": get(reg, "applicant.full_name"),
              Kompetisi: get(reg, "competitions.name"),
              "Nama Anggota": get(m, "full_name"),
              "Email Anggota": get(m, "email"),
              "No. HP Anggota": get(m, "phone"),
              "NISN/NIM Anggota": get(m, "identity_number"),
              "Sekolah Anggota": get(m, "school_institution"),
              "Jenjang Anggota": jenjangM,
              "Kelas/Semester Anggota": kelasSemM,
              "Tempat Lahir": get(m, "tempat_lahir"),
              "Tanggal Lahir": formatLocalDate(get(m, "tanggal_lahir")),
              "Jenis Kelamin": get(m, "jenis_kelamin"),
              Alamat: get(m, "alamat"),
            })
          })
        })

        if (teamRows.length > 0) {
          const teamSheet = XLSX.utils.json_to_sheet([])
          XLSX.utils.sheet_add_aoa(teamSheet, [team_headers])
          XLSX.utils.sheet_add_json(teamSheet, teamRows, { origin: "A2", skipHeader: true })
          teamSheet["!cols"] = team_headers.map((h) => ({ wch: Math.max(14, h.length + 2) }))
          XLSX.utils.book_append_sheet(wb, teamSheet, "Data Anggota Tim")
        }
      }

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="UISO_2025_Export_${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      })
    }

    // === CSV fallback ===
    // (sheet filter tidak ikut, hanya export utama)
    const csvHeaders = [
      "Nama Lengkap",
      "Email",
      "No. HP",
      "Sekolah/Institusi",
      "Jenjang",
      "Kelas/Semester",
      "NISN/NIM",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jenis Kelamin",
      "Alamat",
      "Kompetisi",
      "Bidang OSP",
      "Status",
      "Tanggal Daftar",
      "Tanggal Update",
    ]

    const escapeCSV = (v: any) => {
      if (v == null) return ""
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }

    const csvRows = processedRegistrations.map((reg: any) => {
      const jenjang = get(reg, "applicant.education_level")
      const kelasSemester =
        jenjang === "SMA/Sederajat"
          ? get(reg, "applicant.kelas")
          : get(reg, "applicant.semester")
          ? `Semester ${get(reg, "applicant.semester")}`
          : "-"

      const rec = [
        get(reg, "applicant.full_name"),
        get(reg, "applicant.email"),
        get(reg, "applicant.phone", get(reg, "phone")),
        get(reg, "applicant.school_institution"),
        jenjang,
        kelasSemester,
        get(reg, "applicant.identity_number"),
        get(reg, "applicant.tempat_lahir"),
        formatLocalDate(get(reg, "applicant.tanggal_lahir")),
        get(reg, "applicant.jenis_kelamin"),
        get(reg, "applicant.alamat"),
        get(reg, "competitions.name"),
        reg.osp_subject_name,
        get(reg, "status"),
        formatLocalDate(get(reg, "created_at")),
        formatLocalDate(get(reg, "updated_at")),
      ]
      return rec.map(escapeCSV).join(",")
    })

    const csvContent = [csvHeaders.map(escapeCSV).join(","), ...csvRows].join("\n")
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="UISO_2025_Export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Export API Error:", error)
    return NextResponse.json({ message: error?.message || "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
