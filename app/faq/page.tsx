'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, Mountain, Waves, Globe, Leaf} from 'lucide-react';

type QA = { q: string; a: string }

const generalFaq: QA[] = [
  {
    q: "Apa itu UISO?",
    a: "UISO (UI Science Olympiad) adalah kompetisi sains tingkat nasional yang diselenggarakan oleh Departemen Keilmuan BEM FMIPA Universitas Indonesia untuk siswa SMA/MA sederajat dan mahasiswa. Terdapat tiga kategori lomba: Olimpiade Sains Pelajar (OSP), Esai Gagasan Kritis (EGK), dan Study Case Competition (SCC).",
  },
  {
    q: "Siapa saja yang boleh mengikuti UISO?",
    a: "UISO terbuka untuk seluruh siswa SMA/MA sederajat dari seluruh Indonesia dan mahasiswa, baik berstatus negeri maupun swasta.",
  },
  {
    q: "Apakah mahasiswa yang berkuliah di luar negeri boleh mengikuti perlombaan UISO??",
    a: "Diperbolehkan dengan catatan dapat menunjukkan bukti sebagai Warga Negara Indonesia asli dan bersedia mengirimkan karya berbahasa Indonesia serta menyesuaikan waktu WIB dalam tahap presentasi saat final.",
  },
  {
    q: "Bagaimana cara mendaftar UISO 2025?",
    a: "Pendaftaran dilakukan secara online melalui website resmi uiso.net. Peserta perlu mengisi formulir, mengunggah dokumen yang diminta, dan melakukan pembayaran biaya registrasi sesuai ketentuan.",
  },
  {
    q: "Kapan periode pendaftaran UISO 2025?",
    a: "Pendaftaran dibuka pada 23 Agustus 2025 dan ditutup pada 17 Oktober 2025.",
  },
  {
    q: "Apakah ada biaya pendaftaran?",
    a: "Ya, setiap kategori lomba memiliki biaya pendaftaran yang ditetapkan panitia. Informasi nominal biaya tersedia pada laman pendaftaran masing-masing kategori.",
  },
  {
    q: "Apakah peserta boleh mengikuti lebih dari satu kategori lomba?",
    a: "Tidak, peserta tidak diperbolehkan mengikuti lebih dari satu kategori lomba.",
  },
  {
    q: "Bagaimana jika saya mengalami kendala teknis saat mendaftar?",
    a: "Peserta dapat menghubungi Contact Person resmi UISO yang tersedia di website atau media sosial untuk mendapatkan bantuan teknis.",
  },
  {
    q: "Apakah kompetisi ini dilaksanakan secara online atau offline?",
    a: "Babak penyisihan dilakukan secara online, sementara babak final untuk OSP akan dilaksanakan secara offline di Universitas Indonesia (Depok).",
  },
  {
    q: "Apakah akan ada sertifikat untuk peserta?",
    a: "Ya, seluruh peserta akan mendapatkan e-sertifikat, sedangkan pemenang akan mendapatkan sertifikat prestasi dalam bentuk fisik dan hadiah sesuai ketentuan panitia.",
  },
  {
    q: "Apakah ada sesi tambahan selain lomba?",
    a: "Ya, akan ada seminar lingkungan, campus tour, serta kegiatan grand opening dan grand closing.",
  },
  {
    q: "Apakah semua kategori lomba UISO 2025 mengusung tema yang sama?",
    a: "Ya, seluruh kategori lomba UISO 2025 mengangkat tema besar Langkah Kecil untuk Dunia yang Berseri dengan fokus pada isu lingkungan dan perubahan iklim.",
  },
  {
    q: "Bagaimana sistem gelombang pendaftaran dan biayanya?",
    a: "Ada tiga gelombang: Early Bird (Rp50.000), Batch 1 (Rp60.000—75.000 tergantung kategori), dan Batch 2 (Rp75.000—100.000). Nominal berbeda tiap kategori, sesuai booklet resmi.",
  },
  {
    q: "Apakah biaya pendaftaran bisa dikembalikan jika peserta batal ikut?",
    a: "Tidak. Biaya pendaftaran yang sudah dibayarkan tidak dapat dikembalikan dengan alasan apapun.",
  },
  {
    q: "Apakah peserta harus mengikuti akun Instagram UISO?",
    a: "Ya, peserta diwajibkan mengikuti akun Instagram @uiso.2025, mengunggah twibbon, serta repost pamflet lomba sesuai instruksi masing-masing kategori.",
  },
  {
    q: "Bagaimana cara panitia memberikan informasi resmi ke peserta?",
    a: "Informasi resmi disampaikan melalui website UISO, grup WhatsApp peserta, dan akun Instagram @uiso.2025.",
  },
  {
    q: "Apakah uang pendaftaran yang sudah ditransfer dapat dikembalikan?",
    a: "Tidak bisa dikembalikan dengan alasan apapun.",
  },
  { q: "Di mana saya bisa mengakses link twibbon?", a: "https://bingkai.in/uiso2025" },
]

