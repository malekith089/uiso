import { Award, Users, Trophy, Target } from "lucide-react"

export function AboutSection() {
  return (
    <section id="tentang" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Apa itu UISO?
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              UI Science Olympiad (UISO) adalah kompetisi sains tingkat nasional yang diselenggarakan oleh Universitas
              Indonesia. Acara ini bertujuan untuk mengembangkan minat dan bakat siswa dalam bidang sains dan teknologi,
              serta memberikan wadah bagi siswa-siswi terbaik Indonesia untuk berkompetisi dan menunjukkan kemampuan
              mereka.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              UISO menyelenggarakan berbagai kategori lomba yang mencakup Olimpiade Sains Pelajar (OSP), Study Case Competition (SCC), dan Esai Gagasan Kritis (EGK). Setiap kategori dirancang untuk
              menguji kemampuan peserta dalam berbagai aspek sains dan teknologi.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
