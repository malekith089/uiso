// app/dashboard/page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, CheckCircle, Clock, AlertTriangle, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { showErrorToast } from "@/lib/error-handler"
import { useUserProfile, useRegistrations, useProfileCompleteness } from "@/hooks/use-dashboard-data"

interface Registration {
  id: string
  status: string
  created_at: string
  selected_subject_id: string | null
  is_finalist?: boolean
  competitions: {
    name: string
    code: string
    participant_type: string
    competition_date: string
    finalist_message?: string | null
  }
}

const getWhatsAppGroupLinks = (subjectId: string): { label: string; url: string }[] => {
  const groups: Record<string, { label: string; url: string }[]> = {
    '1': [ // Matematika
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/BxOrpUX27zFAVv4wr3mwnq?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/FbAeoo5xVNsL7xZXsVDTu0' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/KQM7GlFM8qG8WZrdwenONj?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/JocPGaaV2q62jqnoudJQyG?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/Bxmu5n9q1gw71JwJWAYonA?mode=wwt' },
    ],
    '2': [ // Fisika
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/HuPaWcRtD4RJ5a5VGpkPoa?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/KWdUBeSfcC6LZBmCxrqG1h' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/GA5elOobpKY5lyLW7t3FYe?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/JitktR2DrVD804VDxmOfuF?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/FyTovuJsQIP1y9dt4aqeDV?mode=wwt' },
    ],
    '3': [ // Kimia
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/Cq78ousYOOFA2uzFYFjASD?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/G264tfgkbVe9lnnHu5kCKA' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/F2K1Wg3UwNVJN4Mu6leW0P?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/K1NygfDuzda2dBRbZEkuCn?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/F1xjyZDKQobGawzt6P0n6v?mode=wwt' },
    ],
    '4': [ // Biologi
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/GlX7Sg1v8aJ5PdJAZLJwYX?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/H2R0lOML8uZCAqNbc8q88y' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/EwhW2buVFwI2AD2f90J0VX?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/G5En7N7N9ntEkMkl1TsbsM?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/HyFXDWJvT4MA1c1rj8UMIn?mode=wwt' },
    ],
    '5': [ // Geografi
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/GxaeXyg9JLhJH37E8LWMjc?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/B6iCOYAMUQFAKyWHHDWuZ7' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/GIgpYMMcFnG5NUjTQBpKME?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/BYJ5WYnTLZV36BwkZyFTJU?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/BBPVhQc73Go43gCIAzw39h?mode=wwt' },
    ],
    '6': [ // Kebumian
      { label: 'Grup 1', url: 'https://chat.whatsapp.com/KqLAr9jxV9z9fToXceFLbQ?mode=wwt' },
      { label: 'Grup 2', url: 'https://chat.whatsapp.com/Izc7w1VMvBlJmh3ERTuZx1' },
      { label: 'Grup 3', url: 'https://chat.whatsapp.com/GbcEZWLqVReAnnvHLMdMvw?mode=wwt' },
      { label: 'Grup 4', url: 'https://chat.whatsapp.com/Iv6zYcNxYYT5LuttToeHFE?mode=wwt' },
      { label: 'Grup 5', url: 'https://chat.whatsapp.com/FiLxNORsPQH45PI9Tf3jey?mode=wwt' },
    ],
  }

  return groups[subjectId] || []
}

// Fungsi untuk grup utama - HARUS RETURN ARRAY
const getMainGroupLinks = (): { label: string; url: string }[] => {
  return [
    { label: 'Grup 1', url: 'https://chat.whatsapp.com/HEi4YFrYKgDGqKQCw8YqPd?mode=wwt' },
    { label: 'Grup 2', url: 'https://chat.whatsapp.com/HZo4J2FMRErHtUrnn59JSj' },
    { label: 'Grup 3', url: 'https://chat.whatsapp.com/DDUNhcdHxsDLwX2R851782?mode=wwt' },
    { label: 'Grup 4', url: 'https://chat.whatsapp.com/EwXHuKLlkaF7ZLJdbR1he4?mode=wwt' },
    { label: 'Grup 5', url: 'https://chat.whatsapp.com/BvwVk7BG5So1HVivrrcnBh?mode=wwt' },
  ]
}

