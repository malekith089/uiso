"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// Tipe data disesuaikan untuk menerima `null`
interface Submission {
  id: string
  submitted_at: string
  preliminary_file_url: string
  final_file_url: string
  is_qualified_for_final: boolean | null // DIUBAH: dari boolean menjadi boolean | null
  registrations: {
    team_name: string
    profiles: {
      full_name: string
      email: string
      school_institution: string
    }
  }
}

// Tipe fungsi callback disesuaikan untuk menerima `null`
export function columns(
  onUpdateFinalStatus: (id: string, status: boolean | null) => Promise<void>, // DIUBAH: nama dan tipe data
  isLoading: boolean,
): ColumnDef<Submission>[] {
  return [
    {
      id: "nama_tim",
      accessorKey: "registrations.team_name",
      header: "Nama Tim",
      cell: ({ row }) => {
        const teamName = row.original.registrations.team_name
        const fullName = row.original.registrations.profiles.full_name
        return <div className="font-medium">{teamName || fullName}</div>
      },
    },
    {
      id: "asal_sekolah",
      accessorKey: "registrations.profiles.school_institution",
      header: "Asal Sekolah",
      cell: ({ row }) => row.original.registrations.profiles.school_institution,
    },
    {
      id: "email",
      accessorKey: "registrations.profiles.email",
      header: "Email",
      cell: ({ row }) => row.original.registrations.profiles.email,
    },
    {
      accessorKey: "preliminary_file_url",
      header: "Berkas Penyisihan",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(row.original.preliminary_file_url, "_blank")}
          disabled={!row.original.preliminary_file_url}
        >
          Lihat Berkas
        </Button>
      ),
    },
    {
      accessorKey: "final_file_url",
      header: "Berkas Final",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(row.original.final_file_url, "_blank")}
          disabled={!row.original.final_file_url}
        >
          Lihat Berkas
        </Button>
      ),
    },
    {
      accessorKey: "submitted_at",
      header: "Waktu Submisi",
      cell: ({ row }) => {
        if (!row.original.submitted_at) return "-"
        const date = new Date(row.original.submitted_at)
        return format(date, "dd MMMM yyyy HH:mm", { locale: id })
      },
    },
    {
      accessorKey: "is_qualified_for_final",
      header: "Status Kelolosan Final",
      // ================== PERUBAHAN UTAMA DI SINI ==================
      cell: ({ row }) => {
        const currentStatus = row.original.is_qualified_for_final
        const submissionId = row.original.id

        const handleStatusChange = (newStatusValue: string) => {
          let newStatus: boolean | null
          if (newStatusValue === "true") newStatus = true
          else if (newStatusValue === "false") newStatus = false
          else newStatus = null // Untuk "null" (menunggu)

          onUpdateFinalStatus(submissionId, newStatus)
        }

        // Ubah nilai (true/false/null) ke string agar bisa dibaca oleh <Select>
        const selectValue =
          currentStatus === null ? "null" : currentStatus.toString()

        return (
          <Select
            value={selectValue}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">
                <Badge variant="secondary" className="w-full justify-center">Menunggu</Badge>
              </SelectItem>
              <SelectItem value="true">
                <Badge className="bg-green-600 hover:bg-green-700 w-full justify-center">Lolos</Badge>
              </SelectItem>
              <SelectItem value="false">
                <Badge variant="destructive" className="w-full justify-center">Tidak Lolos</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        )
      },
      // =============================================================
    },
  ]
}
