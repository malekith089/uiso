"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Manual URL parsing to avoid SSR issues
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const token = urlParams.get('token')
        const type = urlParams.get('type')
        const errorParam = urlParams.get('error')
        
        // Debug logging
        const debug = {
          url: window.location.href,
          params: window.location.search,
          code: code,
          token: token,
          type: type,
          error: errorParam,
          timestamp: new Date().toISOString()
        }
        
        console.log('=== RESET PASSWORD DEBUG ===', debug)
        setDebugInfo(debug)

        // Check for error in URL
        if (errorParam) {
          console.error('URL contains error:', errorParam)
          setIsValidToken(false)
          setError(`Error: ${errorParam}`)
          return
        }

        // Handle different parameter types
        if (code) {
          console.log('Found code parameter, attempting exchange...')
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('Code exchange error:', error)
              setIsValidToken(false)
              setError(`Link tidak valid: ${error.message}`)
              return
            }
            
            console.log('Code exchange successful:', data)
            setIsValidToken(true)
            
          } catch (exchangeError) {
            console.error('Exchange code failed:', exchangeError)
            setIsValidToken(false)
            setError("Gagal memproses link reset password")
            return
          }
          
        } else if (token) {
          console.log('Found token parameter, attempting verification...')
          
          // For token-based reset, we need to verify it's still valid
          // This might be from an older Supabase implementation or custom setup
          try {
            // Try to use the token with verifyOtp
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'recovery'
            })
            
            if (error) {
              console.error('Token verification error:', error)
              setIsValidToken(false)
              setError(`Token tidak valid: ${error.message}`)
              return
            }
            
            console.log('Token verification successful:', data)
            setIsValidToken(true)
            
          } catch (tokenError) {
            console.error('Token verification failed:', tokenError)
            
            // Fallback: Just check if we have a valid session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError || !session) {
              console.log('No valid session found')
              setIsValidToken(false)
              setError("Token reset password tidak valid atau sudah kedaluwarsa")
            } else {
              console.log('Valid session found, proceeding...')
              setIsValidToken(true)
            }
          }
          
        } else {
          // No code or token, check existing session
          console.log('No code/token found, checking existing session...')
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error || !session) {
            console.error('No valid session:', error)
            setIsValidToken(false)
            setError("Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.")
          } else {
            console.log('Valid existing session found:', session.user?.id)
            setIsValidToken(true)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsValidToken(false)
        setError("Terjadi kesalahan saat memverifikasi link reset password")
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkSession()
    }
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok!")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter!")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        console.error('Update password error:', error)
        setError(error.message || "Gagal mengubah password")
        return
      }

      console.log('Password updated successfully')
      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?message=" + encodeURIComponent("Password berhasil diubah, silakan login dengan password baru"))
      }, 3000)
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setError(error.message || "Gagal mengubah password")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking token validity
  if (isValidToken === null) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/nature-landscape.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

        <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-gray-600">Memverifikasi link reset password...</span>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded mt-2 w-full">
              <p><strong>URL:</strong> {debugInfo.url?.substring(0, 50)}...</p>
              <p><strong>Code:</strong> {debugInfo.code ? 'Present' : 'None'}</p>
              <p><strong>Token:</strong> {debugInfo.token ? 'Present' : 'None'}</p>
              <p><strong>Type:</strong> {debugInfo.type || 'None'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/nature-landscape.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

        <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/uiso-logo.png"
                alt="UISO 2025 Logo"
                width={60}
                height={60}
                className="w-15 h-15 object-contain"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Link Tidak Valid</CardTitle>
              <CardDescription className="text-gray-600">
                {error || "Link reset password tidak valid atau sudah kedaluwarsa"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Silakan minta link reset password yang baru melalui halaman lupa password.
              </p>
            </div>

            {/* Debug info for troubleshooting */}
            <details className="text-xs bg-gray-50 p-2 rounded">
              <summary className="cursor-pointer text-gray-500">Debug Info (Click to expand)</summary>
              <div className="mt-2 space-y-1">
                <p><strong>URL:</strong> {debugInfo.url}</p>
                <p><strong>Code:</strong> {debugInfo.code || 'None'}</p>
                <p><strong>Token:</strong> {debugInfo.token || 'None'}</p>
                <p><strong>Type:</strong> {debugInfo.type || 'None'}</p>
                <p><strong>Error:</strong> {debugInfo.error || 'None'}</p>
                <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
              </div>
            </details>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/forgot-password">Minta Link Reset Baru</Link>
              </Button>

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/nature-landscape.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

        <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/uiso-logo.png"
                alt="UISO 2025 Logo"
                width={60}
                height={60}
                className="w-15 h-15 object-contain"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Password Berhasil Diubah!
              </CardTitle>
              <CardDescription className="text-gray-600">Password Anda telah berhasil diperbarui</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 text-center">
                Anda akan dialihkan ke halaman login dalam beberapa detik...
              </p>
            </div>

            <Button asChild className="w-full">
              <Link href="/login">Lanjut ke Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show password reset form
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/nature-landscape.png')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-green-900/30 to-orange-900/40" />

      <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/uiso-logo.png"
              alt="UISO 2025 Logo"
              width={60}
              height={60}
              className="w-15 h-15 object-contain"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600">Masukkan password baru untuk akun Anda</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary pr-10"
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
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary pr-10"
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">Password minimal 6 karakter dan pastikan kedua password sama.</p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-medium shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengubah Password...
                </div>
              ) : (
                "Ubah Password"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}