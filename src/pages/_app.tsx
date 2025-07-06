import * as Sentry from '@sentry/nextjs';
import type { AppProps } from 'next/app';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: 1.0,
});

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
} 