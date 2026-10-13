import nextPWA from "next-pwa";

const withPWA = nextPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching: [
        {
            urlPattern: "/api/network-status",
            handler: "NetworkOnly",
        },
        {
            urlPattern: ({ url }) => url.pathname === "/",
            handler: "NetworkFirst",
            options: {
                cacheName: "start-url",
                networkTimeoutSeconds: 3,
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 4, maxAgeSeconds: 31536000 },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "google-fonts-stylesheets",
                expiration: { maxEntries: 4, maxAgeSeconds: 604800 },
            },
        },
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-font-assets",
                expiration: { maxEntries: 4, maxAgeSeconds: 604800 },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-image-assets",
                expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\/_next\/image\?url=.+$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "next-image",
                expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\.(?:mp3|wav|ogg)$/i,
            handler: "CacheFirst",
            options: {
                cacheName: "static-audio-assets",
                rangeRequests: true,
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\.(?:mp4)$/i,
            handler: "CacheFirst",
            options: {
                cacheName: "static-video-assets",
                rangeRequests: true,
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\.(?:js)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-js-assets",
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\.(?:css|less)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-style-assets",
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "next-data",
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: /\.(?:json|xml|csv)$/i,
            handler: "NetworkFirst",
            options: {
                cacheName: "static-data-assets",
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: ({ url }) => {
                if (url.origin !== self.location.origin) return false;
                const p = url.pathname;
                if (p.startsWith("/api/network-status")) return false;
                if (p.startsWith("/api/auth/")) return false;
                return p.startsWith("/api/");
            },
            handler: "NetworkFirst",
            options: {
                cacheName: "apis",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 16, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: ({ url }) => {
                if (url.origin !== self.location.origin) return false;
                return !url.pathname.startsWith("/api/");
            },
            handler: "NetworkFirst",
            options: {
                cacheName: "others",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
        },
        {
            urlPattern: ({ url }) => url.origin !== self.location.origin,
            handler: "NetworkFirst",
            options: {
                cacheName: "cross-origin",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 32, maxAgeSeconds: 3600 },
            },
        },
    ],
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
            {
                source: "/_next/static/(.*)",
                headers: [
                    {key: "Cache-Control", value: "public, max-age=31536000, immutable"},
                ],
            },
            {
                source: "/fonts/(.*)",
                headers: [
                    {key: "Cache-Control", value: "public, max-age=31536000, immutable"},
                ],
            },
            {
                source: "/sw.js",
                headers: [
                    {key: "Cache-Control", value: "no-cache, no-store, must-revalidate"},
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
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    experimental: {
        serverActions: {
            allowedForwardedHosts: ["teb-khayyer.ir", "www.teb-khayyer.ir", "sepehr.shaparak.ir"],
            allowedOrigins: ["https://teb-khayyer.ir", "https://www.teb-khayyer.ir", "https://sepehr.shaparak.ir", "sepehr.shaparak.ir", "https://localhost:3000"],
        },
        esmExternals: "loose",
        instrumentationHook: true,
        optimizePackageImports: ["@tabler/icons-react", "@mantine/core", "@mantine/hooks", "@mantine/modals"],
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
        minimumCacheTTL: 86400,
    },
    webpack: (config) => {
        config.externals = [...config.externals, {canvas: "canvas", "@ryancavanaugh/lls": "@ryancavanaugh/lls"}];
        config.parallelism = 1;
        return config;
    },
};

export default withPWA(nextConfig);
