"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileUploadDeferred } from "@/components/ui/file-upload-deferred"
import { DeadlineCountdown } from "@/components/ui/deadline-countdown"
import { createClient } from "@/lib/supabase/client"
import { showSuccessToast, showErrorToast } from "@/lib/error-handler"
import { useUserProfile, useRegistrations } from "@/hooks/use-dashboard-data"

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
  const [isQualifiedForFinal, setIsQualifiedForFinal] = useState(false)
  const [submissionStage, setSubmissionStage] = useState<"preliminary" | "final" | null>(null)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)

  const [deadlinePreliminary, setDeadlinePreliminary] = useState<string | null>(null)
  const [deadlineFinal, setDeadlineFinal] = useState<string | null>(null)
  const [isDeadlineExpired, setIsDeadlineExpired] = useState(false)

  const approvedRegistration = registrations.find(
    (reg: any) => reg.status === "approved" && (reg.competitions.code === "SCC" || reg.competitions.code === "EGK"),
  )

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
          setIsQualifiedForFinal(data.is_qualified_for_final || false)
          setSubmittedAt(data.submitted_at)

          if (data.preliminary_file_url && !data.is_qualified_for_final) {
            setSubmissionStage("preliminary")
          } else if (data.is_qualified_for_final) {
            setSubmissionStage("final")
          } else {
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

    let newPreliminaryUrl = preliminaryUrl
    let newFinalUrl = finalUrl

    if (submissionStage === "preliminary" && preliminaryFile) {
      setUploadProgress(50)
      newPreliminaryUrl = await uploadFile(preliminaryFile, "scc-submissions/preliminary")
    }

    if (submissionStage === "final" && finalFile) {
      setUploadProgress(50)
      newFinalUrl = await uploadFile(finalFile, "scc-submissions/final")
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
}, [approvedRegistration, preliminaryFile, finalFile, submissionStage, preliminaryUrl, finalUrl])

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
      <Card>
        <CardHeader>
          <CardTitle>Submisi Lomba EGK</CardTitle>
          <CardDescription>Submisi untuk lomba EGK dilakukan melalui Google Form.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Silakan klik tombol di bawah untuk mengakses formulir submisi EGK.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.open("https://forms.gle/YOUR_GFORM_URL_HERE", "_blank")} className="w-full">
            Menuju Google Form
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✓ Berkas penyisihan sudah disubmit. Silakan upload berkas final Anda.
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
        <Button
          onClick={handleSubmitSCC}
          disabled={
            (submissionStage === "preliminary" && !preliminaryFile) ||
            (submissionStage === "final" && !finalFile) ||
            isSubmitting ||
            isDeadlineExpired
          }
          className="w-full"
        >
          {isDeadlineExpired ? "Deadline Telah Berakhir" : isSubmitting ? "Mengirim..." : "Submit Berkas"}
        </Button>
      </CardFooter>
    </Card>
  )
}
