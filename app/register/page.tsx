"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    school: "",
    level: "",
    identityNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            school_institution: formData.school,
            education_level: formData.level === "mahasiswa" ? "Mahasiswa/i" : "SMA/Sederajat",
            identity_number: formData.identityNumber,
          },
        },
      })

      if (error) throw error

      alert("Registrasi akun berhasil! Silakan login.")
      router.push("/login")
    } catch (error: any) {
      setError(error.message || "Registrasi gagal")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      level: value,
    })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/nature-landscape.png')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/images/uiso-logo.png"
              alt="UISO 2025 Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent font-bold text-2xl drop-shadow-lg">
              UISO 2025
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Daftar Akun Baru</h1>
          <p className="text-gray-100 drop-shadow">Bergabunglah dengan UISO 2025 dan mulai kompetisi Anda</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Registrasi</CardTitle>
            <CardDescription className="text-center">Lengkapi data diri Anda untuk mendaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school">Sekolah/Institusi</Label>
                  <Input
                    id="school"
                    name="school"
                    type="text"
                    placeholder="Nama sekolah/universitas"
                    value={formData.school}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Jenjang</Label>
                  <Select onValueChange={handleSelectChange} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mahasiswa">Mahasiswa/i</SelectItem>
                      <SelectItem value="sma">SMA/Sederajat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identityNumber">Nomor Identitas (NISN/NIM/NPM)</Label>
                <Input
                  id="identityNumber"
                  name="identityNumber"
                  type="text"
                  placeholder="Masukkan NISN/NIM/NPM"
                  value={formData.identityNumber}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Konfirmasi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-medium shadow-lg"
              >
                {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-white/80 hover:text-white hover:underline drop-shadow">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
