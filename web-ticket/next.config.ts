/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        '192.168.100.140:3000' 
      ],
    },
  },

  async redirects() {
    return [
      {
        source: '/',          
        destination: '/dashboard', 
        permanent: true,      
      },
    ];
  },
};

export default nextConfig;