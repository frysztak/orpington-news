import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en" className="notranslate" translate="no">
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="/icons/favicon-57x57.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href="/icons/favicon-60x60.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="/icons/favicon-72x72.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href="/icons/favicon-76x76.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/icons/favicon-114x114.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/icons/favicon-120x120.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/icons/favicon-144x144.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/icons/favicon-152x152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/favicon-180x180.png"
          />
          <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/favicon-16x16.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/icons/favicon-96x96.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/icons/favicon-192x192.png"
          />
          <link
            rel="shortcut icon"
            type="image/x-icon"
            href="/icons/favicon.ico"
          />
          <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta
            name="msapplication-TileImage"
            content="/icons/favicon-144x144.png"
          />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-tap-highlight" content="no" />
          <link rel="manifest" href="/manifest.json" />

          <meta name="application-name" content="Orpington News" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Orpington News" />
          <meta name="description" content="Self-hosted RSS reader" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />

          <meta name="google" content="notranslate" />

          <link
            rel="preload"
            href="/fonts/nunito-v20-latin-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/nunito-v20-latin-700.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
