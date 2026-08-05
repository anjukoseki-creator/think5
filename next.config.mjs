/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow access through public tunnels (cloudflared / localtunnel) in dev:
  // without these, Next.js blocks cross-origin Server Actions (login/submit).
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "*.loca.lt", "localhost:3100"],
    },
  },
};

export default nextConfig;
