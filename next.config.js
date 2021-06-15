module.exports = {
  async rewrites() {
    return [
      {
        source: '/npmjs/:path*',
        destination: 'https://registry.npmjs.org/:path*',
      },
    ]
  },
}
