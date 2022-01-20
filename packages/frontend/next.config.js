/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  publicRuntimeConfig: {
    APP_DISABLE_LOGIN: process.env.APP_DISABLE_LOGIN,
    API_URL: process.env.API_URL,
  },
});
