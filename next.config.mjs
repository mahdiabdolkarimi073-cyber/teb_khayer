/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedForwardedHosts: ['localhost','localhost:3000',"teb-khayyer.ir","*:3000","192.168.1.100","*",'sepehr.shaparak.ir:8080','sepehr.shaparak.ir'],
            allowedOrigins: ['http://localhost:3000','http://10.0.2.2:3000','http://192.168.1.100:3000','sepehr.shaparak.ir:8080','sepehr.shaparak.ir',"*:3000",'192.168.1.100:3000','10.0.2.2:3000','localhost:3000',"https://teb-khayyer.ir","http://teb-khayyer.ir",'teb-khayyer.ir']
        },
        esmExternals: "loose",
        instrumentationHook: true
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    webpack: (config) => {

        config.externals = [...config.externals, { canvas: "canvas","@ryancavanaugh/lls":"@ryancavanaugh/lls" }];  // required to make Konva & react-konva work
        return config;
    },
};

export default nextConfig;
