import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fira-code';
import '@fontsource-variable/syne';
import './styles/main.css';
import {
  applyDocumentLanguage,
  applyTranslations,
  readStoredLanguage,
  resolveInitialLanguage,
  safeLocalStorage,
} from './i18n/language';
import { dictionaries } from './i18n/dictionary';

const lang = resolveInitialLanguage(readStoredLanguage(safeLocalStorage()), navigator.languages);
applyDocumentLanguage(document, lang);
applyTranslations(document, lang);
document.title = `404 | ${dictionaries[lang].notFoundTitle}`;
