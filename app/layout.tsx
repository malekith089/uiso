import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google" // Mengganti GeistSans dengan Poppins
import localFont from "next/font/local"   // Untuk memuat font dari file lokal
import { cn } from "@/lib/utils"           // Import cn utility untuk menggabungkan class
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "UISO 2025",
  description: "UI Science Olympiad 2025",
  icons: {
    icon: "/images/uiso-logo.png",
  },
}

// 1. Konfigurasi font Poppins untuk body
const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Sesuaikan weight yang dibutuhkan
  variable: "--font-poppins",
})

// 2. Konfigurasi font Adelia untuk logo
const fontAdelia = localFont({
  src: "/fonts/ADELIA.otf", // Pastikan path dan nama file benar
  display: "swap",
  variable: "--font-adelia",
})

// 3. Konfigurasi font Soopafresh untuk heading
const fontSoopafresh = localFont({
  src: "/fonts/soopafre.ttf", // Pastikan path dan nama file benar
  display: "swap",
  variable: "--font-soopafresh",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Gabungkan semua variabel font ke dalam tag <html> atau <body>
    <html lang="en" className={cn(
        fontPoppins.variable, 
        fontAdelia.variable, 
        fontSoopafresh.variable
      )}
    >
      {/* Hapus <head> dan <style> dari sini, karena `next/font` menanganinya */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}