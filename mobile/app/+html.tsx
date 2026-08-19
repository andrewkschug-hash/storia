import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

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
        <title>Storibase — Learn Italian through stories</title>
        <meta
          name="description"
          content="Storibase is a story-driven Italian reading app. Learn through progressive chapters, not flashcards-first drills."
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
