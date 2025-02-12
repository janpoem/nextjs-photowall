import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-cn">
      <Head title="Test">
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
      </Head>
      <body>
        <main>
          <Main />
        </main>
        <NextScript />
      </body>
    </Html>
  );
}
