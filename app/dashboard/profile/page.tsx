"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Save, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ExtendedProfile {
  id: string
  full_name: string
  email: string
  school_institution: string
  education_level: string
  identity_number: string
  kelas?: string
  semester?: number
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin?: string
  alamat?: string
  phone?: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ExtendedProfile>>({})

  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        setProfile(profileData)
        setFormData(profileData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Gagal memuat profil",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          school_institution: formData.school_institution,
          education_level: formData.education_level,
          identity_number: formData.identity_number,
          kelas: formData.kelas,
          semester: formData.semester,
          tempat_lahir: formData.tempat_lahir,
          tanggal_lahir: formData.tanggal_lahir,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat,
          phone: formData.phone,
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...formData } as ExtendedProfile)
      setIsEditing(false)

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600">Kelola informasi profil dan data pribadi Anda</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <CardTitle>{profile.full_name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Jenjang Pendidikan</p>
              <p className="font-medium">{profile.education_level}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Sekolah/Institusi</p>
              <p className="font-medium text-center">{profile.school_institution}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Bergabung Sejak</p>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              {isEditing ? "Edit informasi profil Anda" : "Detail informasi profil Anda"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name || ""}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.full_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm font-medium p-2 bg-gray-50 rounded text-gray-500">{profile.email}</p>
                  <p className="text-xs text-gray-400">Email tidak dapat diubah</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_institution">Sekolah/Institusi</Label>
                  {isEditing ? (
                    <Input
                      id="school_institution"
                      value={formData.school_institution || ""}
                      onChange={(e) => handleInputChange("school_institution", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.school_institution}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Jenjang Pendidikan</Label>
                  {isEditing ? (
                    <Select
                      value={formData.education_level || ""}
                      onValueChange={(value) => handleInputChange("education_level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMA/Sederajat">SMA/Sederajat</SelectItem>
                        <SelectItem value="Mahasiswa/i">Mahasiswa/i</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.education_level}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identity_number">Nomor Identitas</Label>
                  {isEditing ? (
                    <Input
                      id="identity_number"
                      value={formData.identity_number || ""}
                      onChange={(e) => handleInputChange("identity_number", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.identity_number}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. HP</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Contoh: 08123456789"
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.phone || "Belum diisi"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informasi Akademik</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.education_level === "SMA/Sederajat" ? (
                  <div className="space-y-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    {isEditing ? (
                      <Select value={formData.kelas || ""} onValueChange={(value) => handleInputChange("kelas", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X">X</SelectItem>
                          <SelectItem value="XI">XI</SelectItem>
                          <SelectItem value="XII">XII</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded">{profile.kelas || "Belum diisi"}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    {isEditing ? (
                      <Select
                        value={formData.semester?.toString() || ""}
                        onValueChange={(value) => handleInputChange("semester", Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                        {profile.semester ? `Semester ${profile.semester}` : "Belum diisi"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informasi Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                  {isEditing ? (
                    <Input
                      id="tempat_lahir"
                      value={formData.tempat_lahir || ""}
                      onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                      placeholder="Contoh: Jakarta"
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                      {profile.tempat_lahir || "Belum diisi"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                  {isEditing ? (
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir || ""}
                      onChange={(e) => handleInputChange("tanggal_lahir", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                      {profile.tanggal_lahir
                        ? new Date(profile.tanggal_lahir).toLocaleDateString("id-ID")
                        : "Belum diisi"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                  {isEditing ? (
                    <Select
                      value={formData.jenis_kelamin || ""}
                      onValueChange={(value) => handleInputChange("jenis_kelamin", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                      {profile.jenis_kelamin || "Belum diisi"}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat Domisili</Label>
                  {isEditing ? (
                    <Textarea
                      id="alamat"
                      value={formData.alamat || ""}
                      onChange={(e) => handleInputChange("alamat", e.target.value)}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded min-h-[80px]">
                      {profile.alamat || "Belum diisi"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
