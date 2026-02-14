import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://spectrahub.cloud';

  // Obtener modelos verificados
  const models = await db.user.findMany({
    where: {
      isVerifiedModel: true,
    },
    select: {
      username: true,
      updatedAt: true,
    },
    take: 50000,
  });

  const modelUrls = models.map((model) => ({
    url: `${baseUrl}/u/${model.username}`,
    lastModified: model.updatedAt,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  return [
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
    ...modelUrls,
  ];
}
