/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: config => {
    // The "Critical dependency" warning is caused by a library used by Genkit (via OpenTelemetry)
    // that uses dynamic requires. By marking these as external, we tell Next.js not to
    // bundle them. They will be required at runtime on the server, which is the correct behavior.
    config.externals.push('require-in-the-middle', '@opentelemetry/instrumentation');
    return config;
  },
};

module.exports = nextConfig;
