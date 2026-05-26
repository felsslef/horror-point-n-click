/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Allow this host to access Next.js dev resources (webpack HMR)
  // Add other hosts here if you develop from multiple devices
  allowedDevOrigins: ['172.24.61.123', '192.168.1.69', '10.111.245.123'],
};

export default nextConfig;
