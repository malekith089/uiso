import { type NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uiso-2025"
    const filename = formData.get("filename") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize public_id (nama file tanpa ekstensi)
    const actualFilename = filename || file.name
    let publicId = actualFilename.split(".").slice(0, -1).join(".")
    
    // CRITICAL: Validasi dan batasi panjang public_id
    // Cloudinary limit: 255 chars untuk full path (folder + public_id)
    const maxPublicIdLength = 255 - folder.length - 1 // -1 untuk separator "/"
    
    if (publicId.length > maxPublicIdLength) {
      console.warn(`public_id too long (${publicId.length} chars), truncating to ${maxPublicIdLength}`)
      publicId = publicId.slice(0, maxPublicIdLength)
    }
    
    // Pastikan public_id tidak kosong
    if (!publicId || publicId.trim() === '') {
      publicId = `file_${Date.now()}`
    }
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: "auto",
            public_id: publicId,
            overwrite: true,
            // REMOVED: use_filename dan unique_filename tidak diperlukan
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              reject(error)
            } else {
              resolve(result)
            }
          },
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    
    // Berikan error message yang lebih deskriptif
    const errorMessage = error?.message || error?.error?.message || "Upload failed"
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error?.http_code ? `Cloudinary error (${error.http_code})` : undefined
      }, 
      { status: 500 }
    )
  }
}