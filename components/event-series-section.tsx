export function EventSeriesSection() {
  const events = [
    {
      title: "Roadshow",
      description: "Kunjungan ke berbagai sekolah di seluruh Indonesia untuk memperkenalkan UISO dan memberikan workshop persiapan kompetisi.",
      image: "/images/roadshow.jpg",
      date: "Agustus - Oktober 2025",
    },
    {
      title: "Grand Opening & Webinar",
      description: "Pembukaan resmi UISO 2025 dengan webinar inspiratif dari para ahli sains dan teknologi terkemuka.",
      image: "",
      date: "19 Oktober 2025",
    },
    {
      title: "Seminar Lingkungan",
      description: "Seminar khusus tentang isu-isu lingkungan terkini dan solusi berkelanjutan untuk masa depan yang lebih hijau.",
      image: "",
      date: "29 November 2025",
    },
    {
      title: "Campus Tour",
      description:
        "Tur eksklusif ke kampus Universitas Indonesia dengan kunjungan ke laboratorium dan fasilitas penelitian terdepan.",
      image: "",
      date: "29 November 2025",
    },
    {
      title: "Grand Closing & Awarding Day",
      description: "Penutupan UISO 2025 dengan pengumuman pemenang dan penyerahan hadiah kepada para juara kompetisi.",
      image: "",
      date: "30 November",
    },
  ]

  return (
    <section id="rangkaian-acara" className="py-20 bg-accent/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 font-heading tracking-heading leading-normal py-1">
            Rangkaian Acara UISO
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Serangkaian acara menarik yang dirancang untuk memberikan pengalaman komprehensif kepada seluruh peserta
          </p>
        </div>

        <div className="space-y-16">
          {events.map((event, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 lg:gap-12`}
            >
              <div className="flex-1">
                {event.image ? (
                  // JIKA ADA GAMBAR, tampilkan blok ini
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-80 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black opacity-15 rounded-2xl"></div>
                  </div>
                ) : (
                  // JIKA TIDAK ADA GAMBAR, tampilkan placeholder ini
                  <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-slate-200 shadow-lg">
                    <span className="font-medium text-slate-500">Coming Soon!</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-6">
                <div className="inline-block bg-gradient-to-r from-accent/20 to-accent-light/20 text-primary px-4 py-2 rounded-full text-sm font-medium border border-accent/30">
                  {event.date}
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {event.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
