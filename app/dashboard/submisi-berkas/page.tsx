"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileUploadDeferred } from "@/components/ui/file-upload-deferred"
import { DeadlineCountdown } from "@/components/ui/deadline-countdown"
import { createClient } from "@/lib/supabase/client"
import { showSuccessToast, showErrorToast } from "@/lib/error-handler"
import { useUserProfile, useRegistrations } from "@/hooks/use-dashboard-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { id } from 'date-fns/locale'; // Untuk format tanggal Indonesia
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertCircle } from "lucide-react"

interface SubmissionData {
  registration_id: string
  preliminary_file_url: string
  final_file_url: string
  submitted_at: string
}

export default function SubmisiBerakasPage() {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile()
  const { data: registrations = [], isLoading: registrationsLoading } = useRegistrations()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [preliminaryFile, setPreliminaryFile] = useState<File | null>(null)
  const [finalFile, setFinalFile] = useState<File | null>(null)

  // Store uploaded URLs after submission
  const [preliminaryUrl, setPreliminaryUrl] = useState("")
  const [finalUrl, setFinalUrl] = useState("")
  const [isQualifiedForFinal, setIsQualifiedForFinal] = useState<boolean | null>(null)
  const [submissionStage, setSubmissionStage] = useState<"preliminary" | "final" | null>(null)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]); // Ganti 'any' dengan tipe data spesifik
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [deadlinePreliminary, setDeadlinePreliminary] = useState<string | null>(null)
  const [deadlineFinal, setDeadlineFinal] = useState<string | null>(null)
  const [isDeadlineExpired, setIsDeadlineExpired] = useState(false)
  const sanitizeForPath = (str: string | null | undefined): string => {
  if (!str) {
    // Fallback jika data tidak ada
    return "data_tidak_lengkap"; 
  }
  
  return str
    .toLowerCase()
    .replace(/\s+/g, "_") // Ganti spasi (atau banyak spasi) dengan satu underscore
    .replace(/[^a-z0-9_.-]/g, ""); // Hapus semua karakter kecuali huruf, angka, _, ., -
};

  const approvedRegistration = registrations.find(
    (reg: any) => reg.status === "approved" && (reg.competitions.code === "SCC" || reg.competitions.code === "EGK"),
  )

  useEffect(() => {
    if (!approvedRegistration) {
      return
    }

    // Fetch deadline untuk SCC atau EGK
    const competitionCode = approvedRegistration.competitions.code;
    if (competitionCode !== "SCC" && competitionCode !== "EGK") {
      return
    }

    const fetchDeadlines = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("competitions")
          .select("deadline_preliminary, deadline_final")
          .eq("code", competitionCode)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setDeadlinePreliminary(data.deadline_preliminary)
          setDeadlineFinal(data.deadline_final)
        }
      } catch (error) {
        console.error("Error fetching deadlines:", error)
      }
    }

    fetchDeadlines()
  }, [approvedRegistration])

  useEffect(() => {
    if (!approvedRegistration || approvedRegistration.competitions.code !== "SCC") {
      return
    }

    const fetchDeadlines = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("competitions")
          .select("deadline_preliminary, deadline_final")
          .eq("code", "SCC")
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setDeadlinePreliminary(data.deadline_preliminary)
          setDeadlineFinal(data.deadline_final)
        }
      } catch (error) {
        console.error("Error fetching deadlines:", error)
      }
    }

    fetchDeadlines()
  }, [approvedRegistration])

  useEffect(() => {
    const fetchSubmissionHistory = async () => {
        if (!approvedRegistration) return; 

        setIsLoadingHistory(true);
        try {
            const supabase = createClient();
            // Catatan: Logic submit Anda saat ini menggunakan 'upsert'
            // yang berarti hanya akan ada 1 baris data (status terakhir).
            // Kode ini akan tetap menampilkannya dalam tabel.
            const { data, error } = await supabase
                .from('submissions_lomba')
                .select(`
                    submitted_at,
                    updated_at,
                    preliminary_file_url,
                    final_file_url,
                    is_qualified_for_final
                `)
                .eq('registration_id', approvedRegistration.id)
                .order('updated_at', { ascending: false }); // Urutkan berdasarkan update terbaru

            if (error) throw error;
            setSubmissionHistory(data || []); // data akan berupa array [ { ... } ]

        } catch (error: any) {
            showErrorToast(error, "Gagal memuat history submisi");
            setSubmissionHistory([]); 
        } finally {
            setIsLoadingHistory(false);
        }
    };

    fetchSubmissionHistory();
  }, [approvedRegistration, isSubmitting]);

  const getCurrentDeadline = () => {
    if (submissionStage === "preliminary" && deadlinePreliminary) {
      return deadlinePreliminary
    }
    if (submissionStage === "final" && deadlineFinal) {
      return deadlineFinal
    }
    return null
  }

  const currentDeadline = getCurrentDeadline()

  useEffect(() => {
    if (!approvedRegistration || approvedRegistration.competitions.code !== "SCC") {
      return
    }

    const fetchExistingSubmission = async () => {
      try {
        setIsFetching(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from("submissions_lomba")
          .select("*")
          .eq("registration_id", approvedRegistration.id)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setPreliminaryUrl(data.preliminary_file_url || "")
          setFinalUrl(data.final_file_url || "")
          setIsQualifiedForFinal(data.is_qualified_for_final)
          setSubmittedAt(data.submitted_at)

          if (data.is_qualified_for_final === true) {
              setSubmissionStage("final")
            } else {
              // Ini akan mencakup 'false' dan 'null'
              setSubmissionStage("preliminary")
            }
        } else {
          setSubmissionStage("preliminary")
        }
      } catch (error) {
        console.error("Error fetching existing submission:", error)
        showErrorToast(error, "Fetch Submission")
      } finally {
        setIsFetching(false)
      }
    }

    fetchExistingSubmission()
  }, [approvedRegistration])

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)
    formData.append("filename", file.name)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    const data = await response.json()
    return data.secure_url || data.url
  }

  const handleSubmitSCC = useCallback(async () => {
  if (!approvedRegistration) return

  if (submissionStage === "preliminary" && !preliminaryFile) return
  if (submissionStage === "final" && !finalFile) return

  try {
    setIsSubmitting(true)
    setIsUploading(true)
    setUploadProgress(0)

    // 1. Ambil data nama dan sekolah (GANTI PROPERTI JIKA PERLU)
      const leaderName = userProfile.full_name;
      const schoolName = userProfile.school_institution;

      // 2. Buat nama folder kustom yang sudah bersih
      const customFolderName = `${sanitizeForPath(leaderName)}_${sanitizeForPath(schoolName)}`;

    let newPreliminaryUrl = preliminaryUrl
    let newFinalUrl = finalUrl

    if (submissionStage === "preliminary" && preliminaryFile) {
      setUploadProgress(50)
        const fullPath = `scc-submissions/preliminary/${customFolderName}`
        newPreliminaryUrl = await uploadFile(preliminaryFile, fullPath)
      }

    if (submissionStage === "final" && finalFile) {
      setUploadProgress(50)
        const fullPath = `scc-submissions/final/${customFolderName}`
        newFinalUrl = await uploadFile(finalFile, fullPath)
      }

    setUploadProgress(75)

    const supabase = createClient()
    const now = new Date().toISOString()
    
    // FIXED: Buat object submissionData dengan struktur yang benar
    const submissionData: any = {
      registration_id: approvedRegistration.id,
      preliminary_file_url: newPreliminaryUrl,
      final_file_url: newFinalUrl,
      updated_at: now,
    }

    // FIXED: Hanya update submitted_at jika ini submission pertama kali
    // atau jika belum ada submitted_at sebelumnya
    const { data: existingSubmission } = await supabase
      .from("submissions_lomba")
      .select("submitted_at")
      .eq("registration_id", approvedRegistration.id)
      .single()

    if (!existingSubmission || !existingSubmission.submitted_at) {
      submissionData.submitted_at = now
    }

    const { error } = await supabase
      .from("submissions_lomba")
      .upsert(submissionData, {
        onConflict: "registration_id",
      })

    if (error) {
      throw error
    }

    setUploadProgress(100)

    if (submissionStage === "preliminary") {
      showSuccessToast("Berkas penyisihan berhasil disubmit. Tunggu pengumuman hasil penyisihan!")
    } else {
      showSuccessToast("Berkas final berhasil disubmit. Terima kasih atas partisipasi Anda!")
    }

    setPreliminaryFile(null)
    setFinalFile(null)

    if (submissionStage === "preliminary") {
      setPreliminaryUrl(newPreliminaryUrl)
    } else {
      setFinalUrl(newFinalUrl)
    }

    // Update submittedAt state
    if (submissionData.submitted_at) {
      setSubmittedAt(submissionData.submitted_at)
    }

  } catch (error) {
    console.error("Error submitting files:", error)
    showErrorToast(error, "Submit Submission")
  } finally {
    setIsSubmitting(false)
    setIsUploading(false)
    setUploadProgress(0)
  }
}, [approvedRegistration, userProfile, preliminaryFile, finalFile, submissionStage, preliminaryUrl, finalUrl])

  if (profileLoading || registrationsLoading || isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (!approvedRegistration) {
    return (
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">Submisi Berkas Tidak Tersedia</CardTitle>
          <CardDescription className="text-yellow-800">
            Anda belum memiliki pendaftaran yang disetujui untuk lomba SCC atau EGK. Submisi berkas belum dapat
            dilakukan.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (approvedRegistration.competitions.code === "EGK") {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Submisi Lomba EGK</CardTitle>
            <CardDescription>Submisi untuk lomba EGK dilakukan melalui Google Form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deadline Card untuk EGK */}
            {deadlinePreliminary && (
              <DeadlineCountdown 
                deadline={deadlinePreliminary} 
                onExpired={() => setIsDeadlineExpired(true)} 
              />
            )}
            
            <p className="text-sm text-gray-600">
              Silakan klik tombol di bawah untuk mengakses formulir submisi EGK.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSclmdo0HYENeEQUqX5n0-u2G1mfBQpbfisBJw4R4wE-de9PPg/viewform", "_blank")} 
              className="w-full"
              disabled={isDeadlineExpired}
            >
              {isDeadlineExpired ? "Deadline Telah Berakhir" : "Menuju Google Form"}
            </Button>
          </CardFooter>
        </Card>
      </>
    )
  }

  return (
    <>
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-blue-900">📋 Mekanisme Penyisihan SCC</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none text-gray-700">
          <h4 className="font-semibold text-gray-900 mb-2">Ketentuan Pengumpulan:</h4>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Setiap peserta harus membuat dan mengirimkan <strong>abstrak solusi</strong> sesuai tema dan subtema yang dipilih.</li>
            <li>
              Periode pengumpulan: <strong>20 Oktober 2025 - 3 November 2025</strong>
              <br />
              <span className="text-red-600 font-medium">⚠️ Terdapat pengurangan nilai 1% per 1 jam keterlambatan.</span>
            </li>
            <li>
              Format abstrak solusi:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Ukuran Kertas: A4</li>
                <li>Font: Times New Roman, 12pt</li>
                <li>Spasi: 1,5pt, Paragraf: Justify</li>
                <li>Margin: Atas 3cm, Bawah 3cm, Kanan 3cm, Kiri 4cm</li>
                <li>Daftar pustaka: Spasi 1,15, format APA Style</li>
              </ul>
            </li>
            <li>
              Format nama file PDF: <br />
              <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                NamaLengkapAnggota1_NamaLengkapAnggota2_NamaLengkapAnggota3_Universitas_Abstrak_JudulAbstrak.pdf
              </code>
            </li>
            <li>Jika abstrak mengandung kutipan, <strong>wajib sertakan referensi sumber</strong> untuk menghindari plagiasi.</li>
          </ol>
        </div>
        
        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => window.open("https://bit.ly/FormatAbstrakSCCUISO2025", "_blank")}
          >
            📄 Format Abstrak (Template)
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>
          {submissionStage === "preliminary" ? "Submisi Berkas Babak Penyisihan" : "Submisi Berkas Babak Final"}
        </CardTitle>
        <CardDescription>
          {submissionStage === "preliminary"
            ? "Unggah berkas untuk babak penyisihan. File akan diupload saat Anda menekan tombol Submit."
            : "Selamat! Anda telah lolos ke babak final. Unggah berkas final Anda di sini."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentDeadline && (
          <DeadlineCountdown deadline={currentDeadline} onExpired={() => setIsDeadlineExpired(true)} />
        )}

        {submissionStage === "preliminary" && (
  <>
  {isQualifiedForFinal === false && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 font-medium">
          Mohon maaf, Anda belum lolos ke babak final.
        </p>
        <p className="text-sm text-red-700 mt-1">
          Terima kasih atas partisipasi Anda. Jangan berkecil hati dan sampai jumpa di UISO tahun depan!
        </p>
      </div>
    )}
    {preliminaryUrl && submittedAt && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          ✓ Berkas penyisihan sudah disubmit pada{" "}
          {new Date(submittedAt).toLocaleDateString("id-ID", {
            day: 'numeric',
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    )}
    <FileUploadDeferred
      label="Berkas Babak Penyisihan"
      description="Format: PDF, Maksimal: 5MB"
      accept=".pdf"
      maxSize={5}
      onFileSelect={setPreliminaryFile}
      selectedFile={preliminaryFile}
      required={!preliminaryUrl}
    />
  </>
)}

        {submissionStage === "final" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✓ Selamat! Anda telah lolos ke babak final. Silakan upload berkas final Anda.
              </p>
            </div>
            <FileUploadDeferred
              label="Berkas Babak Final"
              description="Format: PDF, Maksimal: 5MB"
              accept=".pdf"
              maxSize={5}
              onFileSelect={setFinalFile}
              selectedFile={finalFile}
              required={!finalUrl}
            />
          </>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Mengupload file... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* Tombol ini sekarang memicu Dialog. Logika disabled tetap sama. */}
            <Button
              disabled={
                // 1. Sedang submit atau deadline berakhir
                isSubmitting ||
                isDeadlineExpired ||
                
                // 2. Dinyatakan TIDAK LOLOS
                isQualifiedForFinal === false ||

                // 3. Untuk stage penyisihan: disable jika BELUM pilih file ATAU SUDAH submit
                (submissionStage === "preliminary" && (!preliminaryFile || !!preliminaryUrl)) ||
                
                // 4. Untuk stage final: disable jika BELUM pilih file ATAU SUDAH submit (jika Anda ingin final juga tidak bisa resubmit)
                // Jika final BOLEH resubmit, hapus '|| !!finalUrl' di bawah ini
                (submissionStage === "final" && (!finalFile || !!finalUrl))
              }
              className="w-full"
            >
              {isDeadlineExpired ? "Deadline Telah Berakhir" : isSubmitting ? "Mengirim..." : "Submit Berkas"}
            </Button>
          </AlertDialogTrigger>
          
          {/* Ini adalah konten Pop-up Konfirmasi */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-500" />
                  Konfirmasi Submisi Berkas
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                Pastikan file yang Anda unggah sudah benar.
                <br /><br />
                {submissionStage === "preliminary" ? (
                  <strong>
                    Submisi berkas babak penyisihan bersifat final dan tidak dapat diubah (resubmit)
                    setelah Anda menekan tombol "Submit Sekarang".
                  </strong>
                ) : (
                  <strong>
                    Submisi berkas babak final tidak dapat diubah (resubmit)
                    setelah Anda menekan tombol "Submit Sekarang".
                  </strong>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal, Cek Lagi</AlertDialogCancel>
              {/* Tombol ini yang akan benar-benar menjalankan submit */}
              <AlertDialogAction
                onClick={handleSubmitSCC}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Ya, Submit Sekarang"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
    {submissionHistory.length > 0 && (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>History Submisi Anda</CardTitle>
            <CardDescription>Riwayat pengumpulan berkas untuk {approvedRegistration?.competitions.name}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingHistory ? (
                <p>Memuat history...</p> // Atau tampilkan skeleton loading
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Submit</TableHead>
                            <TableHead>Berkas Penyisihan</TableHead>
                            <TableHead>Berkas Final</TableHead>
                            <TableHead>Status Lolos Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissionHistory.map((submission, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    {submission.submitted_at ? format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                                </TableCell>
                                <TableCell>
                                    {submission.preliminary_file_url ? (
                                        <a href={submission.preliminary_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a>
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    {submission.final_file_url ? (
                                        <a href={submission.final_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat</a>
                                    ) : '-'}
                                </TableCell>
                                 <TableCell>
                                    {submission.preliminary_file_url ? ( // Tampilkan status hanya jika penyisihan sudah submit
                                        submission.is_qualified_for_final === true ? <Badge variant="default">Lolos</Badge> :
                                        submission.is_qualified_for_final === false ? <Badge variant="destructive">Tidak Lolos</Badge> :
                                        <Badge variant="secondary">Menunggu</Badge>
                                    ) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
    </Card>
)}
</>
  )
}
