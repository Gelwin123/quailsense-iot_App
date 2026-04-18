const withPWA = require("next-pwa")({
  dest: "public",   // service worker files go here
  register: true,   // auto-register the service worker
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disable in dev
});

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {},
  webpack: (config) => config,
};

module.exports = withPWA(nextConfig);
