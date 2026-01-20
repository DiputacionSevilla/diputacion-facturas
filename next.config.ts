import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Desactivamos el MCP server para producción para evitar bloqueos en el build
  experimental: {
    mcpServer: false,
  },
}

export default nextConfig
