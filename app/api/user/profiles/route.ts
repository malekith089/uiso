// app/api/user/profiles/route.ts
import { NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/auth'

// Gunakan Edge Runtime untuk performa lebih baik
export const runtime = 'edge'

// Cache response untuk 5 menit
export const revalidate = 300

export async function GET() {
  try {
    const profile = await getUserProfile()
    
    if (!profile) {
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

    // Return dengan cache headers
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