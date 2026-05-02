/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // admin.ruonalim.com → editorial portal
      {
        has: [{ type: 'host', value: 'admin.ruonalim.com' }],
        source: '/:path*',
        destination: '/editorial.html',
      },
      // Serve static HTML pages from public/
      { source: '/', destination: '/index.html' },
      { source: '/writing', destination: '/writing.html' },
      { source: '/fintech-design', destination: '/fintech-design.html' },
      { source: '/fractional-design-leadership', destination: '/fractional-design-leadership.html' },
    ]
  },
}

module.exports = nextConfig
