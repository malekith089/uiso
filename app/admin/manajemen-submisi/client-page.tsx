"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { showSuccessToast, showErrorToast } from "@/lib/error-handler"

interface ClientPageProps {
  submissions: any[]
}

export default function ClientPage({ submissions }: ClientPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleFinalStatus = async (submissionId: string, newStatus: boolean) => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { error } = await supabase
        .from("submissions_lomba")
        .update({ is_qualified_for_final: newStatus })
        .eq("id", submissionId)

      if (error) {
        throw error
      }

      showSuccessToast(newStatus ? "Peserta berhasil diloloskan ke final" : "Peserta dihapus dari final")
      router.refresh()
    } catch (error) {
      console.error("Error updating submission status:", error)
      showErrorToast(error, "Update Status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Submisi Lomba</h1>
        <p className="text-gray-600 mt-2">Kelola submisi berkas dan tentukan peserta yang lolos ke final</p>
      </div>

      <DataTable
        columns={columns(handleToggleFinalStatus, isLoading)}
        data={submissions}
        searchPlaceholder="Cari berdasarkan nama tim atau email..."
        searchColumn="registrations"
      />
    </div>
  )
}
