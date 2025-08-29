"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [isLinkInvalid, setIsLinkInvalid] = useState(false) // State baru untuk link expired/invalid
  const [validationMessage, setValidationMessage] = useState("Memvalidasi link...");

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsSessionReady(true);
    }
  }, [supabase.auth]);


  useEffect(() => {
    // Cek jika URL hash mengandung pesan error dari Supabase (misal, token expired)
    const hash = window.location.hash;
    if (hash.includes('error=') && hash.includes('error_description=')) {
        const params = new URLSearchParams(hash.substring(1)); // hapus #
        const errorDescription = params.get('error_description');
        setValidationMessage(errorDescription || "Link tidak valid atau telah kedaluwarsa.");
        setIsLinkInvalid(true);
        return; // Hentikan proses lebih lanjut
    }
    
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionReady(true);
      }
      if (event === "USER_UPDATED") {
        setIsSuccess(true);
      }
    })

    // Timeout untuk menangani kasus di mana event tidak pernah terpicu
    const timer = setTimeout(() => {
        if (!isSessionReady) {
            setValidationMessage("Link kedaluwarsa atau tidak valid. Silakan minta link baru.");
            setIsLinkInvalid(true); // Set state invalid
        }
    }, 7000); // 7 detik

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer);
    }
  }, [supabase.auth, isSessionReady, checkSession])

  // -- PERUBAHAN DI SINI --
  // useEffect baru untuk menangani logika setelah sukses
  useEffect(() => {
    if (isSuccess) {
      // 1. Langsung sign out untuk menghapus sesi otomatis dari Supabase
      supabase.auth.signOut();

      // 2. Arahkan ke halaman login setelah 3 detik
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);

      // 3. Cleanup timer jika komponen di-unmount
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.")
      return
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.")
      return
    }
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message || "Gagal memperbarui password. Silakan coba lagi.")
    }
    // State isSuccess akan ditangani oleh listener onAuthStateChange
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-gray-50">
        <Card className="relative z-10 w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <CardTitle className="text-2xl font-bold">Password Berhasil Diubah!</CardTitle>
            <CardDescription className="text-gray-600">
              Anda akan diarahkan ke halaman login dalam 3 detik...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Login Sekarang</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nature-landscape.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <Image src="/images/uiso-logo.png" alt="UISO 2025 Logo" width={60} height={60} className="w-15 h-15 object-contain mx-auto" />
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Atur Password Baru
            </CardTitle>
            <CardDescription className="text-gray-600">
              Masukkan password baru Anda di bawah ini.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Logika Tampilan Baru */}
          {!isSessionReady && !isLinkInvalid ? (
            // 1. Tampilan Loading Awal
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="mt-4 text-gray-600">Memvalidasi link...</p>
            </div>
          ) : isLinkInvalid ? (
            // 2. Tampilan Link Expired/Invalid
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500" />
                <p className="mt-4 font-semibold text-gray-700">Link Tidak Valid</p>
                <p className="mt-2 text-sm text-gray-600">{validationMessage}</p>
                <Button asChild className="w-full mt-6">
                    <Link href="/forgot-password">Minta Link Baru</Link>
                </Button>
            </div>
          ) : (
            // 3. Tampilan Form Jika Valid
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-12" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-12 font-medium">
                {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
