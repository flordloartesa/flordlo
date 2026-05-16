import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ OBRIGATÓRIO: Isola estes pacotes do empacotador (bundler)
  serverExternalPackages: [
    "argon2",
    "@mapbox/node-pre-gyp",
    "next-auth-sanity",
    "nock",
    "mock-aws-s3",
    "aws-sdk",
    "bcryptjs",
    "canvas"
  ],

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'meditt.space', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: '66.media.tumblr.com' },
      { protocol: 'https', hostname: '64.media.tumblr.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'http', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'googleusercontent.com' },
      { protocol: 'http', hostname: 'googleusercontent.com' }
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      // ==========================================
      // 0. BLOQUEIO DE PAÍSES (GEO-BLOCKING ANTI-BOTS)
      // ==========================================
    
      // Regra para quando estás alojado na VERCEL:
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-vercel-ip-country',
            // Lista expandida de países com alto volume de tráfego malicioso/spam
            value: '^(CN|IN|RU|TR|IR|KP|VN|UA|BY|PK|ID|NG|BD|CV|MZ|AO)$', 
          },
        ],
        destination: '/404', 
        permanent: false,
      },

      // Regra para quando estás alojado na NETLIFY:
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-country',
            value: '^(CN|IN|RU|TR|IR|KP|VN|UA|BY|PK|ID|NG|BD|CV|MZ|AO)$', 
          },
        ],
        destination: '/404', 
        permanent: false,
      },



      // ==========================================
      // 1. REDIRECTS INDIVIDUAIS (Produtos / Páginas Específicas)
      // ==========================================
      
{
        source: '/auth/signin',
        destination: '/login',
        permanent: true,
      },

     

     
    ];
  },
};

export default nextConfig;