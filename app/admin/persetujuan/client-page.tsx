"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  User,
  School,
  Mail,
  Phone,
  CreditCard,
  ImageIcon,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { showErrorToast, showSuccessToast, withRetry } from "@/lib/error-handler"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Registration } from "./page"

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    showErrorToast(error, 'downloadFile')
  }
}

const getFileType = (url: string): 'image' | 'pdf' | 'unknown' => {
  if (!url) return 'unknown'
  const extension = url.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return 'image'
  } else if (extension === 'pdf') {
    return 'pdf'
  }
  return 'unknown'
}

const FileViewer = ({ url, alt, className }: { url: string | null; alt: string; className?: string }) => {
  if (!url) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  const fileType = getFileType(url)

  if (fileType === 'image') {
    return (
      <img
        src={url}
        alt={alt}
        className={`object-cover rounded-lg ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg'
        }}
      />
    )
  } else if (fileType === 'pdf') {
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

export default function RegistrationApprovalClient({
  initialRegistrations,
  stats,
}: {
  initialRegistrations: Registration[]
  stats: { pending: number; approvedToday: number; rejectedToday: number; total: number }
}) {
  
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [approvalReason, setApprovalReason] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [competitionFilter, setCompetitionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [loading, setLoading] = useState(false)

  // Helper for deep value access in sorting
  const dlv = (obj: any, key: string) => key.split(".").reduce((acc, curr) => acc && acc[curr], obj)

  const filteredRegistrations = registrations
    .filter((registration) => {
      const matchesSearch =
        registration.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.profiles.school_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.profiles.identity_number.includes(searchTerm)

      const matchesCompetition = competitionFilter === "all" || registration.competitions.code === competitionFilter

      return matchesSearch && matchesCompetition
    })
    .sort((a, b) => {
      const aValue = sortBy.includes(".") ? dlv(a, sortBy) : (a[sortBy as keyof Registration] as any)
      const bValue = sortBy.includes(".") ? dlv(b, sortBy) : (b[sortBy as keyof Registration] as any)

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleApprove = async (id: string) => {
    setLoading(true)
    try {
      await withRetry(async () => {
        const supabase = createClient()
        const { error } = await supabase
          .from("registrations")
          .update({
            status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        if (error) throw error
      })

      showSuccessToast("Pendaftaran telah disetujui")
      setRegistrations(registrations.filter((reg) => reg.id !== id))
      setSelectedRegistration(null)
    } catch (error) {
      showErrorToast(error, "handleApprove")
    } finally {
      setLoading(false)
      setApprovalReason("")
    }
  }

  const handleReject = async (id: string) => {
    setLoading(true)
    try {
      await withRetry(async () => {
        const supabase = createClient()
        const { error } = await supabase
          .from("registrations")
          .update({
            status: "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        if (error) throw error
      })

      showSuccessToast("Pendaftaran telah ditolak")
      setRegistrations(registrations.filter((reg) => reg.id !== id))
      setSelectedRegistration(null)
    } catch (error) {
      showErrorToast(error, "handleReject")
    } finally {
      setLoading(false)
      setRejectionReason("")
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Persetujuan Pendaftaran</h2>
          <p className="text-muted-foreground">Tinjau dan setujui pendaftaran peserta UISO 2025</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disetujui Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ditolak Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nama, email, sekolah, atau nomor identitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter Kompetisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kompetisi</SelectItem>
                    <SelectItem value="OSP">OSP</SelectItem>
                    <SelectItem value="EGK">EGK</SelectItem>
                    <SelectItem value="SCC">SCC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daftar Pendaftaran Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Pendaftaran ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
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
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-gray-50">
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
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Menunggu
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detail Pendaftaran - {registration.profiles.full_name}</DialogTitle>
                                  <DialogDescription>Tinjau semua informasi dan berkas pendaftaran</DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="info" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="info">Informasi Peserta</TabsTrigger>
                                    <TabsTrigger value="files">Berkas</TabsTrigger>
                                    {registration.team_members &&
                                      registration.competitions.code !== "OSP" &&
                                      registration.competitions.code !== "EGK" && (
                                        <TabsTrigger value="team">Anggota Tim</TabsTrigger>
                                    )}
                                  </TabsList>

                                  <TabsContent value="info" className="space-y-6">
                                    <div>
                                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Informasi Dasar
                                      </h3>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Nama Lengkap
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.full_name}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.email}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <School className="w-4 h-4" />
                                            Sekolah/Institusi
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.school_institution}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            Jenjang Pendidikan
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.education_level}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Nomor Identitas</Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.identity_number}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            No. HP
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.phone || "Belum diisi"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5" />
                                        Informasi Akademik
                                      </h3>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        {registration.profiles.education_level === "SMA/Sederajat" && (
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Kelas</Label>
                                            <p className="text-sm bg-gray-50 p-2 rounded">
                                              {registration.profiles.kelas || "Belum diisi"}
                                            </p>
                                          </div>
                                        )}
                                        {registration.profiles.education_level === "Mahasiswa/i" && (
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Semester</Label>
                                            <p className="text-sm bg-gray-50 p-2 rounded">
                                              {registration.profiles.semester
                                                ? `Semester ${registration.profiles.semester}`
                                                : "Belum diisi"}
                                            </p>
                                          </div>
                                        )}
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Kompetisi</Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.competitions.name}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Informasi Pribadi
                                      </h3>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Tempat Lahir
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.tempat_lahir || "Belum diisi"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Tanggal Lahir
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.tanggal_lahir
                                              ? new Date(registration.profiles.tanggal_lahir).toLocaleDateString(
                                                  "id-ID",
                                                )
                                              : "Belum diisi"}
                                          </p>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Jenis Kelamin</Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded">
                                            {registration.profiles.jenis_kelamin || "Belum diisi"}
                                          </p>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Alamat Domisili
                                          </Label>
                                          <p className="text-sm bg-gray-50 p-2 rounded min-h-[60px]">
                                            {registration.profiles.alamat || "Belum diisi"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="files" className="space-y-4">
  <div className="grid gap-4 md:grid-cols-3">
    {/* Kartu Identitas */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Kartu Identitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video mb-2">
          <FileViewer 
            url={registration.identity_card_url}
            alt="Kartu Identitas"
            className="w-full h-full"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => registration.identity_card_url && downloadFile(
              registration.identity_card_url, 
              `KTP_${registration.profiles.full_name}.${registration.identity_card_url.split('.').pop()}`
            )}
            disabled={!registration.identity_card_url}
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh
          </Button>
          {registration.identity_card_url && getFileType(registration.identity_card_url) === 'pdf' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(registration.identity_card_url!, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Bukti Engagement */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Bukti Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video mb-2">
          <FileViewer 
            url={registration.engagement_proof_url}
            alt="Bukti Engagement"
            className="w-full h-full"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => registration.engagement_proof_url && downloadFile(
              registration.engagement_proof_url, 
              `Engagement_${registration.profiles.full_name}.${registration.engagement_proof_url.split('.').pop()}`
            )}
            disabled={!registration.engagement_proof_url}
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh
          </Button>
          {registration.engagement_proof_url && getFileType(registration.engagement_proof_url) === 'pdf' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(registration.engagement_proof_url!, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Bukti Pembayaran */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Bukti Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video mb-2">
          <FileViewer 
            url={registration.payment_proof_url}
            alt="Bukti Pembayaran"
            className="w-full h-full"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => registration.payment_proof_url && downloadFile(
              registration.payment_proof_url, 
              `Payment_${registration.profiles.full_name}.${registration.payment_proof_url.split('.').pop()}`
            )}
            disabled={!registration.payment_proof_url}
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh
          </Button>
          {registration.payment_proof_url && getFileType(registration.payment_proof_url) === 'pdf' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(registration.payment_proof_url!, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
  
  {/* Informasi rekening tetap sama */}
  <Card className="bg-blue-50 border-blue-200">
    <CardContent className="pt-4">
      <h4 className="font-medium mb-2">Informasi Rekening Pembayaran:</h4>
      <div className="text-sm space-y-1">
        <p><strong>Bank:</strong> BCA</p>
        <p><strong>No. Rekening:</strong> 1234567890</p>
        <p><strong>Atas Nama:</strong> UISO 2025</p>
        <p><strong>Jumlah:</strong> Rp 50.000</p>
      </div>
    </CardContent>
  </Card>
</TabsContent>
                                  {registration.team_members &&
                                  registration.competitions.code !== "OSP" &&
                                  registration.competitions.code !== "EGK" && (
                                    <TabsContent value="team" className="space-y-4">
                                      <div className="space-y-4">
                                        {registration.team_members.map((member: any, index: number) => (
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

                                                <div>
                                                  <Label className="text-sm font-medium">Kartu Identitas</Label>
                                                  <div className="mt-2 flex items-center gap-2">
  <div className="w-20 h-12">
    <FileViewer 
      url={member.identity_card_url}
      alt="Kartu Identitas"
      className="w-full h-full"
    />
  </div>
  <div className="flex gap-1">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => member.identity_card_url && downloadFile(
        member.identity_card_url, 
        `KTP_${member.full_name}.${member.identity_card_url.split('.').pop()}`
      )}
      disabled={!member.identity_card_url}
    >
      <Download className="w-4 h-4 mr-2" />
      Unduh
    </Button>
    {member.identity_card_url && getFileType(member.identity_card_url) === 'pdf' && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.open(member.identity_card_url, '_blank')}
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

                                <DialogFooter className="gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Tolak
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Tolak Pendaftaran</DialogTitle>
                                        <DialogDescription>Berikan alasan penolakan untuk peserta</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="rejection-reason">Alasan Penolakan</Label>
                                          <Textarea
                                            id="rejection-reason"
                                            placeholder="Masukkan alasan penolakan..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="destructive" onClick={() => handleReject(registration.id)}>
                                          Tolak Pendaftaran
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Setujui
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Setujui Pendaftaran</DialogTitle>
                                        <DialogDescription>
                                          Konfirmasi persetujuan pendaftaran peserta
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="approval-reason">Catatan (Opsional)</Label>
                                          <Textarea
                                            id="approval-reason"
                                            placeholder="Tambahkan catatan jika diperlukan..."
                                            value={approvalReason}
                                            onChange={(e) => setApprovalReason(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button onClick={() => handleApprove(registration.id)}>
                                          Setujui Pendaftaran
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Setujui Cepat
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Tolak Cepat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak Ada Data Ditemukan</h3>
                <p className="text-muted-foreground">
                  {searchTerm || competitionFilter !== "all"
                    ? "Coba ubah filter atau kata kunci pencarian"
                    : "Tidak ada pendaftaran yang menunggu persetujuan saat ini"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
