"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

// Perbarui interface ini
interface Registration {
  id: string
  status: string
  created_at: string
  selected_subject_id: string | null // <-- Tambahan
  competitions: {
    name: string
    code: string
    participant_type: string
    competition_date: string
  }
}

export default function DashboardPage() {
  // Tambahkan state baru di sini
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(true) // Default true
  const [needsOspSelection, setNeedsOspSelection] = useState(false) // <-- State baru
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not found")

        // --- Logika Cek Profil ---
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        setUserProfile(profileData)
        const requiredFields = [
          "full_name", "school_institution", "identity_number", "phone",
          "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "alamat",
        ]
        const isComplete = requiredFields.every((field) => profileData?.[field])
        setIsProfileComplete(isComplete)
        // --- Akhir Logika Cek Profil ---


        // --- Logika Cek Pendaftaran OSP ---
        const { data: registrationData, error: registrationError } = await supabase
          .from("registrations")
          .select("*, competitions(*)")
          .order("created_at", { ascending: false })

        if (registrationError) throw registrationError
        
        setRegistrations(registrationData || [])

        if (registrationData) {
          const needsSelection = registrationData.some(
            (reg: Registration) => reg.competitions.code === "OSP" && !reg.selected_subject_id,
          )
          setNeedsOspSelection(needsSelection)
        }
        // --- Akhir Logika Cek Pendaftaran OSP ---

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Disetujui</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
    }
  }, [])

  const getSubmissionButton = useCallback((competition: any, status: string) => {
    if (status !== "approved") return null

    if (competition.code === "OSP") {
      return (
        <Link href="/dashboard/submisi">
          <Button size="sm" className="w-full">
            Akses CBT
          </Button>
        </Link>
      )
    } else {
      return (
        <Link href="/dashboard/submisi">
          <Button size="sm" variant="outline" className="w-full bg-transparent">
            Upload Karya
          </Button>
        </Link>
      )
    }
  }, [])

    if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-8 w-full mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat datang, {userProfile?.full_name || "Peserta"}!</h1>
        <p className="text-primary-foreground/80">Pantau timeline kompetisi dan status pendaftaran Anda di UISO 2025</p>
        <div className="mt-3 text-sm">
          <p>Jenjang: {userProfile?.education_level}</p>
          <p>Institusi: {userProfile?.school_institution}</p>
        </div>
      </div>
      
      {/* Kartu Kelengkapan Profil (Sekarang sudah benar) */}
        {!isProfileComplete && (
            <Card className="border-yellow-500 bg-yellow-50">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-700 flex-shrink-0" />
                    <div className="flex-1">
                        <CardTitle className="text-base text-yellow-800">Lengkapi Profil Anda</CardTitle>
                        <CardDescription className="text-yellow-700 mt-1">
                            Harap pastikan profil Anda sudah lengkap. Kelengkapan data wajib bagi peserta. Ada pada pojok kanan atas atau Button di samping
                        </CardDescription>
                    </div>
                    <Link href="/dashboard/profile">
                        <Button variant="outline" size="sm" className="bg-transparent text-yellow-800 border-yellow-600 hover:bg-yellow-100">
                            Lengkapi
                        </Button>
                    </Link>
                </CardHeader>
            </Card>
        )}

      {/* KARTU KONDISIONAL UNTUK PEMILIHAN BIDANG OSP */}
      {needsOspSelection && (
        <Card className="border-yellow-400 bg-yellow-50">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <CardTitle className="text-lg text-yellow-900">Tindakan Diperlukan</CardTitle>
                <CardDescription className="text-yellow-800">
                  Anda terdaftar pada Olimpiade Sains Pelajar (OSP) namun belum memilih bidang lomba. Segera pilih
                  bidang lomba Anda pada <strong>Pendaftaran Saya</strong> untuk menyelesaikan pendaftaran.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pendaftaran">
              <Button className="bg-yellow-600 hover:bg-yellow-700">Pilih Bidang Lomba Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Sisa konten halaman Anda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pendaftaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status Pendaftaran
            </CardTitle>
            <CardDescription>Status kompetisi yang Anda ikuti</CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Anda belum mendaftar kompetisi apapun</p>
                <Link href="/dashboard/pendaftaran">
                  <Button>Daftar Kompetisi</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="p-4 rounded-lg border bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{registration.competitions.name}</h3>
                      {getStatusBadge(registration.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Jenis: {registration.competitions.participant_type}</p>
                      <p>Tanggal Daftar: {new Date(registration.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="mt-3">{getSubmissionButton(registration.competitions, registration.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}