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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from "lucide-react"

// Mock data for demonstration
const participants = [
  {
    id: "1",
    name: "Ahmad Rizki",
    email: "ahmad.rizki@email.com",
    school: "SMA Negeri 1 Jakarta",
    level: "SMA/Sederajat",
    competition: "OSP",
    status: "Approved",
    registrationDate: "2024-01-15",
    identityNumber: "1234567890",
    phone: "081234567890",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    school: "Universitas Indonesia",
    level: "Perguruan Tinggi",
    competition: "EGK",
    status: "Pending",
    registrationDate: "2024-01-16",
    identityNumber: "0987654321",
    phone: "081987654321",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    school: "Institut Teknologi Bandung",
    level: "Perguruan Tinggi",
    competition: "SCC",
    status: "Approved",
    registrationDate: "2024-01-17",
    identityNumber: "1122334455",
    phone: "081122334455",
  },
  {
    id: "4",
    name: "Maya Sari",
    email: "maya.sari@email.com",
    school: "SMA Negeri 3 Surabaya",
    level: "SMA/Sederajat",
    competition: "OSP",
    status: "Rejected",
    registrationDate: "2024-01-18",
    identityNumber: "5566778899",
    phone: "081556677889",
  },
  {
    id: "5",
    name: "Andi Pratama",
    email: "andi.pratama@email.com",
    school: "Universitas Gadjah Mada",
    level: "Perguruan Tinggi",
    competition: "EGK",
    status: "Pending",
    registrationDate: "2024-01-19",
    identityNumber: "9988776655",
    phone: "081998877665",
  },
]

export default function ParticipantManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [competitionFilter, setCompetitionFilter] = useState("all")

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.school.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || participant.status.toLowerCase() === statusFilter
    const matchesCompetition = competitionFilter === "all" || participant.competition === competitionFilter

    return matchesSearch && matchesStatus && matchesCompetition
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Menunggu</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Peserta</h2>
          <p className="text-muted-foreground">Kelola data peserta UISO 2025</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
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
          <CardTitle>Data Peserta ({filteredParticipants.length})</CardTitle>
          <CardDescription>Daftar lengkap peserta yang terdaftar</CardDescription>
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
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.school}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{participant.competition}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(participant.status)}</TableCell>
                    <TableCell>{new Date(participant.registrationDate).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {participant.status === "Pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Setujui
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Tolak
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {participants.filter((p) => p.status === "Approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {participants.filter((p) => p.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {participants.filter((p) => p.status === "Rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
