"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    // { name: "Beranda", href: "#beranda" },
    { name: "Tentang", href: "#tentang" },
    { name: "Lomba", href: "#lomba" },
    { name: "Rangkaian Acara", href: "#rangkaian-acara" },
    { name: "Timeline", href: "#timeline" },
    // { name: "Testimoni", href: "#testimoni" },
    // { name: "Partner", href: "#partner" },
    {
      name: "TO TKA",
      href: "https://web.analitica.id/explore/%23p2025.uiso",
      external: true,
    },
  ]

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      e.preventDefault()
      const targetId = href.substring(href.lastIndexOf("#") + 1)

      // --- PERBAIKAN DI SINI ---
      // Jika targetId kosong (artinya link ke # atau /#), scroll ke atas halaman
      if (targetId === "") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
        return
      }
      // -------------------------

      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* --- PERBAIKAN DI SINI --- */}
          <Link
            href="/#"
            onClick={e => handleScroll(e, "/#")}
            className="flex items-center gap-3"
          >
            <Image
              src="/images/uiso-logo.webp"
              alt="UISO 2025 Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain cursor-pointer"
            />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-2xl font-logo">
              UISO
            </span>
          </Link>
          {/* ------------------------- */}

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map(item =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={e => handleScroll(e, item.href)}
                  className="text-gray-700 hover:text-primary font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ),
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-primary font-medium"
              >
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-accent-foreground px-6 shadow-lg">
                Daftar Sekarang
              </Button>
            </Link>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map(item =>
                    item.external ? (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-primary font-medium py-2"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={e => handleScroll(e, item.href)}
                        className="text-gray-700 hover:text-primary font-medium py-2"
                      >
                        {item.name}
                      </Link>
                    ),
                  )}
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login">
                      <Button variant="outline" className="w-full bg-transparent">
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-accent-foreground shadow-lg">
                        Daftar Sekarang
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

