export function PartnersSection() {
  const partners = [
    { name: "Universitas Indonesia", logo: "/placeholder.svg?height=80&width=120&text=UI" },
    { name: "Kementerian Pendidikan", logo: "/placeholder.svg?height=80&width=120&text=Kemendikbud" },
    { name: "LIPI", logo: "/placeholder.svg?height=80&width=120&text=LIPI" },
    { name: "BRIN", logo: "/placeholder.svg?height=80&width=120&text=BRIN" },
    { name: "Telkom Indonesia", logo: "/placeholder.svg?height=80&width=120&text=Telkom" },
    { name: "Bank Mandiri", logo: "/placeholder.svg?height=80&width=120&text=Mandiri" },
    { name: "Pertamina", logo: "/placeholder.svg?height=80&width=120&text=Pertamina" },
    { name: "Gojek", logo: "/placeholder.svg?height=80&width=120&text=Gojek" },
    { name: "Tokopedia", logo: "/placeholder.svg?height=80&width=120&text=Tokopedia" },
    { name: "Shopee", logo: "/placeholder.svg?height=80&width=120&text=Shopee" },
  ]

  return (
    <section id="partner" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Didukung Oleh
          </h2>
          <p className="text-lg text-gray-600">Partner dan sponsor yang mendukung penyelenggaraan UISO 2025</p>
        </div>

        <div className="scroll-container">
          <div className="scroll-content flex items-center gap-12">
            {/* First set of logos */}
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-primary/10 hover:border-primary/30"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {partners.map((partner, index) => (
              <div
                key={`duplicate-${index}`}
                className="flex-shrink-0 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-primary/10 hover:border-primary/30"
              >
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
