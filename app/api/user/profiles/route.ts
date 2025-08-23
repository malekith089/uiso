import { NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/auth'

export async function GET() {
  try {
    const profile = await getUserProfile()
    
    if (!profile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}