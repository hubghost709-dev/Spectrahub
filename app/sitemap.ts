import { MetadataRoute } from 'next';

// ✅ Hacerlo dinámico para que se genere en runtime, no en build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidar cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://spectrahub.cloud';

  // Páginas estáticas básicas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/es`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
  ];

  // En build time solo retornamos páginas estáticas
  // Los perfiles de modelos se generarán dinámicamente
  if (process.env.VERCEL_ENV === 'production') {
    try {
      const { db } = await import('@/lib/db');
      
      const models = await db.user.findMany({
        where: {
          isVerifiedModel: true,
        },
        select: {
          username: true,
          updatedAt: true,
        },
        take: 1000, // Limitar a 1000 modelos
      });

      const modelUrls = models.map((model) => ({
        url: `${baseUrl}/u/${model.username}`,
        lastModified: model.updatedAt,
        changeFrequency: 'hourly' as const,
        priority: 0.8,
      }));

      return [...staticPages, ...modelUrls];
    } catch (error) {
      console.error('Error generating sitemap:', error);
      // Si falla, solo retornar páginas estáticas
      return staticPages;
    }
  }

  return staticPages;
}