const ospFaq: QA[] = [
  {
    q: "Bidang apa saja yang dilombakan dalam OSP?",
    a: "OSP meliputi 6 bidang sains: Matematika, Fisika, Kimia, Biologi, Geografi, dan Kebumian.",
  },
  { q: "Apakah lomba OSP dilakukan secara individu atau tim?", a: "OSP dilaksanakan secara individu." },
  {
    q: "Bagaimana format lomba OSP?",
    a: "OSP terdiri dari dua babak: penyisihan secara online (soal pilihan ganda) dan final secara offline di UI (soal pilihan ganda dan isian singkat).",
  },
  {
    q: "Apakah soal OSP sesuai kurikulum sekolah?",
    a: "Ya, soal OSP disusun berdasarkan kurikulum SMA/MA serta dikembangkan untuk menguji kemampuan analisis dan pemahaman konsep sains.",
  },
  {
    q: "Apakah peserta boleh memilih lebih dari satu bidang OSP?",
    a: "Tidak, setiap peserta hanya dapat memilih satu bidang sains dalam kategori OSP.",
  },
  {
    q: "Apakah soal OSP setara dengan OSN?",
    a: "Ya, materi OSP berstandar Olimpiade Sains Nasional (OSN) tingkat SMA/MA.",
  },
  {
    q: "Apakah ada subtema khusus tiap bidang OSP?",
    a: "Ada. Contoh: Matematika (pemodelan iklim), Fisika (energi terbarukan), Kimia (solusi ramah lingkungan), Biologi (keberlanjutan ekosistem), Geografi (perencanaan ruang), Kebumian (dinamika bumi). Detail kisi-kisi ada pada booklet.",
  },
  {
    q: "Bagaimana sistem ujian penyisihan OSP?",
    a: "Penyisihan dilakukan secara daring melalui platform e-ujian.com dengan pengawasan via Zoom. Peserta wajib login dengan username dan password yang diberikan panitia.",
  },
  {
    q: "Apa aturan teknis saat penyisihan?",
    a: "Peserta wajib memakai 2 device (1 untuk layar ujian, 1 untuk kamera pengawasan), menyalakan kamera, memakai seragam sekolah, tidak boleh pakai virtual background, dan harus tetap terlihat di kamera selama ujian.",
  },
  {
    q: "Apa yang terjadi jika peserta mengalami kendala listrik atau sinyal saat penyisihan?",
    a: "Kendala teknis menjadi tanggung jawab peserta. Panitia tidak memberikan tambahan waktu atau pengulangan ujian.",
  },
  {
    q: "Berapa banyak peserta yang lolos ke babak final OSP?",
    a: "Sebanyak 40 peserta dengan nilai terbaik dari tiap bidang akan lolos ke babak final.",
  },
  {
    q: "Bagaimana apabila belum mempunyai kartu pelajar?",
    a: "Dapat menggunakan surat keterangan siswa aktif yang dimintakan ke pihak TU sekolah atau menggunakan scan rapor SMA pada lembar identitas.",
  },
  { q: "Apa hadiah khusus bagi Top 10?", a: "Top 10 akan mendapatkan sertifikat dan uang pembinaan Rp250.000." },
  {
    q: "Apakah bisa berpindah bidang lomba?",
    a: "Apabila sudah terdaftar, tidak bisa berpindah bidang lomba yang lain.",
  },
]

