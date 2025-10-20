"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  const [deadlinePreliminary, setDeadlinePreliminary] = useState("")
  const [deadlineFinal, setDeadlineFinal] = useState("")
  const router = useRouter()

  const handleUpdateDeadline = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/submissions/update-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competition_code: "SCC",
          deadline_preliminary: deadlinePreliminary,
          deadline_final: deadlineFinal,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update deadline")
      }

      showSuccessToast("Deadline berhasil diperbarui")
      router.refresh()
    } catch (error) {
      console.error("Error updating deadline:", error)
      showErrorToast(error, "Update Deadline")
    } finally {
      setIsLoading(false)
    }
  }

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

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Pengaturan Deadline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deadline-preliminary">Deadline Penyisihan</Label>
            <Input
              id="deadline-preliminary"
              type="datetime-local"
              value={deadlinePreliminary}
              onChange={(e) => setDeadlinePreliminary(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline-final">Deadline Final</Label>
            <Input
              id="deadline-final"
              type="datetime-local"
              value={deadlineFinal}
              onChange={(e) => setDeadlineFinal(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button onClick={handleUpdateDeadline} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Menyimpan..." : "Simpan Deadline"}
        </Button>
      </div>

      <DataTable
        columns={columns(handleToggleFinalStatus, isLoading)}
        data={submissions}
        searchPlaceholder="Cari berdasarkan nama tim atau email..."
        searchColumn="nama_tim"
      />
    </div>
  )
}
