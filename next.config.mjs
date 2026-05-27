/** @type {import('next').NextConfig} */
import os from 'os';

function getLocalIPv4Addresses() {
  const nets = os.networkInterfaces();
  const results = new Set();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const family = typeof net.family === 'string' ? net.family : String(net.family);
      if ((family === 'IPv4' || family === '4') && !net.internal && net.address) {
        results.add(net.address);
      }
    }
  }
  results.add('127.0.0.1');
  results.add('localhost');
  return Array.from(results);
}

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Dynamically include current machine's local IPv4 addresses so you don't
  // need to update this when switching Wi‑Fi / networks during development.
  allowedDevOrigins: getLocalIPv4Addresses(),
};

export default nextConfig;
