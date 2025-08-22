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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for pending registrations
const pendingRegistrations = [
  {
    id: "1",
    name: "Ahmad Rizki Pratama",
    email: "ahmad.rizki@email.com",
    school: "SMA Negeri 1 Jakarta",
    level: "SMA/Sederajat",
    competition: "OSP",
    identityNumber: "1234567890",
    phone: "081234567890",
    registrationDate: "2024-01-20",
    status: "pending",
    files: {
      identity: "/files/identity_1.jpg",
      engagement: "/files/engagement_1.jpg",
      payment: "/files/payment_1.jpg",
    },
    teamMembers: null,
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    school: "Universitas Indonesia",
    level: "Perguruan Tinggi",
    competition: "EGK",
    identityNumber: "0987654321",
    phone: "081987654321",
    registrationDate: "2024-01-21",
    status: "pending",
    files: {
      identity: "/files/identity_2.jpg",
      engagement: "/files/engagement_2.jpg",
      payment: "/files/payment_2.jpg",
    },
    teamMembers: null,
  },
  {
    id: "3",
    name: "Tim Innovators",
    email: "leader@innovators.com",
    school: "Institut Teknologi Bandung",
    level: "Perguruan Tinggi",
    competition: "SCC",
    identityNumber: "1122334455",
    phone: "081122334455",
    registrationDate: "2024-01-22",
    status: "pending",
    files: {
      identity: "/files/identity_3.jpg",
      engagement: "/files/engagement_3.jpg",
      payment: "/files/payment_3.jpg",
    },
    teamMembers: [
      {
        name: "Budi Santoso",
        identityNumber: "1111222233",
        identityFile: "/files/member1_identity.jpg",
      },
      {
        name: "Maya Sari",
        identityNumber: "4444555566",
        identityFile: "/files/member2_identity.jpg",
      },
    ],
  },
  {
    id: "4",
    name: "Dewi Sartika",
    email: "dewi.sartika@email.com",
    school: "SMA Negeri 3 Surabaya",
    level: "SMA/Sederajat",
    competition: "OSP",
    identityNumber: "5566778899",
    phone: "081556677889",
    registrationDate: "2024-01-23",
    status: "pending",
    files: {
      identity: "/files/identity_4.jpg",
      engagement: "/files/engagement_4.jpg",
      payment: "/files/payment_4.jpg",
    },
    teamMembers: null,
  },
  {
    id: "5",
    name: "Andi Wijaya",
    email: "andi.wijaya@email.com",
    school: "Universitas Gadjah Mada",
    level: "Perguruan Tinggi",
    competition: "EGK",
    identityNumber: "9988776655",
    phone: "081998877665",
    registrationDate: "2024-01-24",
    status: "pending",
    files: {
      identity: "/files/identity_5.jpg",
      engagement: "/files/engagement_5.jpg",
      payment: "/files/payment_5.jpg",
    },
    teamMembers: null,
  },
]

export default function RegistrationApproval() {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [approvalReason, setApprovalReason] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [competitionFilter, setCompetitionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("registrationDate")
  const [sortOrder, setSortOrder] = useState("desc")

  const filteredRegistrations = pendingRegistrations
    .filter((registration) => {
      const matchesSearch =
        registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.identityNumber.includes(searchTerm)

      const matchesCompetition = competitionFilter === "all" || registration.competition === competitionFilter

      return matchesSearch && matchesCompetition
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleApprove = (id: string) => {
    console.log(`Approving registration ${id} with reason: ${approvalReason}`)
    // Here you would typically make an API call to approve the registration
    setApprovalReason("")
  }

  const handleReject = (id: string) => {
    console.log(`Rejecting registration ${id} with reason: ${rejectionReason}`)
    // Here you would typically make an API call to reject the registration
    setRejectionReason("")
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
            <div className="text-2xl font-bold text-yellow-600">{filteredRegistrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disetujui Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ditolak Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
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
                    <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                      Nama Peserta
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("competition")}
                      className="h-auto p-0 font-semibold"
                    >
                      Kompetisi
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("level")} className="h-auto p-0 font-semibold">
                      Jenjang
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Sekolah/Institusi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("registrationDate")}
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
                        <p className="font-semibold">{registration.name}</p>
                        <p className="text-sm text-gray-500">{registration.identityNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {registration.competition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{registration.level}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={registration.school}>
                      {registration.school}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={registration.email}>
                      {registration.email}
                    </TableCell>
                    <TableCell>{new Date(registration.registrationDate).toLocaleDateString("id-ID")}</TableCell>
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
                                <DialogTitle>Detail Pendaftaran - {registration.name}</DialogTitle>
                                <DialogDescription>Tinjau semua informasi dan berkas pendaftaran</DialogDescription>
                              </DialogHeader>

                              <Tabs defaultValue="info" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="info">Informasi Peserta</TabsTrigger>
                                  <TabsTrigger value="files">Berkas</TabsTrigger>
                                  {registration.teamMembers && <TabsTrigger value="team">Anggota Tim</TabsTrigger>}
                                </TabsList>

                                <TabsContent value="info" className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Nama Lengkap
                                      </Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                      </Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium flex items-center gap-2">
                                        <School className="w-4 h-4" />
                                        Sekolah/Institusi
                                      </Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.school}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Nomor Telepon
                                      </Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.phone}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Nomor Identitas</Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.identityNumber}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Kompetisi</Label>
                                      <p className="text-sm bg-gray-50 p-2 rounded">{registration.competition}</p>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="files" className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                          <ImageIcon className="w-4 h-4" />
                                          Kartu Identitas
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                          <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                                          <Download className="w-4 h-4 mr-2" />
                                          Unduh
                                        </Button>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                          <FileText className="w-4 h-4" />
                                          Bukti Engagement
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                          <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                                          <Download className="w-4 h-4 mr-2" />
                                          Unduh
                                        </Button>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                          <CreditCard className="w-4 h-4" />
                                          Bukti Pembayaran
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                          <CreditCard className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                                          <Download className="w-4 h-4 mr-2" />
                                          Unduh
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="pt-4">
                                      <h4 className="font-medium mb-2">Informasi Rekening Pembayaran:</h4>
                                      <div className="text-sm space-y-1">
                                        <p>
                                          <strong>Bank:</strong> BCA
                                        </p>
                                        <p>
                                          <strong>No. Rekening:</strong> 1234567890
                                        </p>
                                        <p>
                                          <strong>Atas Nama:</strong> UISO 2025
                                        </p>
                                        <p>
                                          <strong>Jumlah:</strong> Rp 50.000
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>

                                {registration.teamMembers && (
                                  <TabsContent value="team" className="space-y-4">
                                    <div className="space-y-4">
                                      {registration.teamMembers.map((member: any, index: number) => (
                                        <Card key={index}>
                                          <CardHeader>
                                            <CardTitle className="text-base">Anggota {index + 1}</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2">
                                              <div>
                                                <Label className="text-sm font-medium">Nama</Label>
                                                <p className="text-sm bg-gray-50 p-2 rounded mt-1">{member.name}</p>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Nomor Identitas</Label>
                                                <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                                                  {member.identityNumber}
                                                </p>
                                              </div>
                                              <div className="md:col-span-2">
                                                <Label className="text-sm font-medium">Kartu Identitas</Label>
                                                <div className="mt-2 flex items-center gap-2">
                                                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                                  </div>
                                                  <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Unduh
                                                  </Button>
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
                                      <DialogDescription>Konfirmasi persetujuan pendaftaran peserta</DialogDescription>
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
  )
}
