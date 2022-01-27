/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins');

const bundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const PWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

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
        },
      },
    ],
  ],
  {
    reactStrictMode: true,
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    publicRuntimeConfig: {
      APP_DISABLE_LOGIN: process.env.APP_DISABLE_LOGIN,
      API_URL: process.env.API_URL,
    },
  }
);
