import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Trophy, FileText, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch real statistics from database
  const [
    { count: totalParticipants },
    { count: approvedRegistrations },
    { count: pendingRegistrations },
    { data: competitions },
    { data: recentRegistrations },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("competitions").select("id, name, code").eq("is_active", true),
    supabase
      .from("registrations")
      .select(`
        id,
        status,
        created_at,
        profiles!inner(full_name),
        competitions!inner(name, code)
      `)
      .order("created_at", { ascending: false })
      .limit(4),
  ])

  // Calculate competition statistics
  const competitionStats = await Promise.all(
    (competitions || []).map(async (comp) => {
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("competition_id", comp.id)
        .eq("status", "approved")

      return {
        ...comp,
        participantCount: count || 0,
      }
    }),
  )

  const approvalRate = totalParticipants ? Math.round(((approvedRegistrations || 0) / totalParticipants) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Kelola dan pantau seluruh aktivitas UISO 2025</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants || 0}</div>
            <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendaftaran Disetujui</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRegistrations || 0}</div>
            <p className="text-xs text-muted-foreground">{approvalRate}% dari total pendaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRegistrations || 0}</div>
            <p className="text-xs text-muted-foreground">Perlu ditinjau segera</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kompetisi Aktif</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {competitions?.map((c) => c.code).join(", ") || "Tidak ada"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses fitur admin yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <a href="/admin/persetujuan">
                <UserCheck className="mr-2 h-4 w-4" />
                Tinjau Pendaftaran Baru
              </a>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <a href="/admin/peserta">
                <FileText className="mr-2 h-4 w-4" />
                Export Data Peserta
              </a>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <a href="/admin/kompetisi">
                <Trophy className="mr-2 h-4 w-4" />
                Kelola Kompetisi
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Pendaftaran terbaru dalam sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRegistrations && recentRegistrations.length > 0 ? (
              recentRegistrations.map((registration: any, index: number) => (
                <div key={registration.id} className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      registration.status === "approved"
                        ? "bg-green-500"
                        : registration.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {registration.profiles.full_name} mendaftar {registration.competitions.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(registration.created_at).toLocaleDateString("id-ID")} - Status: {registration.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Belum ada aktivitas terbaru</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Competition Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kompetisi</CardTitle>
          <CardDescription>Status pendaftaran untuk setiap kompetisi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitionStats.map((competition, index) => (
              <div key={competition.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      index === 0 ? "bg-blue-100" : index === 1 ? "bg-green-100" : "bg-purple-100"
                    }`}
                  >
                    {index === 0 ? (
                      <Trophy className="h-6 w-6 text-blue-600" />
                    ) : index === 1 ? (
                      <FileText className="h-6 w-6 text-green-600" />
                    ) : (
                      <Users className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{competition.name}</h3>
                    <p className="text-sm text-muted-foreground">Kode: {competition.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{competition.participantCount}</p>
                  <p className="text-sm text-muted-foreground">peserta terdaftar</p>
                </div>
              </div>
            ))}

            {competitionStats.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada kompetisi aktif</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
