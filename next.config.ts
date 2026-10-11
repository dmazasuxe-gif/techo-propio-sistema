import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium',
    'puppeteer',
    'form-data',
    'node-fetch',
    'ws',
    'pdfkit',
    'pdf-parse',
  ],
  outputFileTracingExcludes: {
    '/api/presupuesto/pdf': ['./scripts/**'],
    '/api/obras/cronograma/pdf': ['./scripts/**'],
  },
};

export default nextConfig;
