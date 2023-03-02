const bundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const PWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: require('./pwa/runtimeCaching'),
  disable:
    process.env.NODE_ENV !== 'production' || process.env.DISABLE_SW === 'true',
  register: false,
  skipWaiting: false,
  cacheStartUrl: true,
  dynamicStartUrl: false,
});

module.exports = () => {
  const plugins = [bundleAnalyzer, PWA];

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    swcMinify: true,
    compiler: {
      reactRemoveProperties: process.env.INSTRUMENT_COVERAGE !== 'true',
      removeConsole:
        process.env.NODE_ENV === 'production'
          ? { exclude: ['error', 'warn'] }
          : false,
    },
    productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
    output: 'standalone',
    experimental: {
      swcPlugins: [
        process.env.INSTRUMENT_COVERAGE === 'true' && [
          'swc-plugin-coverage-instrument',
          {},
        ],
      ],
    },
  };

  return plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig });
};
