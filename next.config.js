/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      "utfs.io"
    ]
  }
};

const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl(nextConfig);