const egkFaq: QA[] = [
  {
    q: "Apa yang dimaksud dengan EGK?",
    a: "EGK adalah kompetisi menulis esai untuk mahasiswa yang menekankan pada kemampuan analisis kritis dan inovasi gagasan terhadap isu-isu sains, lingkungan, dan teknologi.",
  },
  { q: "Apakah EGK dilakukan individu atau tim?", a: "EGK dilaksanakan secara individu." },
  { q: "Apa tema besar EGK 2025?", a: "Tema besar dapat dibaca dalam booklet." },
  {
    q: "Bagaimana format penilaian EGK?",
    a: "Penilaian mencakup orisinalitas gagasan, kedalaman analisis, relevansi dengan tema, serta kualitas penulisan akademik.",
  },
  {
    q: "Apakah ada batas jumlah kata pada esai?",
    a: "Ya, esai harus mengikuti ketentuan jumlah kata yang telah ditentukan dalam panduan teknis.",
  },
  {
    q: "Bagaimana tahapannya?",
    a: "Peserta mengirimkan naskah esai (submission online), kemudian finalis terpilih akan mempresentasikan esainya dalam bentuk Power Point. Untuk tahap final dilaksanakan secara online pada room Zoom.",
  },
  {
    q: "Siapa yang boleh ikut EGK?",
    a: "Mahasiswa aktif D3/D4/S1 dari perguruan tinggi, dibuktikan dengan KTM atau surat keterangan mahasiswa.",
  },
  { q: "Apakah peserta boleh mengirim lebih dari satu esai?", a: "Tidak. Peserta hanya boleh mengirimkan satu esai." },
  {
    q: "Bagaimana format penulisan esai?",
    a: "Esai wajib menggunakan template resmi pada http://bit.ly/BookletLombaUISO2025, panjang 1.500—2.000 kata, font Times New Roman 12, spasi 1,5, margin 4-3-3-3 cm, dan gaya kutipan APA 7th edition.",
  },
  {
    q: "Apakah boleh revisi setelah submit?",
    a: "Tidak. Peserta hanya dapat melakukan satu kali submisi esai dan tidak bisa revisi setelah dikirim.",
  },
  { q: "Bagaimana aturan plagiasi?", a: "Esai dengan plagiasi lebih dari 25% akan didiskualifikasi." },
  {
    q: "Bagaimana format nama file esai?",
    a: "Esai dikirim dalam bentuk PDF dengan format: Esai Gagasan Kritis_Nama Lengkap_Judul Esai.",
  },
  {
    q: "Bagaimana sistem seleksi finalis?",
    a: "10 peserta dengan nilai esai tertinggi akan dipilih sebagai finalis dan wajib mempresentasikan esainya via Zoom.",
  },
  {
    q: "Apakah ada penghargaan khusus selain juara?",
    a: "Ada. Selain juara 1—3, juga ada kategori Best Presentation dengan hadiah Rp500.000",
  },
]

const sccFaq: QA[] = [
  {
    q: "Apa itu SCC?",
    a: "SCC adalah kompetisi berbasis studi kasus yang menguji kemampuan peserta dalam menganalisis, merancang solusi, dan mempresentasikan ide terkait isu sains dan lingkungan.",
  },
  { q: "Apakah SCC dilakukan individu atau tim?", a: "SCC dilaksanakan dalam bentuk tim (1-3 orang per tim)." },
  {
    q: "Apa format lomba SCC?",
    a: "Tahapan terdiri dari submission proposal studi kasus, seleksi berkas, kemudian presentasi langsung di babak final.",
  },
  {
    q: "Bagaimana kriteria penilaian SCC?",
    a: "Penilaian mencakup kreativitas solusi, relevansi dengan studi kasus, kelayakan implementasi, serta kualitas presentasi.",
  },
  {
    q: "Apakah tema dan subtema studi kasus diberikan panitia?",
    a: "Ya, dapat dibaca di booklet http://bit.ly/BookletLombaUISO2025",
  },
  {
    q: "Apakah ada kasus tertentu yang harus diselesaikan dalam lomba ini?",
    a: "Ya, panitia akan memberikan kasus tertentu yang harus dianalisis peserta. Rilis handbook kasus akan dipublikasikan dalam laman resmi Instagram UISO 2025 dan akan diberitahukan pada grup peserta.",
  },
  {
    q: "Apakah ada batasan jumlah tim dari satu universitas?",
    a: "Tidak ada batasan, selama setiap tim memiliki anggota yang berbeda.",
  },
  { q: "Apakah peserta SCC boleh juga ikut kategori lain?", a: "Tidak." },
  {
    q: "Siapa yang boleh ikut SCC?",
    a: "Mahasiswa aktif D3/D4/S1, satu tim terdiri dari 1—3 orang dari universitas yang sama, boleh berbeda program studi.",
  },
  {
    q: "Apakah boleh mengirim lebih dari satu tim dari satu kampus?",
    a: "Ya, satu perguruan tinggi boleh mengirim lebih dari satu tim.",
  },
  {
    q: "Bagaimana sistem seleksi awal SCC?",
    a: "Peserta mengirim abstrak solusi sesuai format. 10 tim terbaik akan lolos ke tahap final.",
  },
  {
    q: "Bagaimana aturan plagiasi pada abstrak?",
    a: "Plagiasi di atas 20% dikenakan pengurangan poin. Plagiasi di atas 40% akan menyebabkan diskualifikasi.",
  },
  {
    q: "Apa format pitch deck untuk final?",
    a: "Pitch deck maksimal 18 slide, dikumpulkan antara 10—21 November 2025, lalu dipresentasikan pada 23 November 2025 secara online melalui Zoom.",
  },
  {
    q: "Bagaimana sistem penilaian akhir SCC?",
    a: "Nilai akhir merupakan akumulasi: abstrak (60%) dan pitch deck (40%).",
  },
  {
    q: "Apakah tim boleh diganti setelah mendaftar?",
    a: "Tidak. Tim yang sudah terdaftar tidak dapat diganti atau dialihkan ke pihak lain.",
  },
  { q: "Apa hadiah tambahan selain juara?", a: "Ada kategori Best Presentation dengan hadiah Rp500.000" },
  {
    q: "Jika solusi yang ditawarkan adalah sebuah produk, apakah harus membuat produk fisiknya?",
    a: "Tidak harus, tetapi boleh saja jika ingin membuat fisiknya.",
  },
  {
    q: "Apakah rangkaian acara tersebut offline atau online?",
    a: "Untuk babak penyisihan dan final studycase, akan dilaksanakan secara online, tetapi rangkaian acara UISO 2025 lainnya ada kemungkinan offline.",
  },
]

