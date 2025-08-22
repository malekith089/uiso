"use client"

import { useState, useEffect } from "react"
import Link from 'next/link';

export function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date("2025-08-23T20:00:00").getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="beranda" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85"
        style={{
          backgroundImage: "url(/images/arctic-landscape.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"> {/* Hapus text-shadow dari sini */}
          <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent [text-stroke:5px_rgba(0,0,0,0.6)]">
            Countdown!
          </span>
          <br />
          <span className="text-white [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]"> {/* Pindahkan text-shadow ke sini */}
            Menuju UISO 2025!
          </span>
        </h1>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
          {[
            { label: "Hari", value: timeLeft.days },
            { label: "Jam", value: timeLeft.hours },
            { label: "Menit", value: timeLeft.minutes },
            { label: "Detik", value: timeLeft.seconds },
          ].map((item, index) => (
            <div key={index} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-sm md:text-base text-white/80 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">    
            <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              Daftar Sekarang
            </button>
          </Link>   
        </div>
      </div>
    </section>
  )
}
