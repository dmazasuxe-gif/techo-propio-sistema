import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium',
    'puppeteer',
    'form-data',
    'node-fetch',
    'node-telegram-bot-api',
    'ws',
    'pdfkit',
  ],
  // Exclude bot/telegram scripts from file tracing (they use fs/path dynamically)
  outputFileTracingExcludes: {
    '/api/telegram': ['./scripts/**', './lib/telegram-sender.ts'],
    '/api/presupuesto/pdf': ['./scripts/**'],
    '/api/obras/cronograma/pdf': ['./scripts/**'],
  },
};

export default nextConfig;
