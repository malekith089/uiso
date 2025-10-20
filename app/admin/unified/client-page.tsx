"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  FileText,
  ArrowUpDown,
  Filter,
  Calendar,
  FileSpreadsheet,
  Users,
  CheckSquare,
  ExternalLink,
  AlertCircle,
  Download,
  Edit,
  Save,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { showErrorToast, showSuccessToast, withRetry } from "@/lib/error-handler"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import type { UnifiedRegistration } from "./page"
import { getOptimizedCloudinaryUrl } from "@/lib/utils"; // <-- Impor fungsi helper


const getFileType = (url: string): "image" | "pdf" | "unknown" => {
  const extension = url.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
    return "image"
  } else if (extension === "pdf") {
    return "pdf"
  }
  return "unknown"
}

const FileViewer = ({ url, alt, className }: { url: string | null; alt: string; className?: string }) => {
  if (!url) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  const getFileType = (url: string): "image" | "pdf" | "unknown" => {
    const extension = url.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "image"
    } else if (extension === "pdf") {
      return "pdf"
    }
    return "unknown"
  }

  const fileType = getFileType(url)

  if (fileType === "image") {
    return (
      <img
        src={url || "/placeholder.svg"}
        alt={alt}
        className={`object-cover rounded-lg ${className}`}
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = "/placeholder.svg"
        }}
      />
    )
  } else if (fileType === "pdf") {
    return (
      <div className={`bg-red-50 rounded-lg flex flex-col items-center justify-center ${className}`}>
        <FileText className="w-8 h-8 text-red-500 mb-2" />
        <span className="text-xs text-red-700">PDF File</span>
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <FileText className="w-8 h-8 text-gray-400" />
    </div>
  )
}

