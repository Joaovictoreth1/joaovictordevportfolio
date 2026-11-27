import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dictionaries, isTranslationKey, translate } from '../../src/i18n/dictionary';
import {
  applyDocumentLanguage,
  applyTranslations,
  readStoredLanguage,
  resolveInitialLanguage,
  safeLocalStorage,
  STORAGE_KEY,
  storeLanguage,
} from '../../src/i18n/language';
import { isLanguage } from '../../src/i18n/types';

const pages = ['index.html', '404.html'].map((file) =>
  readFileSync(resolve(import.meta.dirname, '../..', file), 'utf8'),
);

describe('dictionaries', () => {
  it('have identical, non-empty keys for every language', () => {
    const ptKeys = Object.keys(dictionaries.pt).sort();
    expect(Object.keys(dictionaries.en).sort()).toEqual(ptKeys);
    for (const dict of Object.values(dictionaries)) {
      for (const value of Object.values(dict)) expect(value.trim()).not.toBe('');
    }
  });

  it('cover every key referenced from the HTML pages', () => {
    const keys = pages.flatMap((html) => [
      ...[...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((m) => m[1] ?? ''),
      ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((m) =>
        (m[1] ?? '').split(';').map((pair) => pair.split(':')[1] ?? ''),
      ),
    ]);
    expect(keys.length).toBeGreaterThan(40);
    expect(keys.filter((key) => !isTranslationKey(key))).toEqual([]);
  });

  it('translates by language', () => {
    expect(translate('en', 'navAbout')).toBe('About');
    expect(translate('pt', 'navAbout')).toBe('Sobre');
  });
});

describe('resolveInitialLanguage', () => {
  it('prefers a valid stored language', () => {
    expect(resolveInitialLanguage('en', ['pt-BR'])).toBe('en');
  });
  it('falls back to the first supported browser language', () => {
    expect(resolveInitialLanguage('xx', ['fr-FR', 'EN-us', 'pt'])).toBe('en');
  });
  it('defaults to Portuguese', () => {
    expect(resolveInitialLanguage(null, ['de'])).toBe('pt');
    expect(isLanguage(42)).toBe(false);
  });
});

describe('storage helpers', () => {
  it('round-trips through storage', () => {
    storeLanguage(window.localStorage, 'en');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    expect(readStoredLanguage(safeLocalStorage())).toBe('en');
  });
  it('swallow storage failures', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    };
    expect(readStoredLanguage(broken)).toBeNull();
    expect(() => {
      storeLanguage(broken, 'pt');
    }).not.toThrow();
    expect(readStoredLanguage(undefined)).toBeNull();
    const blocked = Object.defineProperty({}, 'localStorage', {
      get: () => {
        throw new Error('SecurityError');
      },
    }) as Window;
    expect(safeLocalStorage(blocked)).toBeUndefined();
  });
});

describe('applyTranslations', () => {
  it('updates text, trusted rich text and attributes', () => {
    document.body.innerHTML = `
      <span data-i18n="navAbout"></span>
      <p data-i18n-html="contactTitle"></p>
      <input data-i18n-attr="placeholder:formNamePlaceholder; aria-label:formName" />`;
    applyTranslations(document, 'en');
    expect(document.querySelector('span')?.textContent).toBe('About');
    expect(document.querySelector('p span.text-brand-500')?.textContent).toBe('epic.');
    expect(document.querySelector('input')?.getAttribute('placeholder')).toBe('Your name');
    expect(document.querySelector('input')?.getAttribute('aria-label')).toBe('Name');
  });

  it('fails loudly on an unknown key', () => {
    document.body.innerHTML = '<span data-i18n="nope"></span>';
    expect(() => {
      applyTranslations(document, 'en');
    }).toThrow(/Unknown translation key "nope"/);
  });

  it('updates the document language and metadata', () => {
    document.head.innerHTML = '<meta name="description" content="">';
    applyDocumentLanguage(document, 'en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe(dictionaries.en.metaTitle);
    expect(document.querySelector('meta')?.getAttribute('content')).toBe(
      dictionaries.en.metaDescription,
    );
    applyDocumentLanguage(document, 'pt');
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});
