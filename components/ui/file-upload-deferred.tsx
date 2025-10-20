"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileIcon, ImageIcon } from "lucide-react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface FileUploadDeferredProps {
  label: string
  description?: string
  onFileSelect: (file: File | null) => void
  selectedFile?: File | null
  required?: boolean
  accept?: string
  maxSize?: number // in MB
}

export function FileUploadDeferred({
  label,
  description,
  onFileSelect,
  selectedFile,
  required = false,
  accept = "image/png,image/jpeg,.pdf",
  maxSize = 5,
}: FileUploadDeferredProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    setError("")

    // Validasi ukuran file
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB`)
      return false
    }

    // Validasi tipe file
    const allowedTypes = accept.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    const fileType = file.type

    const isValidType = allowedTypes.some(
      (allowedType) => fileType.match(allowedType.replace("*", ".*")) || allowedType === fileExtension,
    )

    if (!isValidType) {
      setError(`Tipe file tidak didukung. Yang diperbolehkan: ${accept}`)
      return false
    }

    return true
  }

  const handleFileSelect = (file: File): void => {
    if (validateFile(file)) {
      onFileSelect(file)
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
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setError("")
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

      {!selectedFile ? (
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
              >
                pilih file
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Maksimal {maxSize}MB • {accept.replace(/\*/g, "").replace(/\./g, "").toUpperCase()}
            </p>
            <Input ref={fileInputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />
          </CardContent>
        </Card>
      ) : (
        <Card className="border">
          <CardContent className="space-y-3 p-3">
            {/* Header file info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.name)}
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">File siap untuk diupload</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
    </div>
  )
}
