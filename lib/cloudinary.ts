import { v2 as cloudinary } from "cloudinary"

// Server-side configuration (only runs on server)
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export default cloudinary

// Client-side upload function using Cloudinary's upload API directly
export const uploadToCloudinary = async (file: File, folder = "uiso-2025") => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)
    
    // Use your API route instead of direct Cloudinary API
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    const data = await response.json()
    return {
      success: data.success,
      url: data.url,
      public_id: data.public_id,
      error: data.error,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}
