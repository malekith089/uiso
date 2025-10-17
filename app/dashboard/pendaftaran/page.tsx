"use client"

import type React from "react";

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
import { Trophy, BookOpen, Lightbulb, AlertTriangle, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FileUploadOptimized as FileUpload } from "@/components/ui/file-upload-optimized"
import { showErrorToast, showSuccessToast, withRetry } from "@/lib/error-handler"
import { ErrorBoundary } from "@/components/error-boundary"
import { useRouter } from 'next/navigation';

// ... (Interface Competition, Registration, TeamMember, CompetitionSubject tetap sama)

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
  selected_subject_id?: string
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

interface CompetitionSubject {
  id: string
  name: string
  code: string
  description: string
}

export default function PendaftaranPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [teamSize, setTeamSize] = useState<number>(2)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false)

  const [ospSubjects, setOspSubjects] = useState<CompetitionSubject[]>([
    { id: '1', name: 'Matematika', code: 'MAT', description: 'Olimpiade Matematika' },
    { id: '2', name: 'Fisika', code: 'FIS', description: 'Olimpiade Fisika' },
    { id: '3', name: 'Kimia', code: 'KIM', description: 'Olimpiade Kimia' },
    { id: '4', name: 'Biologi', code: 'BIO', description: 'Olimpiade Biologi' },
    { id: '5', name: 'Geografi', code: 'GEO', description: 'Olimpiade Geografi' },
    { id: '6', name: 'Kebumian', code: 'BUM', description: 'Olimpiade Kebumian' }
  ])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null)
  const router = useRouter();

  // --- PERUBAHAN DI SINI ---
  useEffect(() => {
    // Tentukan tanggal dan waktu penutupan pendaftaran di sini
    // Format: YYYY-MM-DDTHH:mm:ss
    const REGISTRATION_DEADLINE = new Date('2025-10-14T23:59:59');

    const checkRegistrationDeadline = () => {
      const now = new Date();
      if (now > REGISTRATION_DEADLINE) {
        setIsRegistrationClosed(true);
      } else {
        setIsRegistrationClosed(false);
      }
    };

    checkRegistrationDeadline();
    // Set interval untuk memeriksa setiap menit, berguna jika pengguna membiarkan tab terbuka
    const interval = setInterval(checkRegistrationDeadline, 60000); 

    return () => clearInterval(interval);
  }, []);
  // --- AKHIR PERUBAHAN ---

  const copyTwibbonCaption = async () => {
    const userName = userProfile?.full_name || '[Nama]'
    const userInstitution = userProfile?.school_institution || '[Sekolah/Universitas]'
    
    const caption = `Halo, Olympiads!
Perkenalkan, saya ${userName} dari ${userInstitution}.
Bergabung dalam UI Science Olympiad 2025 bukan hanya soal kompetisi, tetapi juga wadah untuk mengasah kemampuan, menyalurkan ide, serta menunjukkan kepedulian terhadap isu lingkungan.

Melalui ajang ini, saya ingin berkontribusi dengan langkah kecil yang bermakna, sekaligus membuktikan bahwa generasi muda mampu menghadirkan solusi progresif bagi masa depan.

Tahun ini, UISO hadir dengan tema:
"Langkah Kecil untuk Dunia yang Berseri"

UISO 2025 menghadirkan berbagai cabang kompetisi menarik, antara lain:
- Olimpiade Matematika
- Olimpiade Fisika
- Olimpiade Kimia
- Olimpiade Biologi
- Olimpiade Geografi
- Olimpiade Kebumian
- Esai Gagasan Kreatif
- Study Case Competition
Dengan total hadiah Rp 70.500.000,00 menantimu!

Ikuti perjalanan UISO 2025 dan mari bersama-sama mewujudkan semangat Satu Aksi Sejuta Prestasi.
Pendaftaran dapat diakses melalui: uiso.net

Pantau media sosial kami untuk informasi lebih lanjut:
Instagram: @uiso.2025
TikTok: @uiso.2025
X: @uiso_2025
LinkedIn: @ui science olympiads
Youtube: @uiso.2025

Narahubung:
Amirah (081808833176 / LINE: amirahjalwairdina_)
Moza (082286880294 / LINE: mz1924)

UISO 2025
Langkah Kecil untuk Dunia yang Berseri
#SatuAksiSejutaPrestasi

Departemen Keilmuan
BEM FMIPA UI 2025
Semarakkan Perjuangan Biru Hitam
#MenyalakanSemarakKeilmuan`

    try {
      await navigator.clipboard.writeText(caption)
      showSuccessToast("Caption berhasil disalin ke clipboard!")
    } catch (error) {
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = caption
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showSuccessToast("Caption berhasil disalin!")
    }
  }

  const [formData, setFormData] = useState({
    teamName: "",
    school: "",
    coach: "",
    phone: "",
    identityCardUrl: "",
    engagementProofUrl: "",
    selectedOspSubject:"",
    paymentProofUrl: "",
    teamMembers: [
      {
        name: "",
        identityNumber: "",
        identityCardUrl: "",
        email: "",
        phone: "",
        schoolInstitution: "",
        educationLevel: "Mahasiswa/i", // Tetap
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
        educationLevel: "Mahasiswa/i", // <-- PERUBAHAN DI SINI
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

        if (profile) {
            const requiredFields = [
                "full_name", "school_institution", "identity_number", "phone",
                "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "alamat",
            ];
            const isComplete = requiredFields.every((field) => profile[field]);
            if (!isComplete) {
                showErrorToast(new Error("Harap lengkapi profil Anda terlebih dahulu untuk dapat mendaftar kompetisi."), "Profil Belum Lengkap");
                router.push("/dashboard/profile");
            }
        } else {
            showErrorToast(new Error("Profil tidak ditemukan. Silakan lengkapi profil Anda."), "Profil Tidak Ditemukan");
            router.push("/dashboard/profile");
        }
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

    const validateForm = () => {
    const errors: string[] = [];

    if (selectedCompetition?.code === "OSP" && !formData.selectedOspSubject) {
      errors.push("Bidang lomba OSP wajib dipilih");
    }

    // Validasi untuk kompetisi tim
    if (selectedCompetition?.participant_type === "Team") {
      if (!formData.teamName.trim()) {
        errors.push("Nama tim wajib diisi");
      }

      // Validasi setiap anggota tim
      const activeMembers = formData.teamMembers.slice(0, teamSize);
      activeMembers.forEach((member, index) => {
        const memberNum = index + 1;
        
        if (!member.name.trim()) {
          errors.push(`Nama lengkap anggota ${memberNum} wajib diisi`);
        }
        if (!member.email.trim()) {
          errors.push(`Email anggota ${memberNum} wajib diisi`);
        }
        if (!member.identityNumber.trim()) {
          errors.push(`Nomor identitas anggota ${memberNum} wajib diisi`);
        }
        if (!member.phone.trim()) {
          errors.push(`Nomor HP anggota ${memberNum} wajib diisi`);
        }
        if (!member.schoolInstitution.trim()) {
          errors.push(`Asal institusi anggota ${memberNum} wajib diisi`);
        }
        if (!member.semester.trim()) {
          errors.push(`Semester anggota ${memberNum} wajib diisi`);
        }
        if (!member.tempatLahir.trim()) {
          errors.push(`Tempat lahir anggota ${memberNum} wajib diisi`);
        }
        if (!member.tanggalLahir) {
          errors.push(`Tanggal lahir anggota ${memberNum} wajib diisi`);
        }
        if (!member.jenisKelamin) {
          errors.push(`Jenis kelamin anggota ${memberNum} wajib diisi`);
        }
        if (!member.alamat.trim()) {
          errors.push(`Alamat anggota ${memberNum} wajib diisi`);
        }
        if (!member.identityCardUrl) {
          errors.push(`Kartu identitas dan pas foto anggota ${memberNum} wajib diupload`);
        }
      });
    }

    // Validasi file upload
    if (selectedCompetition?.participant_type === "Individual" && !formData.identityCardUrl) {
      errors.push("Kartu identitas wajib diupload");
    }
    
    if (!formData.engagementProofUrl) {
      errors.push("Berkas wajib diupload");
    }
    
    if (!formData.paymentProofUrl) {
      errors.push("Bukti pembayaran wajib diupload");
    }

    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedCompetition || !userProfile) return;

  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors.join("\n");
    showErrorToast(new Error(errorMessage), "Validasi Gagal");
    return;
  }

  setIsLoading(true);
  let createdRegistrationId: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Langkah 1: Masukkan data registrasi
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert({
        user_id: user.id,
        competition_id: selectedCompetition.id,
        team_name:
          selectedCompetition.participant_type === "Team"
            ? formData.teamName
            : null,
        team_size:
          selectedCompetition.participant_type === "Team" ? teamSize : 1,
        identity_card_url: formData.identityCardUrl,
        engagement_proof_url: formData.engagementProofUrl,
        payment_proof_url: formData.paymentProofUrl,
        selected_subject_id:
          selectedCompetition.code === "OSP"
            ? formData.selectedOspSubject
            : null,
        status: "pending",
      })
      .select()
      .single();

    if (regError) {
      if (regError.code === "23505") {
        throw new Error(
          "Anda sudah terdaftar di kompetisi lain yang aktif."
        );
      }
      throw regError;
    }

    if (!registration) {
      throw new Error("Gagal membuat data registrasi.");
    }
    
    createdRegistrationId = registration.id; // Simpan ID registrasi

    // Langkah 2: Jika registrasi berhasil, masukkan data anggota tim
    if (selectedCompetition.participant_type === "Team") {
      const teamMembersData = formData.teamMembers
        .slice(0, teamSize)
        .map((member, index) => ({
          registration_id: registration.id,
          full_name: member.name,
          identity_number: member.identityNumber,
          identity_card_url: member.identityCardUrl,
          email: member.email,
          phone: member.phone,
          school_institution: member.schoolInstitution,
          education_level: "Mahasiswa/i", // Pastikan nilai ini valid
          kelas: member.kelas,
          semester: member.semester ? parseInt(member.semester, 10) : null,
          tempat_lahir: member.tempatLahir,
          tanggal_lahir: member.tanggalLahir || null,
          jenis_kelamin: member.jenisKelamin,
          alamat: member.alamat,
          member_order: index + 1,
        }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(teamMembersData);

      if (membersError) {
        // Beri pesan error spesifik untuk anggota tim
        throw new Error(`Gagal menyimpan data anggota tim: ${membersError.message}`);
      }
    }

    showSuccessToast("Pendaftaran berhasil! Menunggu persetujuan admin.");
    setShowForm(false);
    setSelectedCompetition(null);
    resetForm();
    fetchRegistrations();
  } catch (error) {
     // Jika terjadi error SETELAH registrasi dibuat, hapus registrasi tersebut
    if (createdRegistrationId) {
      console.log(`Mencoba menghapus registrasi gagal dengan ID: ${createdRegistrationId}`);
      await supabase.from("registrations").delete().eq("id", createdRegistrationId);
    }
    showErrorToast(error, "handleSubmit");
  } finally {
    setIsLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      teamName: "",
      school: "",
      coach: "",
      phone: "",
      identityCardUrl: "",
      engagementProofUrl: "",
      paymentProofUrl: "",
      selectedOspSubject: "",
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

const handleSubjectSelection = async (registrationId: string, subjectId: string) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ selected_subject_id: subjectId })
      .eq('id', registrationId)

    if (error) throw error

    showSuccessToast('Bidang kompetisi berhasil dipilih!')
    setShowSubjectModal(false)
    setSelectedSubject('')
    setCurrentRegistration(null)
    fetchRegistrations()
  } catch (error) {
    showErrorToast(error, 'handleSubjectSelection')
  }
}

const openSubjectSelection = (registration: Registration) => {
  setCurrentRegistration(registration)
  setSelectedSubject(registration.selected_subject_id || '')
  setShowSubjectModal(true)
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
            {isRegistrationClosed ? (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                            <CardTitle className="text-yellow-900">Pendaftaran Ditutup</CardTitle>
                            <CardDescription className="text-yellow-800">
                                Mohon maaf, periode pendaftaran Batch 2 untuk semua kompetisi telah berakhir.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                  ) : (  
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Info className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-blue-900">Extended Registration is Open!</CardTitle>
                      <CardDescription className="text-blue-800">
                        Pendaftaran diperpanjang sampai 3 hari kedepan. Segera daftar!
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card> )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition) => {
                const IconComponent = getCompetitionIcon(competition.code)
                const isRegistered = registrations.some((reg) => reg.competition_id === competition.id)
                const hasActiveRegistration =
                userProfile?.education_level === "Mahasiswa/i" &&
                registrations.some(
                  (reg) => reg.status === "pending" || reg.status === "approved"
                )
                  const disabled = isRegistered || hasActiveRegistration || isRegistrationClosed;

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
                        <Badge variant={isRegistrationClosed ? "destructive" : "default"}>
                            {isRegistrationClosed ? "Tutup" : "Buka"}
                        </Badge>
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

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          disabled={disabled}
                          onClick={() => handleRegisterCompetition(competition)}
                        >
                          {isRegistrationClosed 
                              ? "Pendaftaran Ditutup" 
                              : isRegistered
                            ? "Sudah Terdaftar"
                            : hasActiveRegistration
                            ? "Sudah Mendaftar Lomba Lain"
                            : "Daftar"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://bit.ly/BookletLombaUISO2025', '_blank')}
                          className="px-3 shrink-0"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
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
                      {(userProfile?.education_level === 'SMA' || registrations.some(reg => reg.competitions.code === 'OSP')) && (
                        <TableHead>Bidang Kompetisi</TableHead>
                      )}
                      <TableHead>Tanggal Daftar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{registration.competitions.name}</TableCell>
                      <TableCell>{registration.competitions.participant_type}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      {(userProfile?.education_level === 'SMA' || registrations.some(reg => reg.competitions.code === 'OSP')) && (
                        <TableCell>
                          {registration.competitions.code === 'OSP' ? (
                            <div className="space-y-2">
                              {registration.selected_subject_id ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                  {ospSubjects.find(s => s.id === registration.selected_subject_id)?.name || 'Belum dipilih'}
                                </Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => openSubjectSelection(registration)}
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  Pilih Bidang
                                </Button>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      )}
                      
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

                  {selectedCompetition.code === 'OSP' && (
                    <div className="space-y-2">
                      <Label>Bidang Lomba</Label>
                      <Select
                        value={formData.selectedOspSubject}
                        onValueChange={(value) => handleInputChange("selectedOspSubject", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bidang lomba OSP" />
                        </SelectTrigger>
                        <SelectContent>
                          {ospSubjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Tanggal Lahir</Label>
                                <Input
                                  type="date"
                                  value={member.tanggalLahir}
                                  onChange={(e) => handleTeamMemberChange(index, "tanggalLahir", e.target.value)}
                                  required
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
                                  required
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
                      <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Follow Instagram</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <a 
                              href="https://www.instagram.com/uiso.2025" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              Follow @uiso.2025
                            </a>
                            
                            <button 
                              type="button"
                              onClick={() => {
                                const twibbonUrl = 'https://bingkai.in/uiso2025'
                                const link = document.createElement('a')
                                link.href = twibbonUrl
                                link.download = 'Twibbon-UISO-2025.png'
                                link.target = '_blank'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Twibbon
                            </button>

                            <button 
                              type="button"
                              onClick={copyTwibbonCaption}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Caption Twibbon
                            </button>
                            
                            <button 
                              type="button"
                              onClick={() => {
                                let bookletUrl = ''
                                
                                switch (selectedCompetition?.code) {
                                  case 'OSP':
                                    bookletUrl = 'https://drive.google.com/drive/folders/1ViMxUnQdPiabSu1iWKvbrt055eN7VjOK'
                                    break
                                  case 'SCC':
                                    bookletUrl = 'https://drive.google.com/drive/folders/10rOvoPmVVeZuInyi4xKRJ2fahZhRXT97'
                                    break
                                  case 'EGK':
                                    bookletUrl = 'https://drive.google.com/drive/folders/1-JbziyV3mDmUpW0Uip8E8taGy2OQkHrT'
                                    break
                                  default:
                                    bookletUrl = 'https://drive.google.com/drive/folders/1M7nzJkABn4ItxlcrBuhgZcfZAOx40GH0?usp=sharing'
                                }
                                
                                const link = document.createElement('a')
                                link.href = bookletUrl
                                link.download = `Booklet-${selectedCompetition?.code || 'UISO'}-2025.pdf`
                                link.target = '_blank'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Booklet ({selectedCompetition?.code || 'UISO'})
                            </button>
                          </div>
                        </div>
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

                        <p className="text-sm text-blue-900 mt-3 font-semibold">Biaya Pendaftaran (Extended):</p>
                        <p className="text-sm font-bold text-green-700">
                          SMA: <span className="bg-green-100 px-2 py-0.5 rounded">Rp100.000,-</span>
                        </p>
                        <p className="text-sm font-bold text-green-700">
                          Mahasiswa: <span className="bg-green-100 px-2 py-0.5 rounded">Rp125.000,-</span>
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
{showSubjectModal && currentRegistration && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Pilih Bidang Kompetisi</CardTitle>
        <CardDescription>
          Pilih bidang untuk {currentRegistration.competitions.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                Perhatian: Pilihan Tidak Dapat Diubah
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                Setelah Anda memilih bidang kompetisi, pilihan tersebut <strong>tidak dapat diubah lagi</strong>. 
                Pastikan Anda sudah yakin dengan bidang yang akan dipilih. Pertimbangkan kemampuan dan minat Anda 
                dengan matang sebelum memutuskan.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {ospSubjects.map((subject) => (
            <label 
              key={subject.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedSubject === subject.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="subject"
                value={subject.id}
                checked={selectedSubject === subject.id}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mr-3"
              />
              <div>
                <p className="font-medium">{subject.name}</p>
                <p className="text-sm text-gray-600">{subject.description}</p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={() => {
              if (selectedSubject && currentRegistration) {
                handleSubjectSelection(currentRegistration.id, selectedSubject)
              }
            }}
            disabled={!selectedSubject}
            className="flex-1"
          >
            Simpan Pilihan
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowSubjectModal(false)
              setSelectedSubject('')
              setCurrentRegistration(null)
            }}
          >
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}
    </ErrorBoundary>
  )
}