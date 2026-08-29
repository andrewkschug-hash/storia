import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

const SITE_TITLE = 'Storibase — Learn Languages Through Stories';
const SITE_DESCRIPTION =
  'Learn languages naturally by living inside compelling stories. Build vocabulary and comprehension chapter by chapter with native audio and interactive reading.';
const SITE_URL = 'https://www.storibase.com';

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Storibase',
  alternateName: ['Storibase App'],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    name: 'Storibase',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.png`,
    },
  },
});

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Storibase" />
        <meta name="application-name" content="Storibase" />
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* Preconnect to Google Fonts for faster font asset delivery */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Favicon & Google Site Icons */}
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Storibase" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/favicon.png`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@storibase" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/favicon.png`} />

        {/* Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />

        <meta name="theme-color" content="#F3F6F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0F1614" media="(prefers-color-scheme: dark)" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html, body, #root {
  height: 100%;
}
body {
  background-color: #F3F6F7;
  margin: 0;
  overscroll-behavior-y: none;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0F1614;
  }
}
/* Keep form controls from zooming awkwardly on iOS while remaining accessible. */
input, textarea, select, button {
  font-size: 16px;
}
@media (min-width: 600px) {
  input, textarea, select, button {
    font-size: inherit;
  }
}
`;
