/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",  // ✅ UploadThing
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",  // ✅ UploadThing alternativo
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",  // ✅ Clerk avatars
      },
      {
        protocol: "https",
        hostname: "uploadthing-prod.s3.us-west-2.amazonaws.com", // ✅ UploadThing S3
      },
    ],
  },
};

module.exports = nextConfig;
