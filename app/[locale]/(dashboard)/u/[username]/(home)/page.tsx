import StreamPlayer from "@/components/stream-player";
import { getUserByUsername } from "@/lib/user-service";
import { currentUser } from "@clerk/nextjs";
import type { Metadata } from 'next';

interface Props {
  params: {
    username: string;
  };
}

// ✅ Metadata dinámica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserByUsername(params.username);
  
  if (!user || !user.stream) {
    return {
      title: 'Stream Not Found',
    };
  }

  const isLive = user.stream.isLive;
  const thumbnail = isLive ? user.stream.thumbnailUrl : user.stream.offlineThumbnailUrl;
  
  return {
    title: `${user.username}${isLive ? ' 🔴 LIVE' : ''} - Live Webcam Show`,
    description: user.bio || `Watch ${user.username}'s live webcam show on SpectraHub. Interactive adult entertainment, private chat available. Join now!`,
    openGraph: {
      title: `${user.username}${isLive ? ' 🔴 LIVE NOW' : ''} on SpectraHub`,
      description: user.bio || `Watch ${user.username}'s live show`,
      images: [
        {
          url: thumbnail || user.imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.username} webcam show`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.username}${isLive ? ' 🔴 LIVE' : ''}`,
      images: [thumbnail || user.imageUrl],
    },
    alternates: {
      canonical: `https://spectrahub.cloud/u/${user.username}`,
    },
  };
}

async function CreatorPage({ params }: Props) {
  const externalUser = await currentUser();
  const user = await getUserByUsername(params.username);
  
  if (!user || user.externalUserId !== externalUser?.id || !user.stream) {
    throw new Error("Unauthorized");
  }
  
  return (
    <>
      {/* ✅ Schema.org para perfil */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "mainEntity": {
              "@type": "Person",
              "name": user.username,
              "image": user.imageUrl,
              "description": user.bio,
              "url": `https://spectrahub.cloud/u/${user.username}`,
            },
            ...(user.stream.isLive && {
              "video": {
                "@type": "VideoObject",
                "name": `${user.username} Live Stream`,
                "description": user.stream.name,
                "thumbnailUrl": user.stream.thumbnailUrl || user.imageUrl,
                "contentUrl": `https://spectrahub.cloud/u/${user.username}`,
                "publication": {
                  "@type": "BroadcastEvent",
                  "isLiveBroadcast": true,
                }
              }
            })
          })
        }}
      />
      
      <div className="h-full">
        <StreamPlayer user={user} stream={user.stream} isFollowing />
      </div>
    </>
  );
}

export default CreatorPage;
