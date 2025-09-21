/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Hapus 'domains' dan ganti dengan 'remotePatterns'
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'placeholder.svg', // Sesuaikan dengan hostname sumber gambar
        port: '',
        pathname: '/**',
      },
      // Tambahkan pattern lain jika ada sumber gambar eksternal lainnya
    ],
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
