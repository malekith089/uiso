"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileIcon, ImageIcon } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/error-handler"

interface FileUploadProps {
  label: string
  description?: string
  onUpload: (url: string) => void
  value?: string
  required?: boolean
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({
  label,
  description,
  onUpload,
  value,
  required = false,
  accept = "image/png,image/jpeg,.pdf",
  maxSize = 2,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      showErrorToast(new Error(`File terlalu besar. Maksimal ${maxSize}MB`))
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload gagal")
      }

      const data = await response.json()
      onUpload(data.url)
      showSuccessToast("File berhasil diupload")
    } catch (error) {
      showErrorToast(error, "handleFileSelect")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemove = () => {
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (filename: string) => {
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

      {!value ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
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
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {getFileIcon(value)}
              <span className="text-sm font-medium truncate max-w-[200px]">
                {value.split("/").pop() || "File uploaded"}
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isUploading}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Mengupload file...
        </div>
      )}
    </div>
  )
}