export default function UnifiedManagementClient({
  stats,
  ospSubjects,
}: {
  stats: {
    total: number
    approved: number
    pending: number
    rejected: number
    approvedToday: number
    rejectedToday: number
  }
  ospSubjects: { id: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [registrations, setRegistrations] = useState<UnifiedRegistration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<UnifiedRegistration | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [competitionFilter, setCompetitionFilter] = useState(searchParams.get("competition") || "all")
  const [educationFilter, setEducationFilter] = useState(searchParams.get("education") || "all")
  const [dateFromFilter, setDateFromFilter] = useState(searchParams.get("dateFrom") || "")
  const [dateToFilter, setDateToFilter] = useState(searchParams.get("dateTo") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "created_at")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")
  const [loading, setLoading] = useState(true)
  const [isProcessingStatus, setIsProcessingStatus] = useState(false)
  const [processingAction, setProcessingAction] = useState<'approved' | 'rejected' | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [statusChangeReason, setStatusChangeReason] = useState("")
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<any | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const itemsPerPage = 50

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkReason, setBulkReason] = useState("")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState("xlsx")
  const [includeTeamMembers, setIncludeTeamMembers] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const [verificationChecks, setVerificationChecks] = useState<{
    [registrationId: string]: {
      identity_card: boolean
      engagement_proof: boolean
      payment_proof: boolean
      team_members: {
        [memberId: string]: {
          identity_card_verified: boolean
        }
      }
    }
  }>({})

  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const url = new URL(window.location.href)

      // Update or remove parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          url.searchParams.set(key, value)
        } else {
          url.searchParams.delete(key)
        }
      })

      // Always remove page if it's 1
      if (params.page === "1") {
        url.searchParams.delete("page")
      }

      router.replace(url.pathname + url.search, { scroll: false })
    },
    [router],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // Kurangi dari 500ms ke 300ms

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        status: statusFilter,
        competition: competitionFilter,
        education: educationFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        sortBy,
        sortOrder,
      })

      console.log("[v0] Fetching registrations with params:", {
        page: currentPage,
        sortBy,
        sortOrder,
        search: debouncedSearchTerm,
      })

      const response = await fetch(`/api/admin/registrations?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch registrations")
      }

      const result = await response.json()

      console.log("[v0] API response received:", {
        dataCount: result.data?.length,
        firstItem: result.data?.[0]?.profiles?.full_name,
        sortBy,
        sortOrder,
      })

      setRegistrations(result.data)
      setTotalPages(result.pagination.totalPages)
      setTotalRecords(result.pagination.total)
      setHasNextPage(result.pagination.hasNextPage)
      setHasPrevPage(result.pagination.hasPrevPage)
      setSelectedIds([]) // Clear selections when data changes
    } catch (error) {
      showErrorToast(error, "fetchRegistrations")
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    competitionFilter,
    educationFilter,
    dateFromFilter,
    dateToFilter,
    sortBy,
    sortOrder,
  ])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  useEffect(() => {
    if (registrations.length > 0) {
      const initialVerificationState: {
        [registrationId: string]: {
          identity_card: boolean
          engagement_proof: boolean
          payment_proof: boolean
          team_members: { [memberId: string]: { identity_card_verified: boolean } }
        }
      } = {}

      registrations.forEach((registration) => {
        const teamMemberChecks: { [memberId: string]: { identity_card_verified: boolean } } = {}
        if (registration.team_members) {
          registration.team_members.forEach((member: any) => {
            teamMemberChecks[member.id] = {
              identity_card_verified: member.identity_card_verified || false,
            }
          })
        }

        initialVerificationState[registration.id] = {
          identity_card: registration.identity_card_verified || false,
          engagement_proof: registration.engagement_proof_verified || false,
          payment_proof: registration.payment_proof_verified || false,
          team_members: teamMemberChecks,
        }
      })

      setVerificationChecks(initialVerificationState)
    }
  }, [registrations])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, statusFilter, competitionFilter, educationFilter, dateFromFilter, dateToFilter])

  useEffect(() => {
    updateURL({
      page: currentPage.toString(),
      search: debouncedSearchTerm,
      status: statusFilter,
      competition: competitionFilter,
      education: educationFilter,
      dateFrom: dateFromFilter,
      dateTo: dateToFilter,
      sortBy,
      sortOrder,
    })
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    competitionFilter,
    educationFilter,
    dateFromFilter,
    dateToFilter,
    sortBy,
    sortOrder,
    updateURL,
  ])

  // Helper for deep value access in sorting
  const dlv = (obj: any, key: string) => key.split(".").reduce((acc, curr) => acc && acc[curr], obj)

  const filteredRegistrations = registrations

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(registrations.map((reg) => reg.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const handleBulkApproval = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/bulk-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationIds: selectedIds,
          status: bulkStatus,
          reason: bulkReason,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // 🔥 Update state lokal untuk bulk changes
        setRegistrations(prev => prev.map(reg => 
          selectedIds.includes(reg.id)
            ? { ...reg, status: bulkStatus, updated_at: new Date().toISOString() }
            : reg
        ))

        showSuccessToast(result.message)
        setShowBulkDialog(false)
        setSelectedIds([])
        setBulkStatus("")
        setBulkReason("")
      } else {
        throw new Error("Failed to update registrations")
      }
    } catch (error) {
      showErrorToast(error, "handleBulkApproval")
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedExport = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/export-filtered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: exportFormat,
          includeTeamMembers,
          // Send current filter parameters to server
          search: debouncedSearchTerm,
          status: statusFilter,
          competition: competitionFilter,
          education: educationFilter,
          dateFrom: dateFromFilter,
          dateTo: dateToFilter,
          sortBy,
          sortOrder,
          ospSubjects, // Send OSP subjects for server-side mapping
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url

        const filename =
          exportFormat === "xlsx"
            ? `UISO_2025_Export_${new Date().toISOString().split("T")[0]}.xlsx`
            : `UISO_2025_Export_${new Date().toISOString().split("T")[0]}.csv`

        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        showSuccessToast(`Data berhasil diekspor dalam format ${exportFormat.toUpperCase()}`)
        setShowExportDialog(false)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Export failed" }))
        throw new Error(errorData.message)
      }
    } catch (error) {
      showErrorToast(error, "handleAdvancedExport")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationCheck = async (registrationId: string, field: string, checked: boolean) => {
  try {
    // Update local state immediately for better UX
    setVerificationChecks((prev) => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        [field]: checked,
      },
    }))

    // Save to database
    const response = await fetch("/api/admin/registrations/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationId,
        verificationType: field,
        isVerified: checked,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update verification status")
    }

    console.log("[v0] Verification status updated:", { registrationId, field, checked })
    
    // 🆕 TAMBAHKAN TOAST SUCCESS
    const fieldLabels = {
      identity_card: "Kartu Identitas",
      engagement_proof: "Bukti Engagement", 
      payment_proof: "Bukti Pembayaran"
    }
    
    const fieldLabel = fieldLabels[field as keyof typeof fieldLabels] || field
    const statusText = checked ? "diverifikasi" : "dibatalkan verifikasinya"
    
    showSuccessToast(`${fieldLabel} berhasil ${statusText}`)
    
  } catch (error) {
    console.error("[v0] Error updating verification:", error)
    // Revert local state on error
    setVerificationChecks((prev) => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        [field]: !checked,
      },
    }))
    showErrorToast(error, "handleVerificationCheck")
  }
}

  const isAllVerified = (registration: UnifiedRegistration) => {
  if (!registration) return false
  const checks = verificationChecks[registration.id]
  if (!checks) return false

  console.log("[CLIENT] Checking verification for:", registration.profiles.full_name, {
    competitionCode: registration.competitions.code,
    checks,
    teamMembersCount: registration.team_members?.length || 0
  })

  // Logika untuk SCC (kompetisi tim)
  if (registration.competitions.code === "SCC") {
    const basicVerified = checks.engagement_proof && checks.payment_proof
    
    if (!registration.team_members || registration.team_members.length === 0) {
      return basicVerified
    }
    
    const allMembersVerified = registration.team_members.every((member: any) => {
      const memberVerified = checks.team_members[member.id]?.identity_card_verified === true
      console.log(`[CLIENT] Member ${member.full_name} verified:`, memberVerified)
      return memberVerified
    })
    
    return basicVerified && allMembersVerified
  }

  // Logika untuk kompetisi individu (OSP, EGK)
  const individualVerified = checks.identity_card && checks.engagement_proof && checks.payment_proof
  return individualVerified
}

const [loadingRows, setLoadingRows] = useState<Set<string>>(new Set())

const handleStatusChange = async (id: string, newStatus: string): Promise<void> => {
  // Temukan registration berdasarkan ID
  const registration = registrations.find(reg => reg.id === id)
  
  if (!registration) {
    showErrorToast(new Error("Registrasi tidak ditemukan"), "handleStatusChange")
    return
  }

  // Cek verifikasi hanya jika status akan diubah menjadi approved
  if (newStatus === "approved" && !isAllVerified(registration)) {
    const competitionType = registration.competitions.code === "SCC" ? "tim" : "individu"
    const missingDocs = []
    
    const checks = verificationChecks[registration.id]
    
    if (registration.competitions.code === "SCC") {
      if (!checks?.engagement_proof) missingDocs.push("Bukti Engagement")
      if (!checks?.payment_proof) missingDocs.push("Bukti Pembayaran")
      
      if (registration.team_members && registration.team_members.length > 0) {
        const unverifiedMembers = registration.team_members.filter((member: any) => 
          !checks?.team_members[member.id]?.identity_card_verified
        )
        if (unverifiedMembers.length > 0) {
          missingDocs.push(`Kartu Identitas ${unverifiedMembers.length} anggota tim`)
        }
      }
    } else {
      if (!checks?.identity_card) missingDocs.push("Kartu Identitas")
      if (!checks?.engagement_proof) missingDocs.push("Bukti Engagement") 
      if (!checks?.payment_proof) missingDocs.push("Bukti Pembayaran")
    }
    
    const message = `Harap verifikasi semua berkas terlebih dahulu untuk kompetisi ${competitionType}:\n\nBelum diverifikasi:\n${missingDocs.map(doc => `• ${doc}`).join('\n')}`
    
    alert(message)
    return
  }

  // Store original data untuk rollback
  const originalStatus = registration.status
  const originalUpdatedAt = registration.updated_at
  
  // 🔥 OPTIMISTIC UPDATE: Update state lokal dulu
  setRegistrations(prev => prev.map(reg => 
    reg.id === id 
      ? { ...reg, status: newStatus, updated_at: new Date().toISOString() }
      : reg
  ))

  // Update selectedRegistration jika sedang dilihat di dialog
  if (selectedRegistration?.id === id) {
    setSelectedRegistration(prev => prev ? {
      ...prev, 
      status: newStatus, 
      updated_at: new Date().toISOString()
    } : null)
  }

  setLoadingRows(prev => new Set(prev).add(id))
  
  try {
    // Database update dengan retry
    await withRetry(async () => {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    })

    showSuccessToast(`Status berhasil diubah menjadi ${newStatus}`)
    
  } catch (error) {
    // 🔥 ROLLBACK: Kembalikan state lokal ke kondisi semula
    setRegistrations(prev => prev.map(reg => 
      reg.id === id 
        ? { ...reg, status: originalStatus, updated_at: originalUpdatedAt }
        : reg
    ))

    // Rollback selectedRegistration juga
    if (selectedRegistration?.id === id) {
      setSelectedRegistration(prev => prev ? {
        ...prev, 
        status: originalStatus, 
        updated_at: originalUpdatedAt
      } : null)
    }

    showErrorToast(error, "handleStatusChange")
    throw error // Re-throw untuk handleDialogStatusChange
  } finally {
    setLoadingRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }
}

const handleDialogStatusChange = async (registrationId: string, newStatus: 'approved' | 'rejected') => {
  if (!selectedRegistration) return
  
  setIsProcessingStatus(true)
  setProcessingAction(newStatus)
  
  try {
    // Panggil function handleStatusChange yang sudah ada
    await handleStatusChange(registrationId, newStatus)
    
    // Jika berhasil, tutup dialog
    setSelectedRegistration(null)
    setShowDetailDialog(false)
    
  } catch (error) {
    // Error handling sudah ada di handleStatusChange
    console.error("Error in dialog status change:", error)
  } finally {
    setIsProcessingStatus(false)
    setProcessingAction(null)
  }
}

  const handleSort = (column: string) => {
    console.log("[v0] Sort clicked:", { column, currentSortBy: sortBy, currentSortOrder: sortOrder })

    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
    setCurrentPage(1)

    const newSortOrder = sortBy === column ? (sortOrder === "asc" ? "desc" : "asc") : "asc"
    console.log("[v0] New sort state:", { sortBy: column, sortOrder: newSortOrder })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCompetitionFilter("all")
    setEducationFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setCurrentPage(1)
    setSortBy("created_at")
    setSortOrder("desc")
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleCompetitionFilterChange = (value: string) => {
    setCompetitionFilter(value)
  }

  const handleEducationFilterChange = (value: string) => {
    setEducationFilter(value)
  }

  const handleDateFromChange = (value: string) => {
    setDateFromFilter(value)
  }

  const handleDateToChange = (value: string) => {
    setDateToFilter(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        )
    }
  }

  const handleViewDetail = (registration: UnifiedRegistration) => {
    setSelectedRegistration(registration)
    setShowDetailDialog(true)
  }
  
  const downloadFile = (url: string, filename: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      })
      .catch((error) => showErrorToast(error, "downloadFile"))
  }

  const handleTeamMemberVerificationCheck = async (memberId: string, registrationId: string, checked: boolean) => {
  try {
    // Update state lokal
    setVerificationChecks((prev) => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        team_members: {
          ...prev[registrationId].team_members,
          [memberId]: { identity_card_verified: checked },
        },
      },
    }))

    // Panggil API untuk menyimpan ke database
    const response = await fetch("/api/admin/registrations/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamMemberId: memberId, // Kirim ID anggota tim
        verificationType: "identity_card_verified",
        isVerified: checked,
      }),
    })

    if (!response.ok) throw new Error("Gagal memperbarui status verifikasi anggota")

    showSuccessToast("Status verifikasi anggota tim diperbarui")
  } catch (error) {
    // Rollback state jika gagal
    setVerificationChecks((prev) => ({
      ...prev,
      [registrationId]: {
        ...prev[registrationId],
        team_members: {
          ...prev[registrationId].team_members,
          [memberId]: { identity_card_verified: !checked },
        },
      },
    }))
    showErrorToast(error, "handleTeamMemberVerificationCheck")
  }
}

  const [showEditSubjectDialog, setShowEditSubjectDialog] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<UnifiedRegistration | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("")

  const handleEditSubject = (registration: UnifiedRegistration) => {
  setEditingRegistration(registration)
  setSelectedSubject(registration.selected_subject_id || "")
  setShowEditSubjectDialog(true)
}

const handleSaveSubject = async () => {
  if (!editingRegistration || !selectedSubject) return

  setLoading(true)
  try {
    const { error } = await supabase
      .from("registrations")
      .update({
        selected_subject_id: selectedSubject,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingRegistration.id)

    if (error) throw error

    // Update state lokal
    setRegistrations(prev => prev.map(reg => 
      reg.id === editingRegistration.id 
        ? { ...reg, selected_subject_id: selectedSubject, updated_at: new Date().toISOString() }
        : reg
    ))

    const subjectName = ospSubjects.find(s => s.id === selectedSubject)?.name
    showSuccessToast(`Bidang OSP berhasil diubah menjadi ${subjectName}`)
    setShowEditSubjectDialog(false)
  } catch (error) {
    showErrorToast(error, "handleSaveSubject")
  } finally {
    setLoading(false)
  }
}

const handleEditProfile = (registration: UnifiedRegistration) => {
  setEditingProfile(registration.profiles)
  setSelectedRegistration(registration) // Simpan seluruh data registrasi
  setShowEditProfileDialog(true)
}

const handleSaveProfile = async () => {
  if (!editingProfile || !selectedRegistration) return

  setIsSavingProfile(true)
  try {
    const { error } = await supabase
      .from("profiles")
      .update(editingProfile)
      .eq("id", editingProfile.id)

    if (error) throw error

    // Perbarui state lokal registrations
    setRegistrations(prev =>
      prev.map(reg =>
        reg.id === selectedRegistration.id
          ? { ...reg, profiles: editingProfile }
          : reg
      )
    )

    // 🔥 TAMBAHKAN: Update selectedRegistration juga
    setSelectedRegistration(prev => 
      prev ? { ...prev, profiles: editingProfile } : null
    )

    showSuccessToast("Profil peserta berhasil diperbarui")
    setShowEditProfileDialog(false)
    setEditingProfile(null)
  } catch (error) {
    showErrorToast(error, "handleSaveProfile")
  } finally {
    setIsSavingProfile(false)
  }
}

const handleProfileInputChange = (field: string, value: any) => {
  setEditingProfile((prev: any) => ({ ...prev, [field]: value }))
}


  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Pendaftaran</h2>
            <p className="text-muted-foreground">
              Kelola persetujuan pendaftaran peserta
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Users className="mr-2 h-4 w-4" />
                Aksi Massal ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Lanjutan
            </Button>
          </div>
        </div>

        {/* Comprehensive Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disetujui Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.approvedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ditolak Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.rejectedToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filter & Search Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Pencarian Lanjutan
            </CardTitle>
            <CardDescription>
              Gunakan filter untuk mencari dan mengelola pendaftaran dengan lebih detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* First row - Search and basic filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, email, sekolah, atau nomor identitas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {(loading || searchTerm !== debouncedSearchTerm) && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={competitionFilter} onValueChange={handleCompetitionFilterChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Kompetisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kompetisi</SelectItem>
                    <SelectItem value="OSP">OSP</SelectItem>
                    <SelectItem value="EGK">EGK</SelectItem>
                    <SelectItem value="SCC">SCC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Select value={educationFilter} onValueChange={handleEducationFilterChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Jenjang Pendidikan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenjang</SelectItem>
                    <SelectItem value="SMA/Sederajat">SMA/Sederajat</SelectItem>
                    <SelectItem value="Mahasiswa/i">Mahasiswa/i</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 items-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm whitespace-nowrap">Dari:</Label>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full md:w-[150px]"
                  />
                  <Label className="text-sm whitespace-nowrap">Sampai:</Label>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full md:w-[150px]"
                  />
                </div>
                <Button variant="outline" onClick={handleResetFilters} className="whitespace-nowrap bg-transparent">
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Management Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  Data Pendaftaran ({totalRecords} total, halaman {currentPage} dari {totalPages})
                </CardTitle>
                <CardDescription>Kelola semua pendaftaran dengan status yang dapat diubah</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === registrations.length && registrations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Pilih Semua</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    <span>Memuat data...</span>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50px]">
                        <CheckSquare className="h-4 w-4" />
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("profiles.full_name")}
                          className="h-auto p-0 font-semibold"
                        >
                          Nama Peserta
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("competitions.code")}
                          className="h-auto p-0 font-semibold"
                        >
                          Kompetisi
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Bidang OSP</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("profiles.education_level")}
                          className="h-auto p-0 font-semibold"
                        >
                          Jenjang
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Sekolah/Institusi</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("created_at")}
                          className="h-auto p-0 font-semibold"
                        >
                          Tanggal Daftar
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ubah Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(registration.id)}
                            onCheckedChange={(checked) => handleSelectOne(registration.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{registration.profiles.full_name}</p>
                            <p className="text-sm text-gray-500">{registration.profiles.identity_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {registration.competitions.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            if (registration.competitions.code !== "OSP") return "-"
                            
                            const subject = ospSubjects.find((s) => s.id === registration.selected_subject_id)
                            
                            return (
                              <div className="flex items-center gap-2">
                                {subject ? (
                                  <Badge variant="outline">{subject.name}</Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    Belum Dipilih
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditSubject(registration)}
                                  title="Edit Bidang OSP"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{registration.profiles.education_level}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={registration.profiles.school_institution}>
                          {registration.profiles.school_institution}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={registration.profiles.email}>
                          {registration.profiles.email}
                        </TableCell>
                        <TableCell>{new Date(registration.created_at).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>
                          <div className="transition-all duration-300 ease-in-out">
                            {getStatusBadge(registration.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={registration.status}
                            onValueChange={(newStatus) => handleStatusChange(registration.id, newStatus)}
                            disabled={loadingRows.has(registration.id)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="approved">Setujui</SelectItem>
                              <SelectItem value="rejected">Tolak</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetail(registration)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                                {registration.competitions.code === "OSP" && (
                                  <DropdownMenuItem onClick={() => handleEditSubject(registration)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Bidang OSP
                                  </DropdownMenuItem>
                                )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(registration.id, "approved")}
                                disabled={loadingRows.has(registration.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Setujui Cepat
                                {loadingRows.has(registration.id) && (
                                  <div className="ml-auto animate-spin h-3 w-3 border border-gray-300 border-t-green-600 rounded-full"></div>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleStatusChange(registration.id, "rejected")}
                                disabled={loadingRows.has(registration.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Tolak Cepat
                                {loadingRows.has(registration.id) && (
                                  <div className="ml-auto animate-spin h-3 w-3 border border-gray-300 border-t-red-600 rounded-full"></div>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevPage || loading}
                    >
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage || loading}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}

              {filteredRegistrations.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tidak Ada Data Ditemukan</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || competitionFilter !== "all"
                      ? "Coba ubah filter atau kata kunci pencarian"
                      : "Belum ada pendaftaran dalam sistem"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aksi Massal</DialogTitle>
              <DialogDescription>Ubah status untuk {selectedIds.length} pendaftaran yang dipilih</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-status">Status Baru</Label>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Setujui Semua</SelectItem>
                    <SelectItem value="rejected">Tolak Semua</SelectItem>
                    <SelectItem value="pending">Kembalikan ke Menunggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bulk-reason">Catatan (Opsional)</Label>
                <Input
                  id="bulk-reason"
                  placeholder="Alasan perubahan status..."
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleBulkApproval} disabled={loading || !bulkStatus}>
                {loading ? "Memproses..." : "Terapkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data Lanjutan</DialogTitle>
              <DialogDescription>Pilih format dan opsi export yang diinginkan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Format Export</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx) - Rekomendasi</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-team"
                  checked={includeTeamMembers}
                  onCheckedChange={(checked) => setIncludeTeamMembers(Boolean(checked))}
                />
                <Label htmlFor="include-team">Sertakan data anggota tim (untuk kompetisi tim)</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Data yang akan diexport:</strong> Semua data yang sesuai dengan filter saat ini
                </p>
                <p className="text-xs mt-1">
                  Export akan mengambil semua data dari database yang sesuai dengan filter, bukan hanya data yang tampil
                  di halaman ini.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleAdvancedExport} disabled={loading}>
                {loading ? "Mengexport..." : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        {selectedRegistration && (
          <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detail Pendaftaran - {selectedRegistration.profiles.full_name}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList
                    className={`grid w-full ${
                    selectedRegistration.competitions.participant_type === "Team" &&
                    selectedRegistration.team_members &&
                    selectedRegistration.team_members.length > 0
                        ? "grid-cols-3"
                        : "grid-cols-2"
                    }`}
                >
                    <TabsTrigger value="info">Informasi Peserta</TabsTrigger>
                    <TabsTrigger value="files">Berkas</TabsTrigger>
                    {selectedRegistration.competitions.participant_type === "Team" &&
                    selectedRegistration.team_members &&
                    selectedRegistration.team_members.length > 0 && (
                        <TabsTrigger value="team">Anggota Tim</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                  <div>
  <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <User className="w-5 h-5" />
      Informasi Dasar
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleEditProfile(selectedRegistration)}
    >
      <Edit className="w-3 h-3 mr-2" />
      Edit Profil
    </Button>
  </h3>
  <div className="grid gap-4 md:grid-cols-2">
    {/* Informasi Dasar */}
    <div className="space-y-2">
      <Label className="text-sm font-medium">Nama Lengkap</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.full_name}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Email</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.email}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Sekolah/Institusi</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.school_institution}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Jenjang Pendidikan</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.education_level}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Nomor Identitas</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.identity_number}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">No. HP (WhatsApp)</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.phone || "Belum diisi"}</p>
    </div>

    {/* Informasi Tambahan */}
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tempat Lahir</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.tempat_lahir || "Belum diisi"}</p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tanggal Lahir</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">
        {selectedRegistration.profiles.tanggal_lahir
          ? new Date(selectedRegistration.profiles.tanggal_lahir).toLocaleDateString("id-ID")
          : "Belum diisi"}
      </p>
    </div>
    <div className="space-y-2">
      <Label className="text-sm font-medium">Jenis Kelamin</Label>
      <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.jenis_kelamin || "Belum diisi"}</p>
    </div>
    {selectedRegistration.profiles.education_level === "SMA/Sederajat" ? (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Kelas</Label>
        <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.profiles.kelas || "Belum diisi"}</p>
      </div>
    ) : (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Semester</Label>
        <p className="text-sm bg-gray-50 p-2 rounded">
          {selectedRegistration.profiles.semester ? `Semester ${selectedRegistration.profiles.semester}` : "Belum diisi"}
        </p>
      </div>
    )}
    <div className="space-y-2 md:col-span-2">
      <Label className="text-sm font-medium">Alamat Domisili</Label>
      <p className="text-sm bg-gray-50 p-2 rounded min-h-[60px]">{selectedRegistration.profiles.alamat || "Belum diisi"}</p>
    </div>
  </div>
</div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Informasi Kompetisi
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Kompetisi</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedRegistration.competitions.name}</p>
                      </div>
                      {selectedRegistration.competitions.code === "OSP" && selectedRegistration.selected_subject_id && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Bidang OSP</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRegistration(null)
                                handleEditSubject(selectedRegistration)
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          <p className="text-sm bg-gray-50 p-2 rounded">
                            {ospSubjects.find((s) => s.id === selectedRegistration.selected_subject_id)?.name ||
                              "ID Tidak Dikenal"}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status Pendaftaran</Label>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedRegistration.status)}
                          <span className="text-xs text-gray-500">
                            Diperbarui: {new Date(selectedRegistration.updated_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Berkas Pendaftaran
                      </h3>
                      <div className={`grid grid-cols-1 ${selectedRegistration.competitions.code === "SCC" ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                        {selectedRegistration.competitions.code !== "SCC" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Kartu Identitas</Label>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`verify-identity-${selectedRegistration.id}`}
                                  checked={verificationChecks[selectedRegistration.id]?.identity_card || false}
                                  onCheckedChange={(checked) =>
                                    handleVerificationCheck(selectedRegistration.id, "identity_card", checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={`verify-identity-${selectedRegistration.id}`}
                                  className="text-xs text-green-600"
                                >
                                  Terverifikasi
                                </Label>
                              </div>
                            </div>
                            {selectedRegistration.identity_card_url ? (
                              <div className="relative">
                                <img
                                  src={getOptimizedCloudinaryUrl(selectedRegistration.identity_card_url, 300)}
                                  alt="Kartu Identitas"
                                  className="w-full h-32 object-cover rounded border"
                                />
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="absolute top-2 right-2"
                                  onClick={() => selectedRegistration.identity_card_url && window.open(selectedRegistration.identity_card_url, "_blank")}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <p className="text-sm text-gray-500">Belum diunggah</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Bukti Engagement</Label>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`verify-engagement-${selectedRegistration.id}`}
                                checked={verificationChecks[selectedRegistration.id]?.engagement_proof || false}
                                onCheckedChange={(checked) =>
                                  handleVerificationCheck(
                                    selectedRegistration.id,
                                    "engagement_proof",
                                    checked as boolean,
                                  )
                                }
                              />
                              <Label
                                htmlFor={`verify-engagement-${selectedRegistration.id}`}
                                className="text-xs text-green-600"
                              >
                                Terverifikasi
                              </Label>
                            </div>
                          </div>
                          {selectedRegistration.engagement_proof_url ? (
                            <div className="relative">
                              <img
                                src={getOptimizedCloudinaryUrl(selectedRegistration.engagement_proof_url, 300)}
                                alt="Bukti Engagement"
                                className="w-full h-32 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={() => selectedRegistration.payment_proof_url && window.open(selectedRegistration.payment_proof_url, "_blank")}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                              <p className="text-sm text-gray-500">Belum diunggah</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Bukti Pembayaran</Label>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`verify-payment-${selectedRegistration.id}`}
                                checked={verificationChecks[selectedRegistration.id]?.payment_proof || false}
                                onCheckedChange={(checked) =>
                                  handleVerificationCheck(selectedRegistration.id, "payment_proof", checked as boolean)
                                }
                              />
                              <Label
                                htmlFor={`verify-payment-${selectedRegistration.id}`}
                                className="text-xs text-green-600"
                              >
                                Terverifikasi
                              </Label>
                            </div>
                          </div>
                          {selectedRegistration.payment_proof_url ? (
                            <div className="relative">
                              <img
                                src={getOptimizedCloudinaryUrl(selectedRegistration.payment_proof_url, 300)}
                                alt="Bukti Pembayaran"
                                className="w-full h-32 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={() => selectedRegistration.engagement_proof_url && window.open(selectedRegistration.engagement_proof_url, "_blank")}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                              <p className="text-sm text-gray-500">Belum diunggah</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {isAllVerified(selectedRegistration) ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                Semua berkas telah diverifikasi - Siap untuk disetujui
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                              <span className="text-sm font-medium text-amber-600">
                                Harap verifikasi semua berkas sebelum menyetujui pendaftaran
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

               {selectedRegistration.competitions.participant_type === "Team" &&
    selectedRegistration.team_members &&
    selectedRegistration.team_members.length > 0 && (
    <TabsContent value="team" className="space-y-4">
        <div className="space-y-4">
        {selectedRegistration.team_members.map((member: any, index: number) => (
            <Card key={index}>
            <CardHeader>
                <CardTitle className="text-base">Anggota {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-3">
                    Informasi Dasar
                    </h5>
                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-sm font-medium">Nama</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.full_name}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.email || "Belum diisi"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Nomor Identitas</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.identity_number}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">No. HP</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.phone || "Belum diisi"}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-3">
                    Informasi Akademik
                    </h5>
                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-sm font-medium">Sekolah/Institusi</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.school_institution || "Belum diisi"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Jenjang Pendidikan</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.education_level || "Belum diisi"}
                        </p>
                    </div>
                    {member.education_level === "SMA/Sederajat" && (
                        <div>
                        <Label className="text-sm font-medium">Kelas</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                            {member.kelas || "Belum diisi"}
                        </p>
                        </div>
                    )}
                    {member.education_level === "Mahasiswa/i" && (
                        <div>
                        <Label className="text-sm font-medium">Semester</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                            {member.semester
                            ? `Semester ${member.semester}`
                            : "Belum diisi"}
                        </p>
                        </div>
                    )}
                    </div>
                </div>

                {/* Personal Information */}
                <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-3">
                    Informasi Pribadi
                    </h5>
                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-sm font-medium">Tempat Lahir</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.tempat_lahir || "Belum diisi"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Tanggal Lahir</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.tanggal_lahir
                            ? new Date(member.tanggal_lahir).toLocaleDateString("id-ID")
                            : "Belum diisi"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Jenis Kelamin</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                        {member.jenis_kelamin || "Belum diisi"}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Alamat Domisili</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded mt-1 min-h-[60px]">
                        {member.alamat || "Belum diisi"}
                        </p>
                    </div>
                    </div>
                </div>

<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-medium">Kartu Identitas</Label>
    <div className="flex items-center gap-2">
      <Checkbox
        id={`verify-member-identity-${member.id}`}
        checked={
          verificationChecks[selectedRegistration.id]?.team_members[member.id]
            ?.identity_card_verified || false
        }
        onCheckedChange={(checked) =>
          handleTeamMemberVerificationCheck(member.id, selectedRegistration.id, checked as boolean)
        }
      />
      <Label htmlFor={`verify-member-identity-${member.id}`} className="text-xs text-green-600">
        Terverifikasi
      </Label>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-20 h-12">
      <FileViewer
        url={member.identity_card_url}
        alt="Kartu Identitas Anggota"
        className="w-full h-full"
      />
    </div>
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
        if (member.identity_card_url) {
          downloadFile(
            member.identity_card_url,
            `KTP_${member.full_name}.${member.identity_card_url.split(".").pop()}`,
          )
        }
      }}
        disabled={!member.identity_card_url}
      >
        <Download className="w-4 h-4 mr-2" />
        Unduh
      </Button>
      {member.identity_card_url && getFileType(member.identity_card_url) === "pdf" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => member.identity_card_url && window.open(member.identity_card_url, "_blank")}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
</div>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
    </TabsContent>
    )}
              </Tabs>
              <DialogFooter>
                <div className="flex justify-between w-full">
                  {/* Action buttons - hanya tampil jika status pending */}
                  {selectedRegistration?.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleDialogStatusChange(selectedRegistration.id, 'rejected')}
                        disabled={isProcessingStatus}
                      >
                        {isProcessingStatus && processingAction === 'rejected' ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Menolak...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Tolak
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleDialogStatusChange(selectedRegistration.id, 'approved')}
                        disabled={isProcessingStatus || !isAllVerified(selectedRegistration)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessingStatus && processingAction === 'approved' ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Menyetujui...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Setujui
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Close button */}
                  <Button variant="outline" onClick={() => setSelectedRegistration(null)}>
                    Tutup
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Dialog open={showEditSubjectDialog} onOpenChange={setShowEditSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bidang OSP</DialogTitle>
            <DialogDescription>
              Ubah bidang OSP untuk peserta: {editingRegistration?.profiles.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-select">Pilih Bidang OSP</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bidang OSP..." />
                </SelectTrigger>
                <SelectContent>
                  {ospSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Bidang saat ini: <strong>
                {ospSubjects.find(s => s.id === editingRegistration?.selected_subject_id)?.name || "Belum Dipilih"}
              </strong></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSubjectDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSaveSubject} 
              disabled={loading || !selectedSubject || selectedSubject === editingRegistration?.selected_subject_id}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

<Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Edit Profil Peserta</DialogTitle>
      <DialogDescription>
        Ubah data untuk: {editingProfile?.full_name}
      </DialogDescription>
    </DialogHeader>
    {editingProfile && (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {/* Informasi Dasar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={editingProfile.full_name || ""}
                onChange={(e) => handleProfileInputChange("full_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_institution">Sekolah/Institusi</Label>
              <Input
                id="school_institution"
                value={editingProfile.school_institution || ""}
                onChange={(e) => handleProfileInputChange("school_institution", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identity_number">Nomor Identitas</Label>
              <Input
                id="identity_number"
                value={editingProfile.identity_number || ""}
                onChange={(e) => handleProfileInputChange("identity_number", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. HP (WhatsApp)</Label>
              <Input
                id="phone"
                value={editingProfile.phone || ""}
                onChange={(e) => handleProfileInputChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Informasi Pribadi */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informasi Pribadi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
              <Input
                id="tempat_lahir"
                value={editingProfile.tempat_lahir || ""}
                onChange={(e) => handleProfileInputChange("tempat_lahir", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
              <Input
                id="tanggal_lahir"
                type="date"
                value={editingProfile.tanggal_lahir || ""}
                onChange={(e) => handleProfileInputChange("tanggal_lahir", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
              <Select
                value={editingProfile.jenis_kelamin || ""}
                onValueChange={(value) => handleProfileInputChange("jenis_kelamin", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingProfile.education_level === "SMA/Sederajat" ? (
              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Select value={editingProfile.kelas || ""} onValueChange={(value) => handleProfileInputChange("kelas", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  value={editingProfile.semester || ""}
                  onChange={e => handleProfileInputChange("semester", Number(e.target.value))}
                />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alamat">Alamat Domisili</Label>
              <Textarea
                id="alamat"
                value={editingProfile.alamat || ""}
                onChange={(e) => handleProfileInputChange("alamat", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    )}
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
        Batal
      </Button>
      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
        <Save className="mr-2 h-4 w-4" />
        {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </ErrorBoundary>
  )
}
