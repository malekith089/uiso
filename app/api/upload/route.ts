import { type NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uiso-2025"
    const filename = formData.get("filename") as string
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize public_id (nama file tanpa ekstensi)
    const actualFilename = filename || file.name
    let publicId = actualFilename.split(".").slice(0, -1).join(".")
    
    // Get file extension
    const fileExtension = actualFilename.split(".").pop()?.toLowerCase()
    
    // CRITICAL: Validasi dan batasi panjang public_id
    const maxPublicIdLength = 255 - folder.length - 1
    
    if (publicId.length > maxPublicIdLength) {
      console.warn(`public_id too long (${publicId.length} chars), truncating to ${maxPublicIdLength}`)
      publicId = publicId.slice(0, maxPublicIdLength)
    }
    
    // Pastikan public_id tidak kosong
    if (!publicId || publicId.trim() === '') {
      publicId = `file_${Date.now()}`
    }

    // CRITICAL FIX: Determine resource_type based on file type
    let resourceType: "image" | "video" | "raw" | "auto" = "auto"
    let uploadOptions: any = {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      use_filename: true,
      unique_filename: false,
    }
    
    // CRITICAL: Untuk PDF, gunakan resource_type "image" agar bisa di-preview/download
    if (fileExtension === 'pdf') {
      resourceType = "image" // PDF di Cloudinary bisa pakai resource_type "image"
      uploadOptions = {
        ...uploadOptions,
        resource_type: "image",
        format: "pdf", // Explicitly set format as PDF
      }
    } 
    // Untuk PPT/PPTX, gunakan resource_type "raw"
    else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
      resourceType = "raw"
      uploadOptions = {
        ...uploadOptions,
        resource_type: "raw",
        format: fileExtension,
        // Tambahkan public_id dengan ekstensi untuk raw files
        public_id: `${publicId}.${fileExtension}`,
      }
    } 
    // Untuk image files
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      resourceType = "image"
      uploadOptions = {
        ...uploadOptions,
        resource_type: "image",
      }
    }
    // Default: auto
    else {
      uploadOptions = {
        ...uploadOptions,
        resource_type: "auto",
      }
    }
    
    console.log('📤 Uploading file:', {
      filename: actualFilename,
      extension: fileExtension,
      resourceType: uploadOptions.resource_type,
      folder: folder
    })

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error)
              reject(error)
            } else {
              console.log('✅ Upload successful:', {
                public_id: result?.public_id,
                resource_type: result?.resource_type,
                format: result?.format,
                secure_url: result?.secure_url
              })
              resolve(result)
            }
          },
        )
        .end(buffer)
    })

    const uploadResult = result as any

    // Gunakan secure_url langsung dari Cloudinary
    let secureUrl = uploadResult.secure_url

    console.log('📎 Final URL:', secureUrl)

    return NextResponse.json({
      success: true,
      url: secureUrl,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    
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