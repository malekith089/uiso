import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  school_institution: string
  education_level: string
  identity_number: string
  role: string
  created_at: string
}

// Helper function to get the correct base URL
function getBaseUrl(): string {
  // Untuk production, gunakan environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Untuk development, gunakan window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Fallback (tidak seharusnya sampai sini)
  return 'http://localhost:3000'
}

// Client-side auth functions
export function useSupabaseAuth() {
  const supabase = createClient()
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, metadata: {
    full_name: string
    school_institution: string
    education_level: string
    identity_number: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      // Redirect to home page after logout
      window.location.href = '/'
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const baseUrl = getBaseUrl()
    const redirectUrl = `${baseUrl}/reset-password`
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
    return { data, error }
  }

  // Fungsi untuk handle auth callback
  const handleAuthCallback = async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }

  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }

  const getUserProfile = async (): Promise<UserProfile | null> => {
    const { user } = await getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      console.error('Profile fetch error:', error)
      return null
    }

    return {
      id: profile.id,
      email: user.email!,
      full_name: profile.full_name,
      school_institution: profile.school_institution,
      education_level: profile.education_level,
      identity_number: profile.identity_number,
      role: profile.role || 'user',
      created_at: profile.created_at
    }
  }

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    handleAuthCallback,
    getSession,
    getUser,
    getUserProfile
  }
}