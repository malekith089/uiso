"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Trophy, FileText, Clock, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendaftaran Disetujui</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">987</div>
            <p className="text-xs text-muted-foreground">80% dari total pendaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Perlu ditinjau segera</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kompetisi Aktif</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">OSP, EGK, SCC</p>
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
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Tinjau Pendaftaran Baru
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Data Peserta
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Trophy className="mr-2 h-4 w-4" />
              Kelola Kompetisi
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              Lihat Laporan Sistem
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">15 pendaftaran baru disetujui</p>
                <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Data peserta OSP diexport</p>
                <p className="text-xs text-muted-foreground">4 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">23 submisi EGK masuk</p>
                <p className="text-xs text-muted-foreground">6 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">5 pendaftaran ditolak</p>
                <p className="text-xs text-muted-foreground">8 jam yang lalu</p>
              </div>
            </div>
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Olimpiade Sains Pelajar (OSP)</h3>
                  <p className="text-sm text-muted-foreground">Individu • SMA/Sederajat</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">456</p>
                <p className="text-sm text-muted-foreground">peserta terdaftar</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Esai Gagasan Kritis (EGK)</h3>
                  <p className="text-sm text-muted-foreground">Individu • Perguruan Tinggi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">234</p>
                <p className="text-sm text-muted-foreground">peserta terdaftar</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Study Case Competition (SCC)</h3>
                  <p className="text-sm text-muted-foreground">Tim • Perguruan Tinggi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">tim terdaftar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
