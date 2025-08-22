export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Andi Pratama",
      school: "SMA Negeri 1 Jakarta",
      year: "Juara 1 OSP Fisika 2024",
      quote:
        "UISO memberikan pengalaman luar biasa! Kompetisinya menantang dan membuat saya semakin termotivasi untuk belajar fisika. Terima kasih UISO!",
      image: "/placeholder.svg?height=100&width=100&text=Andi",
    },
    {
      name: "Sari Dewi",
      school: "SMA Negeri 3 Surabaya",
      year: "Juara 2 SCC 2024",
      quote:
        "Melalui UISO, saya belajar banyak tentang kreativitas dalam sains. Tim saya berhasil menciptakan inovasi yang bermanfaat untuk lingkungan.",
      image: "/placeholder.svg?height=100&width=100&text=Sari",
    },
    {
      name: "Budi Santoso",
      school: "SMA Negeri 5 Bandung",
      year: "Juara 1 EGK 2024",
      quote:
        "Kompetisi EGK membuka mata saya tentang pentingnya menjaga lingkungan. Ilmu yang didapat sangat aplikatif untuk kehidupan sehari-hari.",
      image: "/placeholder.svg?height=100&width=100&text=Budi",
    },
  ]

  return (
    <section id="testimoni" className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-tertiary/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Kata Mereka Tentang UISO
          </h2>
          <p className="text-lg text-gray-600">Testimoni dari para alumni UISO yang telah merasakan manfaatnya</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-t-4 border-primary"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-primary text-lg">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.school}</p>
                  <p className="text-accent text-sm font-medium">{testimonial.year}</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
