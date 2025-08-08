/** @type {import('next').NextConfig} */
const nextConfig = {
  // Loại bỏ experimental.appDir vì đã deprecated
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 