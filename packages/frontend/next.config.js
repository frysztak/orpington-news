/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins');
const bundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const PWA = require('next-pwa');
const runtimeCaching = require('./pwa/runtimeCaching');

module.exports = withPlugins(
  [
    [bundleAnalyzer],
    [
      PWA,
      {
        pwa: {
          dest: 'public',
          runtimeCaching,
          disable: process.env.NODE_ENV !== 'production',
          register: false,
          skipWaiting: false,
        },
      },
    ],
  ],
  {
    reactStrictMode: true,
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    swcMinify: true,
    compiler: {
      removeConsole:
        process.env.NODE_ENV === 'production'
          ? { exclude: ['error', 'warn'] }
          : false,
    },
    productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
    output: 'standalone',
  }
);
