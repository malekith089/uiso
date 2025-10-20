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
import { FileSpreadsheet } from "lucide-react"

interface ClientPageProps {
  submissions: any[]
}

export default function ClientPage({ submissions }: ClientPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false);
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

  const handleToggleFinalStatus = async (submissionId: string, newStatus: boolean | null) => {
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Panggil API export
      // API route.ts Anda sudah GET, jadi kita fetch via GET
      const response = await fetch('/api/admin/export-submissions', {
        method: 'GET', // Ganti ke GET
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Gagal mengekspor data" }));
        throw new Error(errorData.error || "Gagal mengekspor data");
      }

      // Handle download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Ambil nama file dari header Content-Disposition jika ada, jika tidak pakai default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export_submisi_scc_${new Date().toISOString().split("T")[0]}.xlsx`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessToast("Data submisi berhasil diekspor!");

    } catch (error) {
      console.error("Error exporting submissions:", error);
      showErrorToast(error, "Export Submisi");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"> {/* Tambah flex container */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Submisi Lomba</h1>
          <p className="text-gray-600 mt-2">Kelola submisi berkas dan tentukan peserta yang lolos ke final</p>
        </div>
        {/* Tombol Export */}
        <Button onClick={handleExport} disabled={isExporting || submissions.length === 0} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {isExporting ? "Mengekspor..." : "Export ke Excel"}
        </Button>
      </div>

      <DataTable
        columns={columns(handleToggleFinalStatus, isLoading)}
        data={submissions}
        searchPlaceholder="Cari (Nama Tim, Nama Anggota, Ketua, Email...)"
      />
    </div>
  )
}
