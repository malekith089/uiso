export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  message: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (rule.required && !value.trim()) {
      return rule.message
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message
    }
  }

  return null
}

export function validateForm(data: Record<string, string>, rules: ValidationRules): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field] || "", fieldRules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

// Common validation rules
export const commonRules = {
  email: [
    { required: true, message: "Email wajib diisi" },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format email tidak valid" },
  ],
  password: [
    { required: true, message: "Password wajib diisi" },
    { minLength: 8, message: "Password minimal 8 karakter" },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Password harus mengandung huruf besar, kecil, dan angka" },
  ],
  fullName: [
    { required: true, message: "Nama lengkap wajib diisi" },
    { minLength: 2, message: "Nama minimal 2 karakter" },
  ],
  identityNumber: [
    { required: true, message: "Nomor identitas wajib diisi" },
    { pattern: /^\d+$/, message: "Nomor identitas hanya boleh berisi angka" },
  ],
}
