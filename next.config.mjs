/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sooklabs-v2",
        destination: "/",
        permanent: false,
      },
      {
        source: "/sooklabs-v2/audit",
        destination: "/audit",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
