// hooks/use-dashboard-data.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// Hook untuk fetch user profile dengan caching
export function useUserProfile() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return profile
    },
    staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
    gcTime: 10 * 60 * 1000,   // Cache disimpan selama 10 menit
  })
}

// Hook untuk fetch registrations dengan caching
export function useRegistrations() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['registrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')
      
      const { data, error } = await supabase
        .from('registrations')
        .select('*, competitions(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 3 * 60 * 1000, // Data dianggap fresh selama 3 menit
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
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data: { user } } = await supabase.auth.getUser()
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
      // Update cache immediately
      queryClient.setQueryData(['userProfile'], data)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })
}

// Hook untuk check profile completeness dengan memoization
export function useProfileCompleteness() {
  const { data: profile } = useUserProfile()
  
  const requiredFields = [
    'full_name',
    'school_institution',
    'identity_number',
    'phone',
    'tempat_lahir',
    'tanggal_lahir',
    'jenis_kelamin',
    'alamat',
  ]
  
  const isComplete = profile
    ? requiredFields.every(field => profile[field])
    : false
  
  return { isComplete, profile }
}