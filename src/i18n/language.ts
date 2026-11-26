import { dictionaries, isTranslationKey, type TranslationKey } from './dictionary';
import { HTML_LANG, isLanguage, type Language } from './types';

export const STORAGE_KEY = 'jv-portfolio-lang';

export const DEFAULT_LANGUAGE: Language = 'pt';

/** `window.localStorage` itself throws when storage is blocked, so access it defensively. */
export const safeLocalStorage = (win: Window | null = window): Storage | undefined => {
  try {
    return win?.localStorage;
  } catch {
    return undefined;
  }
};

/** Picks the stored choice first, then the first browser language we support. */
export const resolveInitialLanguage = (
  stored: string | null,
  preferred: readonly string[],
): Language => {
  if (isLanguage(stored)) return stored;
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split('-')[0];
    if (isLanguage(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
};

export const readStoredLanguage = (
  storage: Pick<Storage, 'getItem'> | undefined,
): string | null => {
  try {
    return storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
};

export const storeLanguage = (
  storage: Pick<Storage, 'setItem'> | undefined,
  lang: Language,
): void => {
  try {
    storage?.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be unavailable (private mode, disabled cookies); the choice just won't persist.
  }
};

const requireKey = (element: Element, value: string | undefined): TranslationKey => {
  if (value === undefined || !isTranslationKey(value)) {
    throw new Error(
      `Unknown translation key "${String(value)}" on <${element.tagName.toLowerCase()}>`,
    );
  }
  return value;
};

/**
 * Applies translations declared in markup:
 * - `data-i18n`: plain text (textContent)
 * - `data-i18n-html`: trusted rich text authored in the dictionary
 * - `data-i18n-attr="attr:key;attr:key"`: attribute values
 */
export const applyTranslations = (root: Document | Element, lang: Language): void => {
  const dict = dictionaries[lang];

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = dict[requireKey(el, el.dataset.i18n)];
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    el.innerHTML = dict[requireKey(el, el.dataset.i18nHtml)];
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    for (const pair of (el.dataset.i18nAttr ?? '').split(';')) {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (!attr) continue;
      el.setAttribute(attr, dict[requireKey(el, key)]);
    }
  });
};

export const applyDocumentLanguage = (doc: Document, lang: Language): void => {
  const dict = dictionaries[lang];
  doc.documentElement.lang = HTML_LANG[lang];
  doc.title = dict.metaTitle;
  doc.querySelector('meta[name="description"]')?.setAttribute('content', dict.metaDescription);
};
