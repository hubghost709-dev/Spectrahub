import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/u/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://spectrahub.cloud/sitemap.xml',
  };
}
