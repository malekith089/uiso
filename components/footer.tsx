import { SiTiktok, SiInstagram } from "react-icons/si";
import { Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/images/uiso-logo.png"
                alt="UISO 2025 Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
              <span className="text-white font-bold text-2xl">UISO 2025</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              UI Science Olympiad adalah kompetisi sains tingkat nasional yang diselenggarakan oleh Universitas
              Indonesia untuk mengembangkan minat dan bakat siswa dalam bidang sains dan teknologi.
            </p>
            <div className="flex gap-4">
              <a
                href="http://www.instagram.com/uiso.2025/"
                className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center hover:from-accent-light hover:to-accent transition-all duration-300 shadow-lg"
              >
                <SiInstagram className="w-5 h-5 text-primary" />
              </a>
              <a
                href="https://www.tiktok.com/@uiso.2025"
                className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-full flex items-center justify-center hover:from-accent-light hover:to-accent transition-all duration-300 shadow-lg"
              >
                <SiTiktok className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          {/* <div>
            <h3 className="text-xl font-bold mb-6 text-accent-light">Navigasi Cepat</h3>
            <ul className="space-y-3">
              <li>
                <a href="#beranda" className="text-gray-300 hover:text-white transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#tentang" className="text-gray-300 hover:text-white transition-colors">
                  Tentang
                </a>
              </li>
              <li>
                <a href="#lomba" className="text-gray-300 hover:text-white transition-colors">
                  Lomba
                </a>
              </li>
              <li>
                <a href="#rangkaian-acara" className="text-gray-300 hover:text-white transition-colors">
                  Rangkaian Acara
                </a>
              </li>
              <li>
                <a href="#timeline" className="text-gray-300 hover:text-white transition-colors">
                  Timeline
                </a>
              </li>
              <li>
                <a href="#testimoni" className="text-gray-300 hover:text-white transition-colors">
                  Testimoni
                </a>
              </li>
            </ul>
          </div> */}

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-accent-light">Kontak</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-gray-300">Universitas Indonesia, Depok</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-gray-300">Amirah (081808833176)</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-gray-300">Moza (082286880294)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 UI Science Olympiad. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
