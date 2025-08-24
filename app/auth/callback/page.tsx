'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=' + encodeURIComponent(error.message))
          return
        }

        // Get the type of auth event
        const type = searchParams.get('type')
        
        if (type === 'recovery') {
          // This is a password recovery, redirect to reset password page
          router.push('/reset-password')
        } else if (type === 'signup') {
          // This is email confirmation, redirect to dashboard
          router.push('/dashboard')
        } else {
          // Default redirect
          router.push('/dashboard')
        }
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/login?error=' + encodeURIComponent('Authentication error'))
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses autentikasi...</p>
      </div>
    </div>
  )
}