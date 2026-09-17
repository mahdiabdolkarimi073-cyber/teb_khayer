import "./globals.css";
import {ModalsProvider} from "@mantine/modals";
import {DirectionProvider, MantineProvider} from "@mantine/core";
import mantineTheme from "@/app/theme";
import React from "react";
import OverrideWindow from "@/app/OverrideWindow";
import {ToastContainer} from "react-toastify";
import {baseMetadata} from "@/config/seo";
import {JsonLd, organizationJsonLd, websiteJsonLd} from "@/components/seo/JsonLd";

export const metadata = baseMetadata;

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html dir="rtl" lang="fa" data-mantine-color-scheme="light">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="طب خیّر" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.webp" />
        <link rel="apple-touch-startup-image" href="/logo.webp" />
        <meta name="google-site-verification" content="c8J6q-8hvFGSNIyCm1EBT9ovyeoOw4uU844hT2xvF1Q"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
        <meta name="theme-color" content="#082b54"/>
        <meta name="format-detection" content="telephone=no"/>
        <link rel="preload" href="/_next/static/media/YekanBakhFaNum-Bold.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests; default-src https: 'self'; script-src https: 'self' 'unsafe-inline' 'unsafe-eval'; style-src https: 'self' 'unsafe-inline'; img-src https: 'self' data: blob:; font-src https: 'self' data:; connect-src https: 'self' wss:; form-action https: 'self' sepehr.shaparak.ir;"/>
      </head>
      <body>
        <JsonLd data={organizationJsonLd()}/>
        <JsonLd data={websiteJsonLd()}/>
        <DirectionProvider initialDirection={'rtl'}>
          <MantineProvider theme={mantineTheme}>
            <ModalsProvider>
              <OverrideWindow/>
              {children}
            </ModalsProvider>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              bodyStyle={{fontFamily: "var(--font)"}}
            />
          </MantineProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
