"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Eye, Clock, CheckCircle, Monitor, FileText } from "lucide-react"

export default function SubmisiPage() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedCompetition, setSelectedCompetition] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  })

  const myCompetitions = [
    {
      id: "osp",
      title: "Olimpiade Sains Pelajar (OSP)",
      type: "cbt",
      subject: "Matematika",
      deadline: "15 Februari 2025",
      status: "ready",
      description: "Ujian berbasis komputer untuk OSP Matematika",
    },
    {
      id: "egk",
      title: "Esai Gagasan Kritis (EGK)",
      type: "upload",
      subject: "Lingkungan Hidup",
      deadline: "20 Februari 2025",
      status: "open",
      description: "Upload esai dengan tema lingkungan hidup",
    },
    {
      id: "scc",
      title: "Study Case Competition (SCC)",
      type: "upload",
      subject: "Business Case",
      deadline: "25 Februari 2025",
      status: "open",
      description: "Upload solusi studi kasus bisnis",
    },
  ]

  const submissions = [
    {
      id: 1,
      title: "Esai Dampak Perubahan Iklim",
      competition: "EGK",
      submittedAt: "2025-01-18 14:30",
      status: "submitted",
      score: null,
      feedback: null,
      file: "egk_essay_climate.pdf",
    },
    {
      id: 2,
      title: "Analisis Kasus Startup Digital",
      competition: "SCC",
      submittedAt: "2025-01-17 16:45",
      status: "graded",
      score: 85,
      feedback: "Analisis bagus, namun perlu perbaikan pada bagian financial projection",
      file: "scc_startup_analysis.pdf",
    },
  ]

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate file upload
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setShowUploadForm(false)
          setFormData({
            title: "",
            description: "",
            file: null,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, file })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu Review
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="default">
            <Eye className="h-3 w-3 mr-1" />
            Direview
          </Badge>
        )
      case "graded":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Dinilai
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleCBTAccess = (competition: any) => {
    // Simulate CBT access
    alert(`Mengakses CBT untuk ${competition.title}. Anda akan diarahkan ke sistem ujian.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submisi & CBT</h1>
          <p className="text-gray-600">Akses CBT untuk OSP atau upload karya untuk EGK dan SCC</p>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="competitions">Kompetisi Saya</TabsTrigger>
          <TabsTrigger value="submissions">Riwayat Submisi</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCompetitions.map((competition) => {
              const daysLeft = Math.ceil(
                (new Date(competition.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )
              return (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {competition.type === "cbt" ? (
                        <Monitor className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-500" />
                      )}
                      <Badge variant={competition.type === "cbt" ? "default" : "secondary"}>
                        {competition.type === "cbt" ? "CBT" : "Upload"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                    <CardDescription>{competition.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mata Pelajaran</span>
                        <span className="font-medium">{competition.subject}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deadline</span>
                        <span className="font-medium">{competition.deadline}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sisa Waktu</span>
                        <Badge variant={daysLeft <= 3 ? "destructive" : "default"}>
                          {daysLeft > 0 ? `${daysLeft} hari` : "Berakhir"}
                        </Badge>
                      </div>
                    </div>

                    {competition.type === "cbt" ? (
                      <Button
                        className="w-full"
                        onClick={() => handleCBTAccess(competition)}
                        disabled={competition.status !== "ready"}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        {competition.status === "ready" ? "Akses CBT" : "CBT Belum Tersedia"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={daysLeft <= 3 ? "destructive" : "default"}
                        onClick={() => {
                          setSelectedCompetition(competition.id)
                          setShowUploadForm(true)
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {daysLeft <= 3 ? "Segera Upload!" : "Upload Karya"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Submisi</CardTitle>
              <CardDescription>Semua karya yang telah Anda upload</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kompetisi</TableHead>
                    <TableHead>Tanggal Submit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.title}</TableCell>
                      <TableCell>{submission.competition}</TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.score ? (
                          <span className="font-semibold text-green-600">{submission.score}/100</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Upload Karya</CardTitle>
              <CardDescription>
                Upload karya Anda untuk {myCompetitions.find((c) => c.id === selectedCompetition)?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Karya</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul karya Anda"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Singkat</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi singkat tentang karya Anda"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File Karya</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Drag & drop file atau <span className="text-primary">browse</span>
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("file")?.click()}>
                        Pilih File
                      </Button>
                    </div>
                    {formData.file && (
                      <p className="text-sm text-green-600 mt-2">File terpilih: {formData.file.name}</p>
                    )}
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={uploadProgress > 0 && uploadProgress < 100}>
                    {uploadProgress > 0 && uploadProgress < 100 ? "Uploading..." : "Upload Karya"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
