"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, CheckCircle } from "lucide-react"

interface FileUploadProps {
  label: string
  accept?: string
  onUpload: (url: string) => void
  value?: string
  required?: boolean
  description?: string
}

export function FileUpload({
  label,
  accept = "image/*,.pdf",
  onUpload,
  value,
  required = false,
  description,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "uiso-2025/documents")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      if (result.success && result.url) {
        onUpload(result.url)
      } else {
        setUploadError(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {value ? (
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">File uploaded successfully</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
            />
            <Label htmlFor={`file-${label.replace(/\s+/g, "-").toLowerCase()}`} className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                </div>
                <div className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</div>
              </div>
            </Label>
          </div>
        )}
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
    </div>
  )
}