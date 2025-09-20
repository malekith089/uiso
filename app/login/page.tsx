"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "@/lib/auth-client"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, getUserProfile } = useSupabaseAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await signIn(formData.email, formData.password)

      if (error) {
        setError("Email atau password salah")
        return
      }

      if (data.user) {
        // Check user role to determine redirect
        const profile = await getUserProfile()
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan saat login")
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Image
        src="/images/nature-landscape.webp"
        alt="Nature Landscape Background"
        fill // Menggantikan layout="fill"
        quality={75}
        priority
        className="object-cover z-0" // Menggantikan objectFit="cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/images/uiso-logo.png"
              alt="UISO 2025 Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-3xl font-logo leading-normal py-1">
              UISO
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Masuk ke Akun Anda</h1>
          <p className="text-gray-100 drop-shadow">Silakan masuk untuk melanjutkan ke dashboard</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Login</CardTitle>
            <CardDescription className="text-center">Masukkan email dan password Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary-dark hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
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

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-medium shadow-lg"
              >
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:text-primary-dark font-medium hover:underline">
                  Daftar di sini
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