// app/admin/manajemen-submisi/columns.tsx

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ChevronDown } from "lucide-react"

// Tipe data ini sudah benar
interface Submission {
  id: string
  submitted_at: string
  updated_at: string
  preliminary_file_url: string
  final_file_url: string
  is_qualified_for_final: boolean | null
  registrations: {
    team_name: string
    profiles: {
      full_name: string
      email: string
      school_institution: string
    }
    team_members: Array<{
      full_name: string
    }> | null
  }
}

export function columns(
  onUpdateFinalStatus: (id: string, status: boolean | null) => Promise<void>,
  isLoading: boolean,
): ColumnDef<Submission>[] {
  return [
    {
      id: "nama_tim",
      // --- PERBAIKAN 1 ---
      // Ganti accessorKey dengan accessorFn agar bisa dicari oleh globalFilter
      // HAPUS: accessorKey: "registrations.team_name",
      accessorFn: (row) => {
        const teamName = row.registrations.team_name || ""
        const leaderName = row.registrations.profiles.full_name || ""
        
        // Gabungkan semua nama anggota menjadi satu string
        const memberNames = (row.registrations.team_members || [])
          .map(member => member.full_name)
          .join(" ") // dipisahkan spasi

        // String inilah yang akan dibaca oleh globalFilter
        return `${teamName} ${leaderName} ${memberNames}` 
      },
      // --- SELESAI PERBAIKAN ---
      header: "Nama Tim",
      // Cell function Anda sudah bagus, tidak perlu diubah
      cell: ({ row }) => {
        const teamName = row.original.registrations.team_name
        const fullName = row.original.registrations.profiles.full_name
        const teamMembers = row.original.registrations.team_members || []
        const isTeam = teamMembers.length > 0

        return (
          <div className="font-medium">
            {isTeam ? (
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between group text-left">
                  <div className="flex items-center gap-2">
                    <span>{teamName || fullName}</span>
                    <Badge variant="secondary">{teamMembers.length} Anggota</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-muted-foreground">
                    {teamMembers.map((member, index) => (
                      <li key={index}>{member.full_name}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              fullName
            )}
          </div>
        )
      },
    },
    {
      id: "asal_sekolah",
      // --- PERBAIKAN 2 ---
      // Ganti accessorKey dengan accessorFn agar bisa dicari
      // HAPUS: accessorKey: "registrations.profiles.school_institution",
      accessorFn: (row) => row.registrations.profiles.school_institution,
      // --- SELESAI PERBAIKAN ---
      header: "Asal Universitas",
      cell: ({ row }) => row.original.registrations.profiles.school_institution,
    },
    {
      id: "email",
      // --- PERBAIKAN 3 ---
      // Ganti accessorKey dengan accessorFn agar bisa dicari
      // HAPUS: accessorKey: "registrations.profiles.email",
      accessorFn: (row) => row.registrations.profiles.email,
      // --- SELESAI PERBAIKAN ---
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
      // Ganti accessorKey menjadi accessorFn agar bisa mengakses seluruh 'row'
      accessorFn: (row) => `${row.submitted_at} ${row.updated_at}`,
      id: "waktu_submisi", // Beri ID unik
      header: "Waktu Submisi",
      cell: ({ row }) => {
        const { submitted_at, updated_at, final_file_url } = row.original

        // Helper untuk format
        const formatTime = (isoString: string | null) => {
          if (!isoString) return null
          return format(new Date(isoString), "dd MMM yyyy HH:mm", { locale: id })
        }

        const prelimTime = formatTime(submitted_at)
        const finalTime = formatTime(updated_at)

        return (
          <div className="min-w-[210px]">
            {/* 1. Waktu Penyisihan */}
            {prelimTime ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{prelimTime}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  Penyisihan
                </Badge>
              </div>
            ) : null}

            {/* 2. Waktu Final (Hanya tampil jika ada file final & waktunya beda) */}
            {final_file_url && finalTime && updated_at !== submitted_at ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-medium text-blue-600">{finalTime}</span>
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 px-1.5 py-0 text-xs">
                  Final
                </Badge>
              </div>
            ) : null}

            {/* 3. Fallback jika tidak ada data sama sekali */}
            {!prelimTime && !final_file_url ? "-" : null}
          </div>
        )
      },
    },
    {
      accessorKey: "is_qualified_for_final",
      header: "Status Kelolosan Final",
      // Cell function Anda untuk status sudah benar
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
    },
  ]
}