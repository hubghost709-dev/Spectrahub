<<<<<<< HEAD
import withNextIntl from 'next-intl/plugin';

const withIntl = withNextIntl('./next-intl.config.ts');

const nextConfig = {
  experimental: {
    // Elimina `serverActions: true` — ya no se usa
  },
  reactStrictMode: true,
};

export default withIntl(nextConfig);
=======
import withNextIntl from 'next-intl/plugin';

const withIntl = withNextIntl('./next-intl.config.ts');

const nextConfig = {
  experimental: {
    // Elimina `serverActions: true` — ya no se usa
  },
  reactStrictMode: true,
};

export default withIntl(nextConfig);
>>>>>>> 0199162e331afada491f80b15b26aa8f6b4e5996
