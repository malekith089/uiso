// app/api/upload-submission/route.ts

// 1. Import tipe 'UploadApiOptions'
import { v2 as cloudinary, type UploadApiOptions } from "cloudinary"
import { createClient } from "@/lib/supabase/server"
// 2. Hapus import 'cookies'
import { NextResponse } from "next/server"

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  // 3. Perbaiki pemanggilan Supabase client
  const supabase = await createClient() // Hapus cookieStore, tambahkan await

  // 1. Verifikasi Autentikasi User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const competitionCode = formData.get("competitionCode") as string
  const fileType = formData.get("fileType") as string // "preliminary" atau "final"

  if (!file || !competitionCode || !fileType) {
    return new NextResponse("Missing required fields (file, competitionCode, fileType)", { status: 400 })
  }

  // Buffer file (sudah benar)
  const fileBuffer = await file.arrayBuffer()
  const mime = file.type
  const encoding = "base64"
  const base64Data = Buffer.from(fileBuffer).toString("base64")
  const fileUri = "data:" + mime + ";" + encoding + "," + base64Data

  try {
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        
        // 4. Berikan tipe eksplisit pada options
        const options: UploadApiOptions = {
          folder: `uiso-submissions/${competitionCode}/${user.id}`,
          public_id: fileType,
          overwrite: true,
          resource_type: "auto", // Tipe ini sekarang valid
        }

        cloudinary.uploader.upload(fileUri, options, (error, result) => {
          if (result) {
            resolve(result)
          } else {
            reject(error)
          }
        })
      })
    }

    const result: any = await uploadToCloudinary()

    return NextResponse.json({
      message: "File uploaded successfully",
      secure_url: result.secure_url,
      public_id: result.public_id,
      folder: result.folder,
    })
  } catch (error: any) {
    console.error("Cloudinary upload error:", error)
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}