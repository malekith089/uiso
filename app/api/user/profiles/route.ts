// app/api/user/profiles/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Gunakan Edge Runtime untuk performa lebih baik
export const runtime = 'edge'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          }
        }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' }, 
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          }
        }
      )
    }

    // Return dengan cache headers yang sesuai
    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        }
      }
    )
  }
}