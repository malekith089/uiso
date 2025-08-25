import { toast } from "@/hooks/use-toast"

export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: any
}

export class NetworkError extends Error implements AppError {
  code = "NETWORK_ERROR"
  statusCode = 0

  constructor(message = "Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.") {
    super(message)
    this.name = "NetworkError"
  }
}

export class ValidationError extends Error implements AppError {
  code = "VALIDATION_ERROR"
  statusCode = 400

  constructor(message = "Data yang dimasukkan tidak valid.") {
    super(message)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends Error implements AppError {
  code = "AUTH_ERROR"
  statusCode = 401

  constructor(message = "Sesi Anda telah berakhir. Silakan login kembali.") {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class PermissionError extends Error implements AppError {
  code = "PERMISSION_ERROR"
  statusCode = 403

  constructor(message = "Anda tidak memiliki izin untuk melakukan tindakan ini.") {
    super(message)
    this.name = "PermissionError"
  }
}

export class NotFoundError extends Error implements AppError {
  code = "NOT_FOUND"
  statusCode = 404

  constructor(message = "Data yang dicari tidak ditemukan.") {
    super(message)
    this.name = "NotFoundError"
  }
}

export class ServerError extends Error implements AppError {
  code = "SERVER_ERROR"
  statusCode = 500

  constructor(message = "Terjadi kesalahan pada server. Silakan coba lagi nanti.") {
    super(message)
    this.name = "ServerError"
  }
}

export function handleError(error: unknown, context?: string): AppError {
  console.error(`Error in ${context || "unknown context"}:`, error)

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new NetworkError()
  }

  // Handle Supabase errors
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as any

    switch (supabaseError.code) {
      case "PGRST116":
        return new NotFoundError("Data tidak ditemukan.")
      case "23505":
        return new ValidationError("Data sudah ada. Silakan gunakan data yang berbeda.")
      case "23503":
        return new ValidationError("Data yang direferensikan tidak valid.")
      case "42501":
        return new PermissionError()
      default:
        if (supabaseError.message) {
          return new ServerError(supabaseError.message)
        }
    }
  }

  // Handle authentication errors
  if (error && typeof error === "object" && "message" in error) {
    const errorMessage = (error as Error).message.toLowerCase()
    if (errorMessage.includes("auth") || errorMessage.includes("unauthorized")) {
      return new AuthenticationError()
    }
  }

  // Handle validation errors
  if (error instanceof Error && error.name === "ValidationError") {
    return new ValidationError(error.message)
  }

  // Default to server error
  if (error instanceof Error) {
    return new ServerError(error.message)
  }

  return new ServerError("Terjadi kesalahan yang tidak diketahui.")
}

export function showErrorToast(error: unknown, context?: string) {
  const appError = handleError(error, context)

  toast({
    title: "Terjadi Kesalahan",
    description: appError.message,
    variant: "destructive",
  })

  return appError
}

export function showSuccessToast(message: string) {
  toast({
    title: "Berhasil",
    description: message,
    variant: "default",
  })
}

// Retry utility
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) {
        throw error
      }

      // Don't retry on validation or permission errors
      if (error instanceof ValidationError || error instanceof PermissionError) {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}
