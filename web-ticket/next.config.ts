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
};

export default nextConfig;