// Tab icons for each category
const tabIcons = {
  general: Globe,
  osp: Mountain,
  egk: Leaf,
  scc: Waves
}

function AccordionItem({ item, index, isOpen, onToggle }: { 
  item: QA, 
  index: number, 
  isOpen: boolean, 
  onToggle: () => void 
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex justify-between items-start gap-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
      >
        <span className="text-slate-800 font-medium text-lg leading-relaxed">{item.q}</span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 text-slate-600 leading-relaxed bg-gradient-to-r from-slate-50 to-blue-50/50">
          {renderAnswer(item.a)}
        </div>
      </div>
    </div>
  )
}

function FaqList({ items }: { items: QA[] }) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="w-full">
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          item={item}
          index={idx}
          isOpen={openItems.has(idx)}
          onToggle={() => toggleItem(idx)}
        />
      ))}
    </div>
  )
}

// Convert text with URLs to anchor tags for better UX
function renderAnswer(text: string) {
  const urlRegex = /(https?:\/\/[^\s)"]+)/g
  const parts = text.split(urlRegex)
  return (
    <p className="whitespace-pre-line">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = React.useState('general')

  const tabs = [
    { id: 'general', label: 'General', data: generalFaq },
    { id: 'osp', label: 'OSP', data: ospFaq },
    { id: 'egk', label: 'EGK', data: egkFaq },
    { id: 'scc', label: 'SCC', data: sccFaq }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-teal-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-60 left-1/2 w-16 h-16 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-24">
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali</span>
          </Link>
        </div>

        {/* Header with environmental theme */}
        <header className="mb-12 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              {/* Logo container with subtle shadow */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Image
                  src="/images/uiso-logo.webp" // Ganti dengan path logo Anda
                  alt="UISO 2025 Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                UISO 2025
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
          </div>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-2">
            Temukan jawaban seputar UISO 2025
          </p>
          
          <div className="max-w-2xl mx-auto p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm">
            <p className="text-slate-600">
              Untuk panduan lengkap, silakan lihat booklet resmi{" "}
              <a
                href="http://bit.ly/BookletLombaUISO2025"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium"
              >
                di sini
              </a>
            </p>
          </div>
        </header>

        {/* Enhanced tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
            {tabs.map((tab) => {
              const IconComponent = tabIcons[tab.id as keyof typeof tabIcons]
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content sections */}
        <div className="mb-12">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`transition-all duration-500 ${
                activeTab === tab.id
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-4 absolute pointer-events-none'
              }`}
            >
              {activeTab === tab.id && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 md:p-8 shadow-lg">
                  <FaqList items={tab.data} />
                  
                  {/* Additional info for specific tabs */}
                  {tab.id !== 'general' && (
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-400">
                      <p className="text-sm text-slate-600">
                        {tab.id === 'osp' && "Lihat kisi-kisi dan detail materi di booklet "}
                        {tab.id === 'egk' && "Template & ketentuan lengkap tersedia pada booklet "}
                        {tab.id === 'scc' && "Lihat pedoman kasus & detail tahapan pada booklet "}
                        <a
                          href="http://bit.ly/BookletLombaUISO2025"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium"
                        >
                          UISO 2025
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200">
          <p className="text-slate-600">
            Perlu bantuan lebih lanjut? Hubungi CP resmi melalui situs atau Instagram{" "}
            <a
              href="https://instagram.com/uiso.2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800 font-medium"
            >
              @uiso.2025
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}