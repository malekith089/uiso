import { type NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uiso-2025"
    const filename = formData.get("filename") as string // <-- 1. AMBIL FILENAME

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 2. DAPATKAN NAMA FILE TANPA EKSTENSI
    // (mis: "makalah_saya.pdf" -> "makalah_saya")
    // Kita gunakan 'filename' yg dikirim, fallback ke 'file.name' jika gagal
    const actualFilename = filename || file.name
    const publicId = actualFilename.split(".").slice(0, -1).join(".")
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: "auto",

            // --- 3. UBAH OPSI DI SINI ---
            /**
             * Set public_id secara manual.
             * Cloudinary akan otomatis menambahkan ekstensi file (.pdf)
             * karena resource_type="auto"
             */
            public_id: publicId,
            
            /** Izinkan menimpa file (resubmit) */
            overwrite: true,
            
            // 'use_filename' dan 'unique_filename' tidak diperlukan lagi
            // use_filename: true,       // HAPUS/KOMENTARI
            // unique_filename: false,   // HAPUS/KOMENTARI
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}