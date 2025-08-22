"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Users,
  FileText,
  Calendar,
  Download,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react"

// Mock data for competitions
const competitions = [
  {
    id: "osp",
    name: "Olimpiade Sains Pelajar (OSP)",
    type: "Individu",
    level: "SMA/Sederajat",
    participants: 456,
    approved: 398,
    pending: 45,
    rejected: 13,
    submissions: 0,
    registrationDeadline: "2024-02-15",
    competitionDate: "2024-03-01",
    status: "registration",
    description: "Kompetisi sains untuk siswa SMA/sederajat",
    maxParticipants: 500,
    registrationFee: 50000,
  },
  {
    id: "egk",
    name: "Esai Gagasan Kritis (EGK)",
    type: "Individu",
    level: "Perguruan Tinggi",
    participants: 234,
    approved: 201,
    pending: 28,
    rejected: 5,
    submissions: 156,
    registrationDeadline: "2024-02-20",
    competitionDate: "2024-03-10",
    status: "submission",
    description: "Kompetisi esai untuk mahasiswa",
    maxParticipants: 300,
    registrationFee: 75000,
  },
  {
    id: "scc",
    name: "Study Case Competition (SCC)",
    type: "Tim",
    level: "Perguruan Tinggi",
    participants: 89,
    approved: 76,
    pending: 10,
    rejected: 3,
    submissions: 45,
    registrationDeadline: "2024-02-25",
    competitionDate: "2024-03-15",
    status: "submission",
    description: "Kompetisi studi kasus untuk tim mahasiswa",
    maxParticipants: 100,
    registrationFee: 100000,
  },
]

export default function CompetitionManagement() {
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registration":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pendaftaran</Badge>
      case "submission":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Submisi</Badge>
      case "evaluation":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Evaluasi</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Selesai</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCompetitionIcon = (id: string) => {
    switch (id) {
      case "osp":
        return <Trophy className="h-6 w-6 text-blue-600" />
      case "egk":
        return <FileText className="h-6 w-6 text-green-600" />
      case "scc":
        return <Users className="h-6 w-6 text-purple-600" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kompetisi</h2>
          <p className="text-muted-foreground">Kelola semua kompetisi UISO 2025</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kompetisi
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Kompetisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions.reduce((sum, comp) => sum + comp.participants, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {competitions.reduce((sum, comp) => sum + comp.pending, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {competitions.reduce((sum, comp) => sum + comp.submissions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competition Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {competitions.map((competition) => (
          <Card key={competition.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCompetitionIcon(competition.id)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{competition.name}</CardTitle>
                      {getStatusBadge(competition.status)}
                    </div>
                    <CardDescription>
                      {competition.description} • {competition.type} • {competition.level}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCompetition(competition)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Statistik
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Statistik {competition.name}</DialogTitle>
                        <DialogDescription>Analisis lengkap kompetisi dan peserta</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                          <TabsTrigger value="participants">Peserta</TabsTrigger>
                          <TabsTrigger value="submissions">Submisi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Pendaftaran</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>
                                      {Math.round((competition.participants / competition.maxParticipants) * 100)}%
                                    </span>
                                  </div>
                                  <Progress value={(competition.participants / competition.maxParticipants) * 100} />
                                  <p className="text-xs text-muted-foreground">
                                    {competition.participants} dari {competition.maxParticipants} peserta
                                  </p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Status Persetujuan</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Disetujui</span>
                                    <span>{competition.approved}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-yellow-600">Menunggu</span>
                                    <span>{competition.pending}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Ditolak</span>
                                    <span>{competition.rejected}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Jadwal Penting</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4" />
                                  <span>Batas Pendaftaran:</span>
                                  <span className="font-medium">
                                    {new Date(competition.registrationDeadline).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>Tanggal Kompetisi:</span>
                                  <span className="font-medium">
                                    {new Date(competition.competitionDate).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Informasi Biaya</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">
                                  Rp {competition.registrationFee.toLocaleString("id-ID")}
                                </div>
                                <p className="text-xs text-muted-foreground">Biaya pendaftaran per peserta</p>
                                <div className="mt-2 text-sm">
                                  <span className="text-green-600 font-medium">
                                    Total: Rp{" "}
                                    {(competition.approved * competition.registrationFee).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="participants" className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Disetujui
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-green-600">{competition.approved}</div>
                                <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Data
                                </Button>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                  Menunggu
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{competition.pending}</div>
                                <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Tinjau
                                </Button>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  Ditolak
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-red-600">{competition.rejected}</div>
                                <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Lihat Alasan
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="submissions" className="space-y-4">
                          {competition.status === "submission" ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Status Submisi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Sudah Submit</span>
                                      <span className="font-medium">{competition.submissions}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Belum Submit</span>
                                      <span className="font-medium">
                                        {competition.approved - competition.submissions}
                                      </span>
                                    </div>
                                    <Progress value={(competition.submissions / competition.approved) * 100} />
                                    <p className="text-xs text-muted-foreground">
                                      {Math.round((competition.submissions / competition.approved) * 100)}% peserta
                                      telah submit
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Aksi Submisi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Semua Submisi
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Lihat Submisi
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analisis Submisi
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          ) : (
                            <Card>
                              <CardContent className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Fase Submisi Belum Dimulai</h3>
                                <p className="text-muted-foreground">
                                  Submisi akan tersedia setelah fase pendaftaran selesai
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Pengaturan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pengaturan {competition.name}</DialogTitle>
                        <DialogDescription>Ubah pengaturan kompetisi</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="reg-deadline">Batas Pendaftaran</Label>
                            <Input id="reg-deadline" type="date" defaultValue={competition.registrationDeadline} />
                          </div>
                          <div>
                            <Label htmlFor="comp-date">Tanggal Kompetisi</Label>
                            <Input id="comp-date" type="date" defaultValue={competition.competitionDate} />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="max-participants">Maksimal Peserta</Label>
                            <Input id="max-participants" type="number" defaultValue={competition.maxParticipants} />
                          </div>
                          <div>
                            <Label htmlFor="reg-fee">Biaya Pendaftaran</Label>
                            <Input id="reg-fee" type="number" defaultValue={competition.registrationFee} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="status">Status Kompetisi</Label>
                          <Select defaultValue={competition.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="registration">Pendaftaran</SelectItem>
                              <SelectItem value="submission">Submisi</SelectItem>
                              <SelectItem value="evaluation">Evaluasi</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea id="description" defaultValue={competition.description} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button>Simpan Perubahan</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Peserta</p>
                  <p className="text-2xl font-bold">{competition.participants}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">{competition.approved}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">{competition.pending}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submisi</p>
                  <p className="text-2xl font-bold text-blue-600">{competition.submissions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Batas Daftar</p>
                  <p className="text-sm font-medium">
                    {new Date(competition.registrationDeadline).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress Pendaftaran</span>
                  <span>{Math.round((competition.participants / competition.maxParticipants) * 100)}%</span>
                </div>
                <Progress value={(competition.participants / competition.maxParticipants) * 100} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
