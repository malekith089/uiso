"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, BookOpen, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FileUpload } from "@/components/ui/file-upload"
import { showErrorToast, showSuccessToast, withRetry } from "@/lib/error-handler"
import { ErrorBoundary } from "@/components/error-boundary"

interface Competition {
  id: string
  name: string
  code: string
  description: string
  target_level: string
  participant_type: string
  max_team_members: number
}

interface Registration {
  id: string
  competition_id: string
  team_name?: string
  team_size: number
  status: string
  created_at: string
  competitions: Competition
}

interface TeamMember {
  name: string
  identityNumber: string
  identityCardUrl: string
  email: string
  phone: string
  schoolInstitution: string
  educationLevel: string
  kelas: string
  semester: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  alamat: string
}

export default function PendaftaranPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [teamSize, setTeamSize] = useState<number>(2)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    teamName: "",
    school: "",
    coach: "",
    phone: "",
    identityCardUrl: "",
    engagementProofUrl: "",
    paymentProofUrl: "",
    teamMembers: [
      {
        name: "",
        identityNumber: "",
        identityCardUrl: "",
        email: "",
        phone: "",
        schoolInstitution: "",
        educationLevel: "Mahasiswa/i",
        kelas: "",
        semester: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
      },
      {
        name: "",
        identityNumber: "",
        identityCardUrl: "",
        email: "",
        phone: "",
        schoolInstitution: "",
        educationLevel: "",
        kelas: "",
        semester: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
      },
    ] as TeamMember[],
  })

  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
    fetchCompetitions()
    fetchRegistrations()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (error) throw error
        setUserProfile(profile)
      }
    } catch (error) {
      showErrorToast(error, "fetchUserProfile")
    }
  }

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase.from("competitions").select("*").eq("is_active", true)
      if (error) throw error
      setCompetitions(data || [])
    } catch (error) {
      showErrorToast(error, "fetchCompetitions")
    }
  }

  const fetchRegistrations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from("registrations")
          .select(`
            *,
            competitions (*)
          `)
          .eq("user_id", user.id)
        if (error) throw error
        setRegistrations(data || [])
      }
    } catch (error) {
      showErrorToast(error, "fetchRegistrations")
    }
  }

  const filteredCompetitions = competitions.filter((comp) => userProfile?.education_level === comp.target_level)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompetition || !userProfile) return

    setIsLoading(true)

    try {
      await withRetry(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { data: registration, error: regError } = await supabase
          .from("registrations")
          .insert({
            user_id: user.id,
            competition_id: selectedCompetition.id,
            team_name: selectedCompetition.participant_type === "Team" ? formData.teamName : null,
            team_size: selectedCompetition.participant_type === "Team" ? teamSize : 1,
            identity_card_url: formData.identityCardUrl,
            engagement_proof_url: formData.engagementProofUrl,
            payment_proof_url: formData.paymentProofUrl,
            status: "pending",
          })
          .select()
          .single()

        if (regError) throw regError

        if (selectedCompetition.participant_type === "Team" && registration) {
          const teamMembersData = formData.teamMembers.slice(0, teamSize).map((member, index) => ({
            registration_id: registration.id,
            full_name: member.name,
            identity_number: member.identityNumber,
            identity_card_url: member.identityCardUrl,
            email: member.email,
            phone: member.phone,
            school_institution: member.schoolInstitution,
            education_level: member.educationLevel,
            kelas: member.kelas,
            semester: member.semester ? Number.parseInt(member.semester) : null,
            tempat_lahir: member.tempatLahir,
            tanggal_lahir: member.tanggalLahir,
            jenis_kelamin: member.jenisKelamin,
            alamat: member.alamat,
            member_order: index + 1,
          }))

          const { error: membersError } = await supabase.from("team_members").insert(teamMembersData)

          if (membersError) throw membersError
        }
      })

      showSuccessToast("Pendaftaran berhasil! Menunggu persetujuan admin.")
      setShowForm(false)
      setSelectedCompetition(null)
      resetForm()
      fetchRegistrations()
    } catch (error) {
      showErrorToast(error, "handleSubmit")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      teamName: "",
      school: "",
      coach: "",
      phone: "",
      identityCardUrl: "",
      engagementProofUrl: "",
      paymentProofUrl: "",
      teamMembers: [
        {
          name: "",
          identityNumber: "",
          identityCardUrl: "",
          email: "",
          phone: "",
          schoolInstitution: "",
          educationLevel: "Mahasiswa/i",
          kelas: "",
          semester: "",
          tempatLahir: "",
          tanggalLahir: "",
          jenisKelamin: "",
          alamat: "",
        },
        {
          name: "",
          identityNumber: "",
          identityCardUrl: "",
          email: "",
          phone: "",
          schoolInstitution: "",
          educationLevel: "",
          kelas: "",
          semester: "",
          tempatLahir: "",
          tanggalLahir: "",
          jenisKelamin: "",
          alamat: "",
        },
      ],
    })
    setTeamSize(2)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.teamMembers]
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setFormData({ ...formData, teamMembers: updatedMembers })
  }

  const handleTeamSizeChange = (size: string) => {
    const newSize = Number.parseInt(size)
    setTeamSize(newSize)

    const newMembers = [...formData.teamMembers]
    if (newSize === 3 && newMembers.length === 2) {
      newMembers.push({
        name: "",
        identityNumber: "",
        identityCardUrl: "",
        email: "",
        phone: "",
        schoolInstitution: "",
        educationLevel: "Mahasiswa/i",
        kelas: "",
        semester: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
      })
    } else if (newSize === 2 && newMembers.length === 3) {
      newMembers.pop()
    }
    setFormData({ ...formData, teamMembers: newMembers })
  }

  const handleRegisterCompetition = (competition: Competition) => {
    setSelectedCompetition(competition)
    setFormData({
      ...formData,
      school: userProfile?.school_institution || "",
    })
    setShowForm(true)
  }

  const getCompetitionIcon = (code: string) => {
    switch (code) {
      case "OSP":
        return Trophy
      case "EGK":
        return BookOpen
      case "SCC":
        return Lightbulb
      default:
        return Trophy
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Disetujui</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pendaftaran Kompetisi</h1>
            <p className="text-gray-600">Daftar kompetisi UISO 2025 sesuai jenjang pendidikan Anda</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Jenjang: {userProfile?.education_level}
          </Badge>
        </div>

        <Tabs defaultValue="competitions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="competitions">Kompetisi Tersedia</TabsTrigger>
            <TabsTrigger value="registrations">Pendaftaran Saya</TabsTrigger>
          </TabsList>

          <TabsContent value="competitions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition) => {
                const IconComponent = getCompetitionIcon(competition.code)
                const isRegistered = registrations.some((reg) => reg.competition_id === competition.id)
                const hasActiveRegistration =
                userProfile?.education_level === "Mahasiswa/i" &&
                registrations.some(
                  (reg) => reg.status === "pending" || reg.status === "approved"
                )
                  const disabled =
                isRegistered || hasActiveRegistration

                return (
                  <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg leading-tight">{competition.name}</CardTitle>
                            <CardDescription className="text-sm">{competition.target_level}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="default">Buka</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{competition.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Trophy className="h-4 w-4" />
                          {competition.participant_type} • Max {competition.max_team_members}{" "}
                          {competition.max_team_members === 1 ? "peserta" : "anggota"}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        disabled={disabled}
                        onClick={() => handleRegisterCompetition(competition)}
                      >
                        {isRegistered
                          ? "Sudah Terdaftar"
                          : hasActiveRegistration
                          ? "Sudah Mendaftar Lomba Lain"
                          : "Daftar"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pendaftaran Anda</CardTitle>
                <CardDescription>Daftar kompetisi yang telah Anda daftarkan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kompetisi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.competitions.name}</TableCell>
                        <TableCell>{registration.competitions.participant_type}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{new Date(registration.created_at).toLocaleDateString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showForm && selectedCompetition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Pendaftaran Kompetisi</CardTitle>
                <CardDescription>Lengkapi form berikut untuk mendaftar {selectedCompetition.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kompetisi</Label>
                      <Input value={selectedCompetition.name} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={userProfile?.email || ""} disabled className="bg-gray-50" />
                      <p className="text-xs text-gray-500">Email dari akun terdaftar</p>
                    </div>
                  </div>

                  {selectedCompetition.participant_type === "Team" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Nama Tim</Label>
                        <Input
                          id="teamName"
                          value={formData.teamName}
                          onChange={(e) => handleInputChange("teamName", e.target.value)}
                          placeholder="Masukkan nama tim"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jumlah Anggota Tim</Label>
                        <Select value={teamSize.toString()} onValueChange={handleTeamSizeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jumlah anggota" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Orang</SelectItem>
                            <SelectItem value="3">3 Orang</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedCompetition.participant_type === "Team" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Data Anggota Tim</h3>
                      {formData.teamMembers.slice(0, teamSize).map((member, index) => (
                        <Card key={index} className="p-4">
                          <h4 className="font-medium mb-4">Anggota {index + 1}</h4>

                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-sm text-gray-700">Informasi Dasar</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                                  placeholder="Nama lengkap anggota"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                                  placeholder="email@example.com"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Nomor Identitas</Label>
                                <Input
                                  value={member.identityNumber}
                                  onChange={(e) => handleTeamMemberChange(index, "identityNumber", e.target.value)}
                                  placeholder="NISN/NIM/NPM"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>No. HP</Label>
                                <Input
                                  value={member.phone}
                                  onChange={(e) => handleTeamMemberChange(index, "phone", e.target.value)}
                                  placeholder="08123456789"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Academic Information */}
                          <div className="space-y-4 mt-6">
                            <h5 className="font-medium text-sm text-gray-700">Informasi Akademik</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Asal Universitas/Institusi</Label>
                                <Input
                                  value={member.schoolInstitution}
                                  onChange={(e) => handleTeamMemberChange(index, "schoolInstitution", e.target.value)}
                                  placeholder="Nama universitas/institusi"
                                  required
                                />
                              </div>
                              {/* {member.educationLevel === "Mahasiswa/i" && ( */}
                                <div className="space-y-2">
                                  <Label>Semester</Label>
                                  <Input
                                    type="number"
                                    value={member.semester}
                                    onChange={(e) => handleTeamMemberChange(index, "semester", e.target.value)}
                                    placeholder="Contoh: 3"
                                    required
                                  />
                                </div>
                              {/* )} */}
                            </div>
                          </div>

                          {/* Personal Information */}
                          <div className="space-y-4 mt-6">
                            <h5 className="font-medium text-sm text-gray-700">Informasi Pribadi</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tempat Lahir</Label>
                                <Input
                                  value={member.tempatLahir}
                                  onChange={(e) => handleTeamMemberChange(index, "tempatLahir", e.target.value)}
                                  placeholder="Contoh: Jakarta"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Tanggal Lahir</Label>
                                <Input
                                  type="date"
                                  value={member.tanggalLahir}
                                  onChange={(e) => handleTeamMemberChange(index, "tanggalLahir", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Jenis Kelamin</Label>
                                <Select
                                  value={member.jenisKelamin}
                                  onValueChange={(value) => handleTeamMemberChange(index, "jenisKelamin", value)}
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
                              <div className="space-y-2 md:col-span-2">
                                <Label>Alamat Domisili</Label>
                                <Textarea
                                  value={member.alamat}
                                  onChange={(e) => handleTeamMemberChange(index, "alamat", e.target.value)}
                                  placeholder="Masukkan alamat lengkap"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6">
                            <FileUpload
                              label={`Kartu Identitas (KTM) dan Pas Foto Anggota ${index + 1} di satukan/merge (PDF)`}
                              onUpload={(url) => handleTeamMemberChange(index, "identityCardUrl", url)}
                              value={member.identityCardUrl}
                              required
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Upload Berkas</h3>
                  {selectedCompetition?.code === 'SCC' && (
                    <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2">
                        Berkas Pendaftaran Tim (Study Case Competition)
                      </h4>
                      <p className="text-xs text-amber-800 mb-3">
                        Semua berkas berikut wajib dikumpulkan dalam format PDF sesuai dengan nama file yang ditentukan.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                        <li>Bukti mengikuti akun Instagram @uiso.2025.</li>
                        <li>Bukti repost postingan lomba Study Case di Instastory (akun asli, 24 jam).</li>
                        <li>Bukti unggah Twibbon UISO 2025 di akun Instagram pribadi.</li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="text-sm font-bold text-red-700">
                          Catatan Penting:
                          </p>
                          <p className="text-sm text-red-600">
                          Satukan file dari semua anggota tim (Ketua dan Anggota) ke dalam <strong>satu file PDF</strong>
                          </p>
                      </div>
                    </div> )}

                    {selectedCompetition.participant_type === "Individual" && (
                      <FileUpload
                        label="Kartu Identitas"
                        description="Upload Kartu Pelajar (SMA)  |  KTM/Surat Keterangan Mahasiswa (Mahasiswa)"
                        onUpload={(url) => handleInputChange("identityCardUrl", url)}
                        value={formData.identityCardUrl}
                        required
                      />
                    )}

                      <FileUpload
                        label="Upload Berkas"
                        description="Upload bukti unggah twibbon, bukti mengikuti akun Instagram @uiso.2025,  dll (Sesuai Booklet Lomba yang didaftar)"
                        onUpload={(url) => handleInputChange("engagementProofUrl", url)}
                        value={formData.engagementProofUrl}
                        required
                      />
                      <div style={{ marginTop: '5px' }}>
                        <a href="https://www.instagram.com/uiso.2025" target="_blank" rel="noopener noreferrer">
                          Kunjungi akun Instagram @uiso.2025 di sini
                        </a>
                      </div>

                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg mb-2">
                        <p className="text-sm font-medium text-blue-900">Informasi Rekening:</p>
                        
                        <p className="text-sm text-blue-800 font-semibold mt-2">Olimpiade Sains Pelajar (OSP)</p>
                        <p className="text-sm text-blue-800">Bank Jago</p>
                        <p className="text-sm text-blue-800">No. Rekening: 103632691747</p>
                        <p className="text-sm text-blue-800">Atas Nama: Gloria Nova Angelina Siahaan</p>

                        <p className="text-sm text-blue-800 font-semibold mt-2"> Study Case Competition (SCC)</p>
                        <p className="text-sm text-blue-800">Bank Jago</p>
                        <p className="text-sm text-blue-800">No. Rekening: 105806823645</p>
                        <p className="text-sm text-blue-800">Atas Nama: Gloria Nova Angelina Siahaan</p>

                        <p className="text-sm text-blue-800 font-semibold mt-2">Esai Gagasan Kritis (EGK)</p>
                        <p className="text-sm text-blue-800">Bank Jago</p>
                        <p className="text-sm text-blue-800">No. Rekening: 107659308786</p>
                        <p className="text-sm text-blue-800">Atas Nama: Gloria Nova Angelina Siahaan</p>

                        <p className="text-sm text-blue-900 mt-3 font-semibold">Biaya Pendaftaran (Early Bird):</p>
                        <p className="text-sm font-bold text-green-700">
                          SMA: <span className="bg-green-100 px-2 py-0.5 rounded">Rp50.000,-</span>
                        </p>
                        <p className="text-sm font-bold text-green-700">
                          Mahasiswa: <span className="bg-green-100 px-2 py-0.5 rounded">Rp60.000,-</span>
                        </p>
                      </div>
                      <FileUpload
                        label="Bukti Pembayaran"
                        onUpload={(url) => handleInputChange("paymentProofUrl", url)}
                        value={formData.paymentProofUrl}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? "Mendaftar..." : "Daftar Kompetisi"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
