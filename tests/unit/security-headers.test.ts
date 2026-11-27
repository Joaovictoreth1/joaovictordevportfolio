import { describe, expect, it } from 'vitest';
import { renderNetlifyHeaders, securityHeaders, serializeCsp } from '../../config/security-headers';

describe('security headers', () => {
  it('ship a strict CSP with no unsafe sources', () => {
    const csp = securityHeaders['Content-Security-Policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/unsafe-(inline|eval)/);
  });

  it('serialize directives without trailing whitespace', () => {
    expect(serializeCsp({ 'default-src': ["'self'"], 'upgrade-insecure-requests': [] })).toBe(
      "default-src 'self'; upgrade-insecure-requests",
    );
  });

  it('render a Netlify _headers file for all routes and immutable assets', () => {
    const file = renderNetlifyHeaders();
    expect(file.startsWith('/*\n')).toBe(true);
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(file).toContain(`  ${name}: ${value}\n`);
    }
    expect(file).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
  });
});
