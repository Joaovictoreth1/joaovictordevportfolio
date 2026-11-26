import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const trackProblems = (page: Page): string[] => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    // Headless software GL logs driver performance hints that are not page problems.
    if (msg.text().includes('GL Driver Message')) return;
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()}`));
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`${res.status()}: ${res.url()}`);
  });
  return problems;
};

const open = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.locator('#preloader')).toBeHidden();
};

test('loads cleanly under the production CSP with security headers', async ({ page }) => {
  const problems = trackProblems(page);
  const response = await page.goto('/');
  const headers = response?.headers() ?? {};
  expect(headers['content-security-policy']).toContain("script-src 'self'");
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  await expect(page.locator('#preloader')).toBeHidden();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');

  const external = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => new URL(url).origin !== location.origin),
  );
  expect(
    external.filter((url) => !url.startsWith('https://avatars.githubusercontent.com')),
  ).toEqual([]);
  expect(problems).toEqual([]);
});

test('renders dynamic sections and a well-formed terminal', async ({ page }) => {
  await open(page);
  await expect(page.locator('#timeline-wrapper article')).toHaveCount(4);
  await expect(page.locator('#tech-grid img')).toHaveCount(16);
  await expect(page.locator('#projects-grid article')).toHaveCount(4);
  const terminal = page.locator('#terminal-container');
  await expect(terminal).toContainText('jvbm.buildInfrastructure().then(console.log);', {
    timeout: 15_000,
  });
  await expect(terminal).not.toContainText('text-purple-400');
  await expect(terminal).not.toContainText('<span');
});

test('switching language updates <html lang> and keeps the project filter', async ({ page }) => {
  await open(page);
  await page.locator('[data-filter="backend"]').click();
  await expect(page.locator('#projects-grid article')).toHaveCount(1);

  await page.locator('#lang-selector').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-i18n="navAbout"]').first()).toHaveText('About');
  await expect(page.locator('#projects-grid article')).toHaveCount(1);
  await expect(page.locator('[data-filter="backend"]')).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test.describe('contact form', () => {
  const fill = async (page: Page): Promise<void> => {
    await page.locator('#contact-name').fill('Ada Lovelace');
    await page.locator('#contact-email').fill('ada@example.com');
    await page.locator('#contact-message').fill('Hello from Playwright');
  };

  test('posts to Netlify Forms and confirms only after success', async ({ page }) => {
    await open(page);
    let body = '';
    await page.route(
      (url) => url.pathname === '/',
      async (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        body = route.request().postData() ?? '';
        return route.fulfill({ status: 200, body: 'ok' });
      },
    );
    await fill(page);
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('[data-form-feedback]')).toHaveAttribute('data-state', 'success');
    expect(new URLSearchParams(body).get('form-name')).toBe('contact');
    expect(new URLSearchParams(body).get('email')).toBe('ada@example.com');
    await expect(page.locator('#contact-name')).toHaveValue('');
  });

  test('shows an error and keeps input when delivery fails', async ({ page }) => {
    await open(page);
    await page.route(
      (url) => url.pathname === '/',
      (route) =>
        route.request().method() === 'POST'
          ? route.fulfill({ status: 500, body: 'boom' })
          : route.continue(),
    );
    await fill(page);
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('[data-form-feedback]')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#contact-message')).toHaveValue('Hello from Playwright');
  });
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  await open(page);
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(blocking).toEqual([]);
});

test('mobile menu opens, closes on Escape and on navigation', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile layout only');
  await open(page);
  const toggle = page.locator('#mobile-menu-btn');
  const menu = page.locator('#mobile-nav');
  await expect(menu).toBeHidden();

  await toggle.click();
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await menu.getByRole('link').first().click();
  await expect(menu).toBeHidden();
});

test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#preloader')).toBeHidden({ timeout: 1_000 });
  await expect(page.locator('html')).toHaveClass(/reduced-motion/);
  await expect(page.locator('html')).not.toHaveClass(/has-custom-cursor/);
  await expect(page.locator('#terminal-container')).toContainText(
    'jvbm.buildInfrastructure().then(console.log);',
  );
});

test('404 page is translated and links home', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('link', { name: /início|home/i })).toHaveAttribute('href', '/');
});
