// File: app/api/upload-signature/route.ts
// INSTRUKSI: Replace seluruh isi file dengan kode ini

import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Konfigurasi Cloudinary
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const folder = body.folder || "uiso-2025"
    
    console.log('🔑 Generating signature for folder:', folder)
    
    // Generate timestamp (harus integer, bukan string)
    const timestamp = Math.round(new Date().getTime() / 1000)
    
    console.log('⏰ Using timestamp:', timestamp)
    
    // CRITICAL FIX: Parameters untuk signature - HANYA yang perlu di-sign
    // resource_type TIDAK boleh di-sign, tapi tetap dikirim sebagai form data
    const paramsToSign: Record<string, string | number> = {
      folder: folder,
      timestamp: timestamp
      // TIDAK include resource_type di sini!
    }

    console.log('📋 Params to sign:', paramsToSign)
    
    // Convert params ke string untuk logging
    const paramsString = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&')
    
    console.log('🔐 String to sign:', paramsString)

    // Generate signature menggunakan Cloudinary utils - HANYA sign parameter yang diperlukan
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    console.log('✅ Generated signature:', signature)

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error('Missing CLOUDINARY_API_KEY') 
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Missing CLOUDINARY_API_SECRET')
    }

    // Return data yang diperlukan untuk direct upload
    const responseData = {
      success: true,
      timestamp: timestamp,
      signature: signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder: folder
      // resource_type dikirim terpisah, tidak di-sign
    }

    console.log('📤 Sending response:', {
      ...responseData,
      signature: '[HIDDEN]',
      api_key: '[HIDDEN]'
    })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("❌ Upload signature generation error:", error)
    
    // Detailed error response
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate upload signature",
      timestamp: new Date().toISOString()
    }

    console.error("❌ Error response:", errorResponse)
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Handle GET request untuk testing
export async function GET() {
  try {
    // Test configuration
    const config = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
      apiKey: process.env.CLOUDINARY_API_KEY ? '✅' : '❌', 
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
    }

    console.log('🔧 Configuration check:', config)

    return NextResponse.json({
      message: "Upload signature endpoint is working",
      timestamp: new Date().toISOString(),
      config: config
    })
  } catch (error) {
    return NextResponse.json({
      error: "Configuration error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}