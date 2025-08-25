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
import type { CompetitionWithStats } from "./page"

export default function CompetitionManagementClient({ competitions }: { competitions: CompetitionWithStats[] }) {
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionWithStats | null>(null)

  const getStatusBadge = (status: string) => {
    // This function seems to be based on a 'status' field that isn't in the provided data.
    // I will mock a status for demonstration.
    const mockStatus: { [key: string]: string } = {
        OSP: "registration",
        EGK: "submission",
        SCC: "submission"
    }
    const currentStatus = mockStatus[status] || "registration";

    switch (currentStatus) {
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

  const getCompetitionIcon = (code: string) => {
    switch (code) {
      case "OSP":
        return <Trophy className="h-6 w-6 text-blue-600" />
      case "EGK":
        return <FileText className="h-6 w-6 text-green-600" />
      case "SCC":
        return <Users className="h-6 w-6 text-purple-600" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }

  // Mock data for max participants and fee, as it's not in the DB schema
  const getMockDetails = (code: string) => {
      const details: {[key: string]: {maxParticipants: number, registrationFee: number, status: string}} = {
          "OSP": { maxParticipants: 500, registrationFee: 50000, status: 'registration' },
          "EGK": { maxParticipants: 300, registrationFee: 75000, status: 'submission' },
          "SCC": { maxParticipants: 100, registrationFee: 100000, status: 'submission' }
      }
      return details[code] || { maxParticipants: 500, registrationFee: 50000, status: 'registration' };
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
        {competitions.map((competition) => {
            const mockDetails = getMockDetails(competition.code);
            const registrationProgress = mockDetails.maxParticipants > 0 ? (competition.participants / mockDetails.maxParticipants) * 100 : 0;
            return (
          <Card key={competition.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCompetitionIcon(competition.code)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{competition.name}</CardTitle>
                      {getStatusBadge(competition.code)}
                    </div>
                    <CardDescription>
                      {competition.description} • {competition.participant_type} • {competition.target_level}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog onOpenChange={(open) => !open && setSelectedCompetition(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCompetition(competition)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Statistik
                      </Button>
                    </DialogTrigger>
                    {selectedCompetition && selectedCompetition.id === competition.id && (
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Statistik {selectedCompetition.name}</DialogTitle>
                        <DialogDescription>Analisis lengkap kompetisi dan peserta</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                          <TabsTrigger value="participants">Peserta</TabsTrigger>
                          <TabsTrigger value="submissions">Submisi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 pt-4">
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
                                      {Math.round(registrationProgress)}%
                                    </span>
                                  </div>
                                  <Progress value={registrationProgress} />
                                  <p className="text-xs text-muted-foreground">
                                    {selectedCompetition.participants} dari {mockDetails.maxParticipants} peserta
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
                                    <span>{selectedCompetition.approved}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-yellow-600">Menunggu</span>
                                    <span>{selectedCompetition.pending}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Ditolak</span>
                                    <span>{selectedCompetition.rejected}</span>
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
                                    {new Date(selectedCompetition.registration_end).toLocaleDateString("id-ID")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>Tanggal Kompetisi:</span>
                                  <span className="font-medium">
                                    {new Date(selectedCompetition.competition_date).toLocaleDateString("id-ID")}
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
                                  Rp {mockDetails.registrationFee.toLocaleString("id-ID")}
                                </div>
                                <p className="text-xs text-muted-foreground">Biaya pendaftaran per peserta</p>
                                <div className="mt-2 text-sm">
                                  <span className="text-green-600 font-medium">
                                    Total: Rp{" "}
                                    {(selectedCompetition.approved * mockDetails.registrationFee).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                    )}
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
                    {new Date(competition.registration_end).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress Pendaftaran</span>
                  <span>{Math.round(registrationProgress)}%</span>
                </div>
                <Progress value={registrationProgress} />
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  )
}
