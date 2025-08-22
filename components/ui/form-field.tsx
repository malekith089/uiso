"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormFieldProps {
  label: string
  id: string
  name: string
  type?: "text" | "email" | "password" | "select"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  options?: { value: string; label: string }[]
  className?: string
}

export function FormField({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  options,
  className = "",
}: FormFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSelectChange = (value: string) => {
    onChange(value)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className={error ? "text-red-600" : ""}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "select" ? (
        <Select onValueChange={handleSelectChange} value={value}>
          <SelectTrigger className={`h-11 ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          required={required}
          className={`h-11 ${error ? "border-red-500" : ""}`}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
