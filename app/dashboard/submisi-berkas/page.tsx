"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { AlertCircle, Star } from "lucide-react"

interface SubmissionData {
  registration_id: string
  preliminary_file_url: string
  final_file_url: string
  submitted_at: string
}

export default function SubmisiBerakasPage() {
  const { data: userProfile, isLoading: profileLoading } = useUserProfile()
  const { data: registrations = [], isLoading: registrationsLoading } = useRegistrations()

  // Tambahkan state ini setelah state yang sudah ada
  const [isEGKFinalist, setIsEGKFinalist] = useState(false)
  const [egkSubmissionStage, setEgkSubmissionStage] = useState<"preliminary" | "final" | null>(null)

  const [isAgreed, setIsAgreed] = useState(false)

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
  const [finalSubmissionStartDate, setFinalSubmissionStartDate] = useState<string | null>(null)
  const [isFinalSubmissionOpen, setIsFinalSubmissionOpen] = useState(false)
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
          .select("deadline_preliminary, deadline_final, start_time_final")
          .eq("code", competitionCode)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setDeadlinePreliminary(data.deadline_preliminary)
          setDeadlineFinal(data.deadline_final)
          setFinalSubmissionStartDate(data.start_time_final)
        }
      } catch (error) {
        console.error("Error fetching deadlines:", error)
      }
    }

    fetchDeadlines()
  }, [approvedRegistration])

  // Tambahkan useEffect ini setelah useEffect fetchDeadlines yang kedua
useEffect(() => {
  if (!approvedRegistration || approvedRegistration.competitions.code !== "EGK") {
    return
  }

  // Cek apakah user adalah finalist EGK
  if (approvedRegistration.is_finalist === true) {
    setIsEGKFinalist(true)
    setEgkSubmissionStage("final") // Langsung set ke final stage
  } else {
    setIsEGKFinalist(false)
    setEgkSubmissionStage("preliminary") // Masih di preliminary (redirect ke Google Form)
  }
}, [approvedRegistration])

