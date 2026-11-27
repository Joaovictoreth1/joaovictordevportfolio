/**
 * Single source of truth for the HTTP response headers served in production.
 * Consumed by `vite preview` (so e2e tests run under the real policy) and by the
 * build plugin that emits Netlify's `_headers` file.
 */

const contentSecurityPolicy: Readonly<Record<string, readonly string[]>> = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'https://avatars.githubusercontent.com'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'form-action': ["'self'", 'mailto:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

export const serializeCsp = (policy: Readonly<Record<string, readonly string[]>>): string =>
  Object.entries(policy)
    .map(([directive, sources]) => [directive, ...sources].join(' '))
    .join('; ');

export const securityHeaders: Readonly<Record<string, string>> = {
  'Content-Security-Policy': serializeCsp(contentSecurityPolicy),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** Hashed build assets never change, so they can be cached forever. */
export const immutableAssetHeaders: Readonly<Record<string, string>> = {
  'Cache-Control': 'public, max-age=31536000, immutable',
};

const block = (path: string, headers: Readonly<Record<string, string>>): string =>
  [path, ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`)].join('\n');

/** Renders the headers in Netlify's `_headers` file format. */
export const renderNetlifyHeaders = (): string =>
  `${[block('/*', securityHeaders), block('/assets/*', immutableAssetHeaders)].join('\n\n')}\n`;