export default function DashboardPage() {
  const router = useRouter()
  
  // Gunakan hooks dengan caching
  const { data: userProfile, isLoading: profileLoading } = useUserProfile()
  const { data: registrations = [], isLoading: registrationsLoading } = useRegistrations()
  const { isComplete: isProfileComplete } = useProfileCompleteness()
  
  // Memoize computed values
  const needsOspSelection = useMemo(() => {
    return registrations.some(
      (reg: Registration) => reg.competitions.code === "OSP" && !reg.selected_subject_id
    )
  }, [registrations])

  // BARU: Filter registrasi yang lolos final
  const finalistRegistrations = useMemo(() => {
    return registrations.filter(
      (reg: Registration) => reg.is_finalist === true
    )
  }, [registrations])
  
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

  const handleDaftarClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isProfileComplete) {
      e.preventDefault()
      showErrorToast(
        new Error("Profil Anda belum lengkap. Silakan lengkapi data diri Anda di halaman profil terlebih dahulu."),
        "Profil Tidak Lengkap"
      )
    } else {
      router.push('/dashboard/pendaftaran')
    }
  }, [isProfileComplete, router])

  const loading = profileLoading || registrationsLoading

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Selamat datang, {userProfile?.full_name || "Peserta"}!
        </h1>
        <p className="text-primary-foreground/80">
          Pantau timeline kompetisi dan status pendaftaran Anda di UISO 2025
        </p>
        <div className="mt-3 text-sm">
          <p>Jenjang: {userProfile?.education_level}</p>
          <p>Institusi: {userProfile?.school_institution}</p>
        </div>
      </div>
      
      {/* Profile Completeness Card */}
      {!isProfileComplete && <ProfileIncompleteCard />}

      {/* BARU: Finalist Card */}
      {/* Card ini hanya akan muncul jika 'finalistRegistrations' tidak kosong */}
      {finalistRegistrations.length > 0 && (
        <FinalistCard finalistRegistrations={finalistRegistrations} />
      )}

      {/* OSP Selection Card */}
      {needsOspSelection && <OspSelectionCard />}

      {/* Status Pendaftaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Button onClick={handleDaftarClick}>Daftar Kompetisi</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration: Registration) => (
                  <div key={registration.id} className="p-4 rounded-lg border bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {registration.competitions.name}
                      </h3>
                      {getStatusBadge(registration.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Jenis: {registration.competitions.participant_type}</p>
                      <p>
                        Tanggal Daftar: {new Date(registration.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    
                  
{/* Tombol Grup Utama - SELALU muncul untuk semua peserta */}
<div className="mt-3 pt-3 border-t border-gray-200">
  <p className="text-sm font-medium text-gray-700 mb-2">
    Pilih salah satu grup WhatsApp Umum (Pilih salah satu, selama kuota masih ada):
  </p>
  <div className="flex flex-wrap gap-2">
    {getMainGroupLinks().map((group, index) => (
      <Button
        key={index}
        size="sm"
        onClick={() => window.open(group.url, '_blank')}
        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 text-xs px-3 py-1.5 ring-2 ring-blue-300 font-semibold"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        {group.label}
      </Button>
    ))}
  </div>
</div>

{/* Tombol Join Grup WA Mapel - hanya muncul jika approved dan OSP */}
{registration.status === 'approved' && 
registration.competitions.code === 'OSP' && 
registration.selected_subject_id && (
  <div className="mt-3 pt-3 border-t border-gray-200">
    <p className="text-sm font-medium text-gray-700 mb-2">
      Grup WhatsApp Bidang OSP (Pilih salah satu, selama kuota masih ada).
    </p>
    <div className="flex flex-wrap gap-2">
      {getWhatsAppGroupLinks(registration.selected_subject_id!).map((group, index) => (
        <Button
          key={index}
          size="sm"
          onClick={() => window.open(group.url, '_blank')}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5 text-xs px-3 py-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          {group.label}
        </Button>
      ))}
    </div>
  </div>
)}
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

// Komponen terpisah untuk skeleton loading
function DashboardSkeleton() {
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
      </div>
    </div>
  )
}

