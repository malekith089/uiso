// hooks/use-dashboard-data.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

export function useCurrentUser() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (!user) throw new Error('User not found')
      return user
    },
    staleTime: 10 * 60 * 1000, // User data stale lebih lama (10 menit)
    gcTime: 30 * 60 * 1000,    // Keep longer in cache
  })
}

// Hook untuk fetch user profile dengan caching
// Ganti function useUserProfile yang lama dengan ini:

export function useUserProfile() {
  const supabase = createClient()
  const { data: user } = useCurrentUser()
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not found')
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return profile
    },
    enabled: !!user, // Only run when user is available
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Hook untuk fetch registrations dengan caching
// Ganti function useRegistrations yang lama dengan ini:

export function useRegistrations() {
  const supabase = createClient()
  const { data: user } = useCurrentUser()
  
  return useQuery({
    queryKey: ['registrations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not found')
      
      const { data, error } = await supabase
        .from('registrations')
        .select('*, competitions(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user, // Only run when user is available
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Hook untuk fetch competitions dengan caching lebih lama (jarang berubah)
export function useCompetitions() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      return data || []
    },
    staleTime: 30 * 60 * 1000, // Data dianggap fresh selama 30 menit
    gcTime: 60 * 60 * 1000,     // Cache disimpan selama 1 jam
  })
}

// Hook untuk update profile dengan optimistic update
// Ganti function useUpdateProfile yang lama dengan ini:

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { data: user } = useCurrentUser()
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('User not found')
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Update cache immediately with user ID
      queryClient.setQueryData(['userProfile', user?.id], data)
      // Invalidate related queries with user ID
      queryClient.invalidateQueries({ queryKey: ['registrations', user?.id] })
    },
  })
}

// Hook untuk check profile completeness dengan memoization
export function useProfileCompleteness() {
  const { data: profile } = useUserProfile()
  
  const requiredFields = useMemo(() => [
    'full_name',
    'school_institution', 
    'identity_number',
    'phone',
    'tempat_lahir',
    'tanggal_lahir',
    'jenis_kelamin',
    'alamat',
  ], [])
  
  const isComplete = useMemo(() => {
    return profile ? requiredFields.every(field => profile[field]) : false
  }, [profile, requiredFields])
  
  return { isComplete, profile }
}