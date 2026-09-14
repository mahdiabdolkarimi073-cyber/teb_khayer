import nextPWA from "next-pwa";

const withPWA = nextPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload"},
                    {key: "X-Content-Type-Options", value: "nosniff"},
                    {key: "X-Frame-Options", value: "SAMEORIGIN"},
                    {key: "X-XSS-Protection", value: "1; mode=block"},
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: "/:path*",
                has: [{type: "header", key: "x-forwarded-proto", value: "http"}],
                destination: "https://teb-khayyer.ir/:path*",
                permanent: true,
            },
        ];
    },
    experimental: {
        serverActions: {
            allowedForwardedHosts: ["teb-khayyer.ir", "www.teb-khayyer.ir", "sepehr.shaparak.ir"],
            allowedOrigins: ["https://teb-khayyer.ir", "https://www.teb-khayyer.ir", "https://sepehr.shaparak.ir", "sepehr.shaparak.ir", "https://localhost:3000"],
        },
        esmExternals: "loose",
        instrumentationHook: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        formats: ["image/webp", "image/avif"],
        remotePatterns: [
            {protocol: "https", hostname: "**"},
        ],
        deviceSizes: [320, 420, 640, 768, 1024, 1200, 1600],
        imageSizes: [16, 32, 48, 64, 96, 128, 150, 256, 384, 400, 512, 800],
    },
    webpack: (config) => {
        config.externals = [...config.externals, {canvas: "canvas", "@ryancavanaugh/lls": "@ryancavanaugh/lls"}];
        config.parallelism = 1;
        return config;
    },
};

export default withPWA(nextConfig);
