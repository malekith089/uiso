// File: components/ui/file-upload-optimized.tsx
// INSTRUKSI: Replace seluruh isi file dengan kode ini

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileIcon, ImageIcon, AlertCircle } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/error-handler"

interface FileUploadProps {
  label: string
  description?: string
  onUpload: (url: string) => void
  value?: string
  required?: boolean
  accept?: string
  maxSize?: number // in MB
  folder?: string
}

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  resource_type: string
  bytes: number
}

interface SignatureResponse {
  success: boolean
  timestamp: number
  signature: string
  api_key: string
  cloud_name: string
  folder: string
  error?: string
}

interface ServerUploadResponse {
  success: boolean
  url?: string
  secure_url?: string
  public_id?: string
  error?: string
}

export function FileUploadOptimized({
  label,
  description,
  onUpload,
  value,
  required = false,
  accept = "image/png,image/jpeg,.pdf",
  maxSize = 2,
  folder = "uiso-2025"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [useDirectUpload, setUseDirectUpload] = useState(true)
  const [uploadMethod, setUploadMethod] = useState<'direct' | 'server' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const renderPreview = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase()

  if (!ext) return null

  // Preview untuk gambar
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <img 
        src={url} 
        alt="Preview" 
        className="max-h-40 rounded border object-contain" 
      />
    )
  }

  // Preview untuk PDF
  if (ext === "pdf") {
    return (
      <iframe
        src={url}
        className="w-full h-40 border rounded"
      />
    )
  }

  // Default: tampilkan link download
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline text-sm"
    >
      Lihat file
    </a>
  )
}

  // Direct upload ke Cloudinary (OPTIMIZED - bypass server)
  const uploadDirectToCloudinary = async (file: File): Promise<string> => {
    try {
      console.log('🚀 Attempting direct upload to Cloudinary...')
      
      // Step 1: Get upload signature dari API route kita
      const signatureResponse = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder })
      })

      console.log('📊 Signature response:', {
        status: signatureResponse.status,
        statusText: signatureResponse.statusText
      })

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text()
        console.error('❌ Signature error response:', errorText)
        throw new Error(`Signature request failed: ${signatureResponse.status} - ${errorText}`)
      }

      let signatureData: SignatureResponse
      try {
        signatureData = await signatureResponse.json() as SignatureResponse
        console.log('✅ Got signature data:', { 
          ...signatureData, 
          signature: '[HIDDEN]', 
          api_key: '[HIDDEN]'
        })
      } catch (parseError) {
        console.error('❌ Failed to parse signature response')
        throw new Error('Invalid signature response format')
      }
      
      if (!signatureData.success) {
        throw new Error(signatureData.error || 'Failed to get signature')
      }

      // Step 2: Upload directly to Cloudinary
      const { timestamp, signature, api_key, cloud_name } = signatureData

      // Validate required fields
      if (!timestamp || !signature || !api_key || !cloud_name) {
        console.error('❌ Missing required signature fields:', { 
          timestamp: !!timestamp, 
          signature: !!signature, 
          api_key: !!api_key, 
          cloud_name: !!cloud_name 
        })
        throw new Error('Incomplete signature data')
      }

      // CRITICAL: FormData parameters - HANYA yang di-sign yang digunakan untuk validation
      const formData = new FormData()
      
      // File always first
      formData.append("file", file)
      
      // SIGNED PARAMETERS (harus match dengan server signature) - URUT ALFABETIS
      formData.append("folder", folder)
      formData.append("timestamp", timestamp.toString())
      
      // SIGNATURE & API KEY
      formData.append("api_key", api_key)
      formData.append("signature", signature)
      
      // ADDITIONAL PARAMETERS (tidak di-sign, tapi diperlukan Cloudinary)
      formData.append("resource_type", "auto")

      console.log('📤 Upload params:', {
        file_name: file.name,
        file_size: file.size,
        folder: folder,
        timestamp: timestamp,
        resource_type: "auto",
        api_key: '[HIDDEN]',
        signature: '[HIDDEN]'
      })

      console.log('📤 Starting direct upload to Cloudinary...')

      // Upload dengan progress tracking menggunakan XMLHttpRequest
      const uploadResponse = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Track progress
        xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
            console.log(`📊 Upload progress: ${progress}%`)
          }
        })

        xhr.addEventListener('load', () => {
          console.log('📊 Direct upload completed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseLength: xhr.responseText.length
          })

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText) as CloudinaryResponse
              console.log('✅ Direct upload response:', {
                secure_url: response.secure_url,
                public_id: response.public_id,
                resource_type: response.resource_type,
                bytes: response.bytes
              })
              resolve(response)
            } catch (parseError) {
              console.error('❌ Failed to parse Cloudinary response:', parseError)
              console.error('❌ Raw response:', xhr.responseText)
              reject(new Error('Invalid response from Cloudinary'))
            }
          } else {
            // Log error details for debugging
            let errorDetails = ''
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              errorDetails = JSON.stringify(errorResponse, null, 2)
              console.error('❌ Cloudinary error response:', errorResponse)
              
              // Check if it's signature error specifically
              if (errorResponse.error && errorResponse.error.message && errorResponse.error.message.includes('Invalid Signature')) {
                console.error('🔐 SIGNATURE DEBUG:', {
                  expected_string: errorResponse.error.message.match(/String to sign - '([^']*)'/)?.[1],
                  our_params: `folder=${folder}&timestamp=${timestamp}`,
                  match: errorResponse.error.message.includes(`folder=${folder}&timestamp=${timestamp}`)
                })
              }
            } catch {
              errorDetails = xhr.responseText
            }
            
            console.error('❌ Cloudinary upload failed:', xhr.status, errorDetails)
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}\nDetails: ${errorDetails}`))
          }
        })

        xhr.addEventListener('error', () => {
          console.error('❌ Network error during upload')
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('timeout', () => {
          console.error('❌ Upload timeout')
          reject(new Error('Upload timeout (2 minutes)'))
        })

        // Set timeout 2 menit
        xhr.timeout = 120000
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/upload`)
        xhr.send(formData)
      })

      if (!uploadResponse.secure_url) {
        console.error('❌ Missing secure_url in response:', uploadResponse)
        throw new Error('Invalid upload response: missing secure_url')
      }

      console.log('✅ Direct upload successful!')
      return uploadResponse.secure_url

    } catch (error) {
      console.error('❌ Direct upload failed:', error)
      throw error
    }
  }

  // Fallback: Upload via server (seperti implementasi lama)
  const uploadViaServer = async (file: File): Promise<string> => {
    try {
      console.log('🔄 Fallback: uploading via server...')
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      // DEBUGGING: Log response details
      console.log('📊 Server upload response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Handle different response scenarios
      if (!response.ok) {
        let errorMessage = `Server upload failed (${response.status})`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('❌ Server error response:', errorData)
        } catch (parseError) {
          // Jika response tidak bisa di-parse sebagai JSON
          console.error('❌ Failed to parse error response:', parseError)
          const textResponse = await response.text()
          console.error('❌ Raw error response:', textResponse)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      // Parse success response
      let data: ServerUploadResponse
      try {
        data = await response.json() as ServerUploadResponse
        console.log('✅ Server upload response data:', data)
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError)
        const textResponse = await response.text()
        console.error('❌ Raw success response:', textResponse)
        throw new Error('Invalid response format from server')
      }
      
      // Validate response structure
      if (!data) {
        throw new Error("Empty response from server")
      }

      // Handle different response formats dari API route /api/upload
      let uploadUrl: string
      
      if (data.success === true && data.url) {
        // Format baru: { success: true, url: "...", public_id: "..." }
        uploadUrl = data.url
      } else if (data.secure_url) {
        // Format langsung dari Cloudinary: { secure_url: "...", public_id: "..." }
        uploadUrl = data.secure_url
      } else if (data.url) {
        // Format alternatif: { url: "..." }
        uploadUrl = data.url
      } else {
        console.error('❌ Unexpected response format:', data)
        throw new Error('Invalid response format: missing URL')
      }

      console.log('✅ Server upload successful! URL:', uploadUrl)
      return uploadUrl

    } catch (error) {
      console.error('❌ Server upload failed:', error)
      throw error
    }
  }

  // Main upload handler dengan fallback logic
  const handleFileSelect = async (file: File): Promise<void> => {
    // Validasi ukuran file
    if (file.size > maxSize * 1024 * 1024) {
      showErrorToast(new Error(`File terlalu besar. Maksimal ${maxSize}MB`))
      return
    }

    // Validasi tipe file
    const allowedTypes = accept.split(',').map(type => type.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const fileType = file.type

    const isValidType = allowedTypes.some(allowedType => 
      fileType.match(allowedType.replace('*', '.*')) || 
      allowedType === fileExtension
    )

    if (!isValidType) {
      showErrorToast(new Error(`Tipe file tidak didukung. Yang diperbolehkan: ${accept}`))
      return
    }

    console.log('📁 Starting file upload:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      useDirectUpload,
      folder
    })

    setIsUploading(true)
    setUploadProgress(0)
    setUploadMethod(null)
    
    try {
      let uploadedUrl: string
      let actualMethod: 'direct' | 'server' = 'server' // default

      if (useDirectUpload) {
        try {
          // Coba direct upload dulu
          uploadedUrl = await uploadDirectToCloudinary(file)
          actualMethod = 'direct'
          console.log('✅ Upload completed via direct method')
        } catch (directError) {
          console.warn('⚠️ Direct upload failed, falling back to server upload')
          console.warn('Direct upload error:', directError)
          
          // Set flag untuk tidak mencoba direct upload lagi di session ini
          setUseDirectUpload(false)
          
          // Fallback ke server upload
          setUploadProgress(0) // Reset progress untuk server upload
          uploadedUrl = await uploadViaServer(file)
          actualMethod = 'server'
          console.log('✅ Upload completed via server fallback')
        }
      } else {
        // Langsung pakai server upload
        uploadedUrl = await uploadViaServer(file)
        actualMethod = 'server'
        console.log('✅ Upload completed via server method')
      }
      
      if (!uploadedUrl) {
        throw new Error('Upload completed but no URL returned')
      }

      console.log('🎉 Final upload URL:', uploadedUrl)
      setUploadMethod(actualMethod) // Set method setelah upload selesai
      onUpload(uploadedUrl)
      
      const successMessage = `File berhasil diupload`
      showSuccessToast(successMessage)
      
    } catch (error) {
      console.error('❌ All upload methods failed:', error)
      
      // Better error message for user
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Upload gagal dengan alasan yang tidak diketahui'
        
      showErrorToast(new Error(`Upload gagal: ${errorMessage}`), "File Upload")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemove = (): void => {
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (filename: string): JSX.Element => {
    const extension = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="w-4 h-4" />
    }
    return <FileIcon className="w-4 h-4" />
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && <p className="text-xs text-gray-500">{description}</p>}

      {/* Upload method indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400">
          Mode: {useDirectUpload ? 'Direct Upload' : 'Server Upload'}
          {uploadMethod && ` | Last: ${uploadMethod}`}
        </div>
      )}

      {!value ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center mb-2">
              Drag & drop file di sini atau{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
                disabled={isUploading}
              >
                pilih file
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Maksimal {maxSize}MB • {accept.replace(/\*/g, "").replace(/\./g, "").toUpperCase()}
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border">
  <CardContent className="space-y-3 p-3">
    {/* Header file info */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {getFileIcon(value)}
        <span className="text-sm font-medium truncate max-w-[200px]">
          {value.split("/").pop() || "File uploaded"}
        </span>
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={handleRemove} 
        disabled={isUploading}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>

    {/* Preview section */}
    <div>
      {renderPreview(value)}
    </div>
  </CardContent>
</Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>
              Mengupload file... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
              {uploadMethod && <span className="text-xs text-gray-400 ml-1">({uploadMethod})</span>}
            </span>
          </div>
          
          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Fallback indicator */}
          {!useDirectUpload && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>Menggunakan backup upload method</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}