import withNextIntl from 'next-intl/plugin';

const withIntl = withNextIntl('./next-intl.config.ts');

const nextConfig = {
  experimental: {
    // Elimina `serverActions: true` — ya no se usa
  },
  reactStrictMode: true,
};

export default withIntl(nextConfig);
