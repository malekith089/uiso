"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Submission {
  id: string
  submitted_at: string
  preliminary_file_url: string
  final_file_url: string
  is_qualified_for_final: boolean
  registrations: {
    team_name: string
    profiles: {
      full_name: string
      email: string
      school_institution: string
    }
  }
}

export function columns(
  onToggleFinalStatus: (id: string, status: boolean) => Promise<void>,
  isLoading: boolean,
): ColumnDef<Submission>[] {
  return [
    {
      accessorKey: "registrations.team_name",
      header: "Nama Tim",
      cell: ({ row }) => {
        const teamName = row.original.registrations.team_name
        const fullName = row.original.registrations.profiles.full_name
        return <div className="font-medium">{teamName || fullName}</div>
      },
    },
    {
      accessorKey: "registrations.profiles.school_institution",
      header: "Asal Sekolah",
      cell: ({ row }) => row.original.registrations.profiles.school_institution,
    },
    {
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
        const date = new Date(row.original.submitted_at)
        return format(date, "dd MMMM yyyy HH:mm", { locale: id })
      },
    },
    {
      accessorKey: "is_qualified_for_final",
      header: "Lolos ke Final?",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_qualified_for_final}
          onCheckedChange={(checked) => onToggleFinalStatus(row.original.id, checked)}
          disabled={isLoading}
        />
      ),
    },
  ]
}