// Komponen terpisah untuk card profile incomplete
function ProfileIncompleteCard() {
  return (
    <Card className="border-yellow-500 bg-yellow-50">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <AlertTriangle className="h-6 w-6 text-yellow-700 flex-shrink-0" />
        <div className="flex-1">
          <CardTitle className="text-base text-yellow-800">Lengkapi Profil Anda</CardTitle>
          <CardDescription className="text-yellow-700 mt-1">
            Harap pastikan profil Anda sudah lengkap. Kelengkapan data wajib bagi peserta.
          </CardDescription>
        </div>
        <Link href="/dashboard/profile">
          <Button variant="outline" size="sm" className="bg-transparent text-yellow-800 border-yellow-600 hover:bg-yellow-100">
            Lengkapi
          </Button>
        </Link>
      </CardHeader>
    </Card>
  )
}

// Komponen terpisah untuk OSP selection card
function OspSelectionCard() {
  return (
    <Card className="border-yellow-400 bg-yellow-50">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <AlertTriangle className="h-6 w-6 text-yellow-700" />
          </div>
          <div>
            <CardTitle className="text-lg text-yellow-900">Tindakan Diperlukan</CardTitle>
            <CardDescription className="text-yellow-800">
              Anda terdaftar pada Olimpiade Sains Pelajar (OSP) namun belum memilih bidang lomba.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/pendaftaran">
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            Pilih Bidang Lomba Sekarang
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// BARU: Komponen terpisah untuk card finalis (Versi Modifikasi)
function FinalistCard({ finalistRegistrations }: { finalistRegistrations: Registration[] }) {
  
  // BARU: Helper function untuk mapping link GForm.
  // Anda bisa letakkan ini di luar komponen jika mau.
  const getFinalistGformLink = (competitionCode: string): string | null => {
    const links: Record<string, string> = {
      'OSP': 'https://ristek.link/KonfirmasiFinalisOSPUISO2025',
      'SCC': 'https://ristek.link/KonfirmasiFinalisSCCUISO2025',
      'EGK': 'https://ristek.link/KonfirmasiFinalisEGKUISO2025',
    };
    // Mengembalikan link atau null jika kode tidak ditemukan
    return links[competitionCode] || null;
  };

  return (
    <Card className="border-green-500 bg-green-50">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Trophy className="h-6 w-6 text-green-700 flex-shrink-0" />
        <div className="flex-1">
          <CardTitle className="text-base text-green-800">
            Selamat, Anda Lolos ke Tahap Final!
          </CardTitle>
          <CardDescription className="text-green-700 mt-1">
            Anda telah lolos ke tahap final untuk kompetisi berikut.
            {/* MODIFIKASI: Tambahan instruksi */}
            <strong className="text-green-800 font-semibold">
              {' '}Harap segera lakukan konfirmasi ulang
            </strong>
            {' '}untuk melanjutkan ke tahap final.
          </CardDescription>
          
          {/* MODIFIKASI: Mengganti <ul> dengan <div> untuk layout yang lebih baik */}
          <div className="mt-4 space-y-4">
            {finalistRegistrations.map((reg) => {
              // BARU: Ambil link GForm untuk kompetisi ini
              const gformLink = getFinalistGformLink(reg.competitions.code);

              return (
                <div 
                  key={reg.id} 
                  className="p-4 border border-green-200 rounded-lg bg-white/60"
                >
                  <strong className="font-semibold text-green-900">
                    {reg.competitions.name}
                  </strong>
                  
                  {/* Menampilkan pesan kustom untuk finalis */}
                  {/* Memastikan kita mengambil pesan dari data 'competitions' yang di-join */}
                  {reg.competitions.finalist_message ? (
                    <p className="text-xs italic text-green-800 mt-1">
                      {reg.competitions.finalist_message}
                    </p>
                  ) : (
                    <p className="text-xs italic text-green-800 mt-1">
                      Informasi detail akan segera diumumkan.
                    </p>
                  )}

                  {/* BARU: Tombol GForm (hanya muncul jika link ada) */}
                  {gformLink && (
                    <Button
                      size="sm"
                      className="mt-3 bg-green-600 hover:bg-green-700 text-xs h-8 px-3 py-1.5"
                      onClick={() => window.open(gformLink, '_blank')}
                    >
                      Konfirmasi Ulang Final di Sini
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}