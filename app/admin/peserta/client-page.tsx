"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, MoreHorizontal, Eye, Edit, Trash2, User, GraduationCap, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Participant } from "./page"

// The client component receives data fetched from the server as props.
export default function ParticipantManagementClient({
  participants,
  stats,
}: {
  participants: Participant[]
  stats: { total: number; approved: number; pending: number; rejected: number }
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [competitionFilter, setCompetitionFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    school_institution: "",
    education_level: "",
    identity_number: "",
    phone: "",
    kelas: "",
    semester: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
  })

  const { toast } = useToast()

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.school_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.identity_number.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || participant.registrations.some((r) => r.status === statusFilter)

    const matchesCompetition =
      competitionFilter === "all" || participant.registrations.some((r) => r.competitions.code === competitionFilter)

    return matchesSearch && matchesStatus && matchesCompetition
  })

  const getStatusBadge = (participant: Participant) => {
    const statuses = participant.registrations.map((r) => r.status)

    if (statuses.includes("approved")) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>
    } else if (statuses.includes("pending")) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Menunggu</Badge>
    } else if (statuses.includes("rejected")) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>
    }
    return <Badge variant="secondary">Tidak Ada</Badge>
  }

  const getCompetitions = (participant: Participant) => {
    return participant.registrations.map((r) => r.competitions.code).join(", ") || "Tidak ada"
  }

  const handleViewDetail = (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowDetailDialog(true)
  }

  const handleEditData = (participant: Participant) => {
    setSelectedParticipant(participant)
    setEditFormData({
      full_name: participant.full_name,
      email: participant.email,
      school_institution: participant.school_institution,
      education_level: participant.education_level,
      identity_number: participant.identity_number,
      phone: participant.phone || "",
      kelas: participant.kelas || "",
      semester: participant.semester?.toString() || "",
      tempat_lahir: participant.tempat_lahir || "",
      tanggal_lahir: participant.tanggal_lahir || "",
      jenis_kelamin: participant.jenis_kelamin || "",
      alamat: participant.alamat || "",
    })
    setShowEditDialog(true)
  }

  const handleDeleteConfirm = (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowDeleteDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedParticipant) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/participants", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedParticipant.id,
          ...editFormData,
        }),
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Data peserta berhasil diperbarui",
        })
        setShowEditDialog(false)
        window.location.reload() // Refresh data
      } else {
        throw new Error("Failed to update participant")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data peserta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedParticipant) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/participants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedParticipant.id }),
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Peserta berhasil dihapus",
        })
        setShowDeleteDialog(false)
        window.location.reload() // Refresh data
      } else {
        throw new Error("Failed to delete participant")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus peserta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      // Create CSV content
      const csvContent = [
        ["Nama", "Email", "Sekolah/Institusi", "Jenjang", "Nomor Identitas", "Kompetisi", "Status", "Tanggal Daftar"],
        ...filteredParticipants.map((participant) => [
          `"${participant.full_name}"`,
          participant.email,
          `"${participant.school_institution}"`,
          participant.education_level,
          participant.identity_number,
          `"${getCompetitions(participant)}"`,
          `"${participant.registrations.map((r) => r.status).join(", ")}"`,
          new Date(participant.created_at).toLocaleDateString("id-ID"),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `peserta_uiso_2025_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Akun</h2>
          <p className="text-muted-foreground">Kelola data akun UISO 2025</p>
        </div>
        <Button onClick={handleExportData} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Mengexport..." : "Export Data"}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>Gunakan filter untuk mencari peserta tertentu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, email, atau sekolah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
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
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Akun ({filteredParticipants.length})</CardTitle>
          <CardDescription>Daftar lengkap akun yang terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Nama</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Sekolah/Institusi</TableHead>
                  <TableHead className="font-semibold">Jenjang</TableHead>
                  <TableHead className="font-semibold">Kompetisi</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Tanggal Daftar</TableHead>
                  <TableHead className="font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{participant.full_name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.school_institution}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.education_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCompetitions(participant)}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(participant)}</TableCell>
                    <TableCell>{new Date(participant.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetail(participant)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditData(participant)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirm(participant)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredParticipants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada peserta yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
            <DialogDescription>Informasi lengkap peserta</DialogDescription>
          </DialogHeader>
          {selectedParticipant && (
            <div className="space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                    <p className="text-sm font-medium">{selectedParticipant.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedParticipant.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Sekolah/Institusi</Label>
                    <p className="text-sm">{selectedParticipant.school_institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Jenjang Pendidikan</Label>
                    <p className="text-sm">{selectedParticipant.education_level}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nomor Identitas</Label>
                    <p className="text-sm">{selectedParticipant.identity_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">No. HP</Label>
                    <p className="text-sm">{selectedParticipant.phone || "Belum diisi"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Daftar</Label>
                    <p className="text-sm">{new Date(selectedParticipant.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
              </div>

              {/* Informasi Akademik */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Informasi Akademik
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedParticipant.education_level === "SMA/Sederajat" && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kelas</Label>
                      <p className="text-sm">{selectedParticipant.kelas || "Belum diisi"}</p>
                    </div>
                  )}
                  {selectedParticipant.education_level === "Mahasiswa/i" && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Semester</Label>
                      <p className="text-sm">
                        {selectedParticipant.semester ? `Semester ${selectedParticipant.semester}` : "Belum diisi"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Pribadi */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tempat Lahir</Label>
                    <p className="text-sm">{selectedParticipant.tempat_lahir || "Belum diisi"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Lahir</Label>
                    <p className="text-sm">
                      {selectedParticipant.tanggal_lahir
                        ? new Date(selectedParticipant.tanggal_lahir).toLocaleDateString("id-ID")
                        : "Belum diisi"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Jenis Kelamin</Label>
                    <p className="text-sm">{selectedParticipant.jenis_kelamin || "Belum diisi"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Alamat Domisili</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded min-h-[60px]">
                      {selectedParticipant.alamat || "Belum diisi"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Peserta</DialogTitle>
            <DialogDescription>Ubah informasi peserta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-school">Sekolah/Institusi</Label>
              <Input
                id="edit-school"
                value={editFormData.school_institution}
                onChange={(e) => setEditFormData({ ...editFormData, school_institution: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-level">Jenjang Pendidikan</Label>
              <Select
                value={editFormData.education_level}
                onValueChange={(value) => setEditFormData({ ...editFormData, education_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMA/Sederajat">SMA/Sederajat</SelectItem>
                  <SelectItem value="Mahasiswa/i">Mahasiswa/i</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-identity">Nomor Identitas</Label>
              <Input
                id="edit-identity"
                value={editFormData.identity_number}
                onChange={(e) => setEditFormData({ ...editFormData, identity_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">No. HP</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-kelas">Kelas</Label>
              <Input
                id="edit-kelas"
                value={editFormData.kelas}
                onChange={(e) => setEditFormData({ ...editFormData, kelas: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-semester">Semester</Label>
              <Input
                id="edit-semester"
                value={editFormData.semester}
                onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tempat-lahir">Tempat Lahir</Label>
              <Input
                id="edit-tempat-lahir"
                value={editFormData.tempat_lahir}
                onChange={(e) => setEditFormData({ ...editFormData, tempat_lahir: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tanggal-lahir">Tanggal Lahir</Label>
              <Input
                id="edit-tanggal-lahir"
                type="date"
                value={editFormData.tanggal_lahir}
                onChange={(e) => setEditFormData({ ...editFormData, tanggal_lahir: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-jenis-kelamin">Jenis Kelamin</Label>
              <Select
                value={editFormData.jenis_kelamin}
                onValueChange={(value) => setEditFormData({ ...editFormData, jenis_kelamin: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-alamat">Alamat Domisili</Label>
              <Input
                id="edit-alamat"
                value={editFormData.alamat}
                onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Peserta</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus peserta <strong>{selectedParticipant?.full_name}</strong>? Tindakan ini
              tidak dapat dibatalkan dan akan menghapus semua data registrasi peserta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