// Tambahkan useEffect ini setelah useEffect yang baru saja ditambahkan
useEffect(() => {
  if (!approvedRegistration || approvedRegistration.competitions.code !== "EGK" || !isEGKFinalist) {
    return
  }

  const fetchExistingEGKSubmission = async () => {
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
        setFinalUrl(data.final_file_url || "")
        setSubmittedAt(data.submitted_at)
      }
    } catch (error) {
      console.error("Error fetching existing EGK submission:", error)
      showErrorToast(error, "Fetch EGK Submission")
    } finally {
      setIsFetching(false)
    }
  }

  fetchExistingEGKSubmission()
}, [approvedRegistration, isEGKFinalist])

  // [BARU] useEffect untuk mengecek apakah submisi final sudah dibuka
 useEffect(() => {
  // Check untuk SCC Final
  if (submissionStage === "final" && finalSubmissionStartDate) {
    const checkTime = () => {
      const now = new Date()
      const startTime = new Date(finalSubmissionStartDate)
      setIsFinalSubmissionOpen(now >= startTime)
    }

    checkTime()
    const interval = setInterval(checkTime, 1000 * 60)

    return () => clearInterval(interval)
  } 
  // Jika bukan final stage SCC, set true (agar tidak block preliminary)
  else if (submissionStage === "preliminary" || submissionStage === null) {
    setIsFinalSubmissionOpen(true)
  }
}, [submissionStage, finalSubmissionStartDate])

  useEffect(() => {
  // Check untuk EGK Finalist apakah final submission sudah dibuka
  if (isEGKFinalist && finalSubmissionStartDate) {
    const checkTime = () => {
      const now = new Date()
      const startTime = new Date(finalSubmissionStartDate)
      setIsFinalSubmissionOpen(now >= startTime)
    }

    checkTime() // Cek saat komponen dimuat
    const interval = setInterval(checkTime, 1000 * 60) // Cek ulang setiap menit

    return () => clearInterval(interval) // Bersihkan interval
  }
}, [isEGKFinalist, finalSubmissionStartDate])

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
    if (!approvedRegistration) return

    // Skip jika bukan SCC atau EGK
    const competitionCode = approvedRegistration.competitions.code
    if (competitionCode !== "SCC" && competitionCode !== "EGK") return

    setIsLoadingHistory(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
      .from('submissions_lomba')
      .select(`
        submitted_at,
        updated_at,
        preliminary_file_url,
        final_file_url,
        preliminary_filename,
        final_filename,
        is_qualified_for_final
      `)
      .eq('registration_id', approvedRegistration.id)
      .order('updated_at', { ascending: false })

      if (error) throw error
      setSubmissionHistory(data || [])

    } catch (error: any) {
      showErrorToast(error, "Gagal memuat history submisi")
      setSubmissionHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  fetchSubmissionHistory()
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
  // Sanitize dan truncate filename untuk menghindari error "public_id too long"
  const sanitizeFilename = (filename: string): string => {
    // Ambil extension
    const lastDotIndex = filename.lastIndexOf('.')
    const ext = lastDotIndex > -1 ? filename.slice(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex > -1 ? filename.slice(0, lastDotIndex) : filename
    
    // Bersihkan nama file dari karakter spesial
    let cleanName = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Ganti karakter spesial dengan underscore
      .replace(/_+/g, '_') // Ganti multiple underscore dengan single
      .replace(/^_+|_+$/g, '') // Hapus underscore di awal/akhir
    
    // Hitung panjang folder path untuk menentukan max length nama file
    const folderLength = folder.length
    const maxTotalLength = 255
    const safetyBuffer = 10 // Buffer untuk ekstensi dan separator
    const maxNameLength = Math.min(50, maxTotalLength - folderLength - safetyBuffer - ext.length)
    
    if (cleanName.length > maxNameLength) {
      cleanName = cleanName.slice(0, maxNameLength)
    }
    
    // Pastikan tidak kosong
    if (!cleanName) {
      cleanName = 'file_' + Date.now()
    }
    
    // CRITICAL: Kembalikan dengan ekstensi untuk preserve file type
    return cleanName + ext
  }
  
  const sanitizedFilename = sanitizeFilename(file.name)
  
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)
  formData.append("filename", sanitizedFilename)
  
  // TAMBAHAN: Kirim file type untuk handling di server
  formData.append("fileType", file.type)

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

    let preliminaryFilename = ""
    let finalFilename = ""

    if (submissionStage === "preliminary" && preliminaryFile) {
      setUploadProgress(50)
      const fullPath = `scc-submissions/preliminary/${customFolderName}`
      newPreliminaryUrl = await uploadFile(preliminaryFile, fullPath)
      preliminaryFilename = preliminaryFile.name // Simpan original filename
    }

    if (submissionStage === "final" && finalFile) {
      setUploadProgress(50)
      const fullPath = `scc-submissions/final/${customFolderName}`
      newFinalUrl = await uploadFile(finalFile, fullPath)
      finalFilename = finalFile.name // Simpan original filename
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

    // Simpan filename jika ada
    if (preliminaryFilename) {
      submissionData.preliminary_filename = preliminaryFilename
    }
    if (finalFilename) {
      submissionData.final_filename = finalFilename
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
    setIsAgreed(false) 

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

// Tambahkan function ini setelah handleSubmitSCC
const handleSubmitEGK = useCallback(async () => {
  if (!approvedRegistration || !isEGKFinalist || !finalFile) return

  try {
    setIsSubmitting(true)
    setIsUploading(true)
    setUploadProgress(0)

    // 1. Ambil data nama dan sekolah
    const leaderName = userProfile.full_name
    const schoolName = userProfile.school_institution

    // 2. Buat nama folder kustom yang sudah bersih
    const customFolderName = `${sanitizeForPath(leaderName)}_${sanitizeForPath(schoolName)}`

    setUploadProgress(50)

    // 3. Upload file final
    const fullPath = `egk-submissions/final/${customFolderName}`
    const newFinalUrl = await uploadFile(finalFile, fullPath)

    setUploadProgress(75)

    const supabase = createClient()
    const now = new Date().toISOString()
    
    // 4. Buat object submissionData
    const submissionData: any = {
      registration_id: approvedRegistration.id,
      final_file_url: newFinalUrl,
      updated_at: now,
    }

    // 5. Cek apakah sudah ada submission sebelumnya
    const { data: existingSubmission } = await supabase
      .from("submissions_lomba")
      .select("submitted_at")
      .eq("registration_id", approvedRegistration.id)
      .single()

    if (!existingSubmission || !existingSubmission.submitted_at) {
      submissionData.submitted_at = now
    }

    // 6. Upsert ke database
    const { error } = await supabase
      .from("submissions_lomba")
      .upsert(submissionData, {
        onConflict: "registration_id",
      })

    if (error) {
      throw error
    }

    setUploadProgress(100)

    showSuccessToast("Berkas final EGK berhasil disubmit. Terima kasih atas partisipasi Anda!")

    setFinalFile(null)
    setIsAgreed(false) 
    setFinalUrl(newFinalUrl)

    // Update submittedAt state
    if (submissionData.submitted_at) {
      setSubmittedAt(submissionData.submitted_at)
    }

  } catch (error) {
    console.error("Error submitting EGK final file:", error)
    showErrorToast(error, "Submit EGK Final")
  } finally {
    setIsSubmitting(false)
    setIsUploading(false)
    setUploadProgress(0)
  }
}, [approvedRegistration, userProfile, finalFile, isEGKFinalist])

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
    // Jika bukan finalist, tampilkan redirect ke Google Form
    if (!isEGKFinalist || egkSubmissionStage === "preliminary") {
      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Submisi Lomba EGK - Babak Penyisihan</CardTitle>
              <CardDescription>Submisi babak penyisihan untuk lomba EGK dilakukan melalui Google Form.</CardDescription>
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
                Silakan klik tombol di bawah untuk mengakses formulir submisi EGK babak penyisihan.
              </p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button 
                onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSclmdo0HYENeEQUqX5n0-u2G1mfBQpbfisBJw4R4wE-de9PPg/viewform", "_blank")} 
                className="w-full"
                disabled={isDeadlineExpired}
              >
                {isDeadlineExpired ? "Deadline Telah Berakhir" : "Menuju Google Form"}
              </Button>
              <p className="text-xs text-gray-600 text-center w-full">
                Jika tidak dapat mengakses dari tombol, buka melalui link:{" "}
                <a 
                  href="https://bit.ly/SubmisiEGKUISO2025" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  bit.ly/SubmisiEGKUISO2025
                </a>
              </p>
            </CardFooter>
          </Card>
        </>
      )
    }

    // Jika finalist, tampilkan form upload file
    // Tambahkan code ini setelah section Google Form redirect
    return (
      <>
        {/* Notifikasi Lolos Final */}
        <Card className="mb-6 border-green-500 bg-green-50 shadow-lg relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold text-green-800">
              Selamat! Anda Lolos ke Final EGK!
            </CardTitle>
            <Star className="h-8 w-8 text-green-400 rotate-12" />
          </CardHeader>
          <CardContent>
            <p className="text-base text-green-700 leading-relaxed">
              Tim Anda telah berhasil melewati babak penyisihan dan maju ke babak final EGK.
              Silakan upload berkas final Anda di bawah ini.
            </p>
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
              background: 'radial-gradient(circle at top right, var(--tw-green-200), transparent 50%)'
            }}></div>
          </CardContent>
        </Card>

        {/* Form Upload File Final EGK */}
        <Card>
          <CardHeader>
            <CardTitle>Submisi Berkas Babak Final EGK</CardTitle>
            <CardDescription>
              Unggah berkas final untuk lomba EGK. File akan diupload saat Anda menekan tombol Submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deadline Countdown */}
            {deadlineFinal && (
              <DeadlineCountdown 
                deadline={deadlineFinal} 
                onExpired={() => setIsDeadlineExpired(true)} 
              />
            )}

            {/* Pesan jika belum dibuka */}
            {finalSubmissionStartDate && !isFinalSubmissionOpen && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">
                  Submisi Babak Final Belum Dibuka
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Anda dapat mulai mengunggah berkas pada:{" "}
                  {new Date(finalSubmissionStartDate).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Status Sudah Submit */}
            {finalUrl && submittedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Berkas final sudah disubmit pada{" "}
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

            {/* File Upload Component */}
            <FileUploadDeferred
              label="Berkas Babak Final"
              description="Format: PPT/PPTX, Maksimal: 15MB"
              accept=".ppt, .pptx"
              maxSize={15}
              onFileSelect={setFinalFile}
              selectedFile={finalFile}
              required={!finalUrl}
            />

            {/* Checkbox Pernyataan */}
            <div className="border-t pt-4">
              <div className="flex items-start space-x-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <Checkbox 
                  id="agreement-egk" 
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(checked === true)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="agreement-egk" 
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    Pernyataan Orisinalitas dan Persetujuan <span className="text-red-600">*</span>
                  </Label>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Saya menyatakan bahwa data yang saya isi benar dan dapat dipertanggungjawabkan.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Saya bersedia mengikuti ketentuan yang berlaku sebagai peserta UISO 2025.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
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
            <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    isSubmitting ||
                    isDeadlineExpired ||
                    !isAgreed ||
                    !finalFile ||
                    !!finalUrl ||
                    !!(finalSubmissionStartDate && !isFinalSubmissionOpen)
                  }
                  className="w-full"
                >
                  {isDeadlineExpired ? "Deadline Telah Berakhir" : isSubmitting ? "Mengirim..." : "Submit Berkas"}
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-yellow-500" />
                      Konfirmasi Submisi Berkas Final EGK
                    </div>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-2">
                    Pastikan file yang Anda unggah sudah benar.
                    <br /><br />
                    <strong>
                      Submisi berkas babak final tidak dapat diubah (resubmit)
                      setelah Anda menekan tombol "Ya, Submit Sekarang".
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal, Cek Lagi</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmitEGK}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mengirim..." : "Ya, Submit Sekarang"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
          </CardFooter>
        </Card>
        {/* TAMBAHKAN INI: History Submission untuk EGK */}
    {submissionHistory.length > 0 && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>History Submisi Anda</CardTitle>
          <CardDescription>
            Riwayat pengumpulan berkas untuk {approvedRegistration?.competitions.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <p>Memuat history...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Submit</TableHead>
                  <TableHead>Berkas Final</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionHistory.map((submission, index) => (
                  <TableRow key={index}>
                    <TableCell className="min-w-[220px]">
                      {submission.submitted_at ? (
                        <div className="text-sm">
                          {format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: id })}
                        </div>
                      ) : (
                        submission.updated_at ? (
                          <div className="text-sm">
                            {format(new Date(submission.updated_at), 'dd MMM yyyy HH:mm', { locale: id })}
                          </div>
                        ) : '-'
                      )}
                    </TableCell>
                      <TableCell>
                        {submission.final_file_url ? (
                          <a 
                            href={submission.final_file_url} 
                            download={submission.final_filename || 'final.pptx'}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 underline"
                          >
                            Download
                          </a>
                        ) : '-'}
                      </TableCell>
                    <TableCell>
                      <Badge variant="default">Finalist</Badge>
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

  return (
    <>
    {isQualifiedForFinal === true && (
            <Card className="mb-6 border-green-500 bg-green-50 shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold text-green-800">Selamat! Anda Lolos ke Final!</CardTitle>
                    <Star className="h-8 w-8 text-green-400 rotate-12" /> {/* Ikon bintang */}
                </CardHeader>
                <CardContent>
                    <p className="text-base text-green-700 leading-relaxed">
                        Tim Anda telah berhasil melewati babak penyisihan dan maju ke babak final SCC.
                    </p>
                    {/* Opsi tambahan: Background gradasi ringan atau pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
                        background: 'radial-gradient(circle at top right, var(--tw-green-200), transparent 50%)'
                    }}></div>
                </CardContent>
            </Card>
            )}

  {/* [ENHANCED] Notifikasi "Tidak Lolos" */}
            {isQualifiedForFinal === false && (
                <Card className="mb-6 border-red-500 bg-red-50 shadow-lg relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold text-red-800">Status Babak Penyisihan</CardTitle>
                        {/* Pastikan AlertCircle sudah di-import dari lucide-react */}
                        <AlertCircle className="h-8 w-8 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-red-700 leading-relaxed">
                            Mohon maaf, tim Anda belum berhasil melanjutkan ke babak final SCC untuk tahun ini.
                        </p>
                        <p className="text-base text-red-800 font-semibold mt-3">
                            Terima kasih atas kerja keras dan partisipasi Anda. Jangan berkecil hati dan teruslah berinovasi. Sampai jumpa di UISO tahun depan!
                        </p>
                        {/* Efek visual gradasi opsional */}
                        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ 
                            background: 'radial-gradient(circle at top right, var(--tw-red-200), transparent 50%)'
                        }}></div>
                    </CardContent>
                </Card>
            )}

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

            {/* [BARU] Tampilkan pesan ini jika submisi final belum dibuka */}
            {finalSubmissionStartDate && !isFinalSubmissionOpen && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800 font-medium">
                  Submisi Babak Final Belum Dibuka
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Anda dapat mulai mengunggah berkas pada:{" "}
                  {new Date(finalSubmissionStartDate).toLocaleDateString("id-ID", {
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

        <div className="border-t pt-4">
          <div className="flex items-start space-x-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <Checkbox 
              id="agreement" 
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor="agreement" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                Pernyataan Orisinalitas dan Persetujuan <span className="text-red-600">*</span>
              </Label>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Saya menyatakan bahwa data yang saya isi benar dan dapat dipertanggungjawabkan.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Saya bersedia mengikuti ketentuan yang berlaku sebagai peserta UISO 2025.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

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

                // 2. Belum centang pernyataan
                !isAgreed ||
                
                // 3. Dinyatakan TIDAK LOLOS
                isQualifiedForFinal === false ||

                // 4. Untuk stage penyisihan: disable jika BELUM pilih file ATAU SUDAH submit
                (submissionStage === "preliminary" && (!preliminaryFile || !!preliminaryUrl)) ||
                
                // 5. Untuk stage final: disable jika BELUM pilih file ATAU SUDAH submit (jika Anda ingin final juga tidak bisa resubmit)
                // Jika final BOLEH resubmit, hapus '|| !!finalUrl' di bawah ini
                (submissionStage === "final" && (!finalFile || !!finalUrl)) ||

                // [BARU] 6. Untuk stage final: disable jika periode submit BELUM DIBUKA
                (submissionStage === "final" && !isFinalSubmissionOpen)
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
                                <TableCell className="min-w-[220px]">
                                    {/* 1. Waktu Penyisihan */}
                                    {submission.submitted_at ? (
                                        <div className="text-sm">
                                            {format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                            <span className="text-gray-600 ml-1.5">(Penyisihan)</span>
                                        </div>
                                    ) : null}

                                    {/* 2. Waktu Final (Hanya tampil jika ada file final & waktunya beda) */}
                                    {submission.final_file_url && submission.updated_at && submission.updated_at !== submission.submitted_at ? (
                                        <div className="text-sm mt-1">
                                            {format(new Date(submission.updated_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                            <span className="text-blue-600 font-medium ml-1.5">(Final)</span>
                                        </div>
                                    ) : null}

                                    {/* 3. Fallback jika tidak ada data sama sekali */}
                                    {!submission.submitted_at && !submission.final_file_url ? '-' : null}
                                </TableCell>
                               <TableCell>
                                  {submission.preliminary_file_url ? (
                                    <a 
                                      href={submission.preliminary_file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 underline"
                                    >
                                      Lihat
                                    </a>
                                  ) : '-'}
                                </TableCell>
                                <TableCell>
                                  {submission.final_file_url ? (
                                    <a 
                                      href={submission.final_file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 underline"
                                    >
                                      Lihat
                                    </a>
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
