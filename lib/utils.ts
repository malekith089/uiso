import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Optimize Cloudinary image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Target width for optimization (default: 400)
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(url: string | null, width: number = 400): string {
  if (!url) return "/placeholder.svg"
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url
  }
  
  try {
    // Split URL to insert transformations
    const parts = url.split('/upload/')
    if (parts.length !== 2) return url
    
    // Add transformations: auto format, auto quality, and width
    const transformations = `w_${width},f_auto,q_auto`
    
    return `${parts[0]}/upload/${transformations}/${parts[1]}`
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error)
    return url
  }
}