"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Registration {
  id: string
  status: string
  created_at: string
  competitions: {
    name: string
    code: string
    participant_type: string
    competition_date: string
  }
}

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setUserProfile(profile)

        // Fetch user registrations
        const { data: regs } = await supabase
          .from("registrations")
          .select(`
            *,
            competitions (*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        setRegistrations(regs || [])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const timeline = [
    {
      date: "25 Jan 2025",
      event: "Batas Pendaftaran OSP",
      status: "upcoming",
      type: "deadline",
    },
    {
      date: "28 Jan 2025",
      event: "Batas Pendaftaran EGK & SCC",
      status: "upcoming",
      type: "deadline",
    },
    {
      date: "15 Feb 2025",
      event: "Pelaksanaan OSP (CBT)",
      status: "upcoming",
      type: "competition",
    },
    {
      date: "20 Feb 2025",
      event: "Deadline Submisi EGK & SCC",
      status: "upcoming",
      type: "submission",
    },
  ]

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

  const getSubmissionButton = (competition: any, status: string) => {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Lomba */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Lomba
            </CardTitle>
            <CardDescription>Jadwal penting kompetisi UISO 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {item.status === "upcoming" && item.type === "deadline" && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {item.status === "upcoming" && item.type !== "deadline" && (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.event}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <Badge variant={item.status === "completed" ? "default" : "secondary"}>
                    {item.status === "completed" ? "Selesai" : "Mendatang"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
