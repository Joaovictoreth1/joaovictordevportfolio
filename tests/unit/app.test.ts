import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { STORAGE_KEY } from '../../src/i18n/language';
import { hasFinePointer, prefersReducedMotion } from '../../src/lib/motion';

const html = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8');
const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';

const storage = (): Storage => {
  const store = document.defaultView?.localStorage;
  if (!store) throw new Error('jsdom storage unavailable');
  return store;
};

const visibleTitles = (): string[] =>
  [...document.querySelectorAll('#projects-grid h3')].map((el) => el.textContent);

describe('createApp', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn() })),
    );
    storage().clear();
    storage().setItem(STORAGE_KEY, 'pt');
    document.head.innerHTML = '<meta name="description" content="">';
    document.body.innerHTML = body;
  });

  it('renders all dynamic sections and hydrates icons', () => {
    const onRendered = vi.fn();
    createApp(document, onRendered);
    expect(document.querySelectorAll('#timeline-wrapper article')).toHaveLength(4);
    expect(document.querySelectorAll('#tech-grid img')).toHaveLength(16);
    expect(visibleTitles()).toHaveLength(4);
    expect(document.querySelector('i[data-lucide]')).toBeNull();
    expect(onRendered).toHaveBeenCalledTimes(1);
  });

  it('switches language, updates <html lang> and persists the choice', () => {
    const app = createApp(document);
    const select = document.querySelector<HTMLSelectElement>('#lang-selector');
    if (!select) throw new Error('missing selector');
    select.value = 'en';
    select.dispatchEvent(new Event('change'));

    expect(app.state.lang).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(storage().getItem(STORAGE_KEY)).toBe('en');
    expect(document.querySelector('[data-filter="all"]')?.textContent).toBe('All Systems');
    expect(document.querySelector('.glitch-text')?.getAttribute('data-text')).toBe('Engineering.');

    select.value = 'xx';
    select.dispatchEvent(new Event('change'));
    expect(app.state.lang).toBe('en');
  });

  it('keeps the active project filter across language changes', () => {
    const app = createApp(document);
    document.querySelector<HTMLButtonElement>('[data-filter="backend"]')?.click();
    expect(visibleTitles()).toEqual(['Core API Architecture']);

    app.setLanguage('en');
    expect(app.state.filter).toBe('backend');
    expect(visibleTitles()).toEqual(['Core API Architecture']);
    const pressed = [...document.querySelectorAll('[aria-pressed="true"]')].map(
      (el) => (el as HTMLElement).dataset.filter,
    );
    expect(pressed).toEqual(['backend']);
  });

  it('falls back to the browser language when nothing is stored', () => {
    storage().clear();
    expect(createApp(document).state.lang).toBe('en');
  });

  it('starts in the stored language', () => {
    storage().setItem(STORAGE_KEY, 'en');
    expect(createApp(document).state.lang).toBe('en');
    expect(document.querySelector('[data-i18n="navAbout"]')?.textContent).toBe('About');
  });
});

describe('motion preferences', () => {
  it('reads media queries', () => {
    const matchMedia = vi.fn((query: string) => ({ matches: query.includes('reduce') }));
    const win = { matchMedia } as unknown as Window;
    expect(prefersReducedMotion(win)).toBe(true);
    expect(hasFinePointer(win)).toBe(false);
  });
});
