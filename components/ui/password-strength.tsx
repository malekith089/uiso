"use client"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "Lemah"
      case 2:
      case 3:
        return "Sedang"
      case 4:
      case 5:
        return "Kuat"
      default:
        return "Lemah"
    }
  }

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-red-500"
      case 2:
      case 3:
        return "bg-yellow-500"
      case 4:
      case 5:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  if (!password) return null

  const strength = getStrength(password)
  const strengthText = getStrengthText(strength)
  const strengthColor = getStrengthColor(strength)

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">{strengthText}</span>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p className={password.length >= 8 ? "text-green-600" : ""}>✓ Minimal 8 karakter</p>
        <p className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600" : ""}>
          ✓ Huruf besar dan kecil
        </p>
        <p className={/[0-9]/.test(password) ? "text-green-600" : ""}>✓ Minimal 1 angka</p>
      </div>
    </div>
  )
}
