"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Langsung memanggil fungsi reset password dari Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message || "Gagal mengirim email reset password")
    } else {
      setIsSubmitted(true)
    }
    setIsLoading(false)
  }

  // UI di bawah ini sama persis dengan yang Anda miliki, tidak ada perubahan.
  if (isSubmitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/nature-landscape.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />
        <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image src="/images/uiso-logo.png" alt="UISO 2025 Logo" width={60} height={60} className="w-15 h-15 object-contain" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Email Terkirim!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Kami telah mengirimkan link reset password ke email Anda
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Periksa email Anda</p>
                  <p className="text-blue-600 mt-1">
                    Link reset password telah dikirim ke <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">Tidak menerima email? Periksa folder spam atau</p>
              <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                Kirim Ulang
              </Button>
            </div>
            <div className="text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nature-landscape.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/images/uiso-logo.png" alt="UISO 2025 Logo" width={60} height={60} className="w-15 h-15 object-contain" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Lupa Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Masukkan email Anda untuk menerima link reset password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-gray-200 focus:border-primary focus:ring-primary" />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-medium shadow-lg disabled:opacity-50">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </div>
              ) : (
                "Kirim Link Reset"
              )}
            </Button>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Ingat password Anda?{" "}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  Kembali ke Login
                </Link>
              </p>
              <div className="flex items-center gap-2 justify-center">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
