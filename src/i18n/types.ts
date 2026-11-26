export const LANGUAGES = ['pt', 'en'] as const;

export type Language = (typeof LANGUAGES)[number];

export type Localized = Readonly<Record<Language, string>>;

export const HTML_LANG: Readonly<Record<Language, string>> = { pt: 'pt-BR', en: 'en' };

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
