import {
  experience,
  projects,
  PROJECT_CATEGORIES,
  techStack,
  type ProjectFilter,
} from './content/data';
import {
  applyDocumentLanguage,
  applyTranslations,
  readStoredLanguage,
  resolveInitialLanguage,
  safeLocalStorage,
  storeLanguage,
} from './i18n/language';
import { isLanguage, type Language } from './i18n/types';
import { requireElement } from './lib/dom';
import { initContactForm } from './ui/contact-form';
import { hydrateIcons } from './ui/icons';
import { initMobileMenu } from './ui/navigation';
import { renderProjects, renderTechStack, renderTimeline } from './ui/render';

const isProjectFilter = (value: string | undefined): value is ProjectFilter =>
  value === 'all' || (PROJECT_CATEGORIES as readonly string[]).includes(value ?? '');

export interface AppState {
  lang: Language;
  filter: ProjectFilter;
}

export interface App {
  readonly state: Readonly<AppState>;
  readonly setLanguage: (lang: Language) => void;
  readonly setFilter: (filter: ProjectFilter) => void;
}

/** Wires content, translations and interactive controls. Animation is layered on separately. */
export const createApp = (
  doc: Document = document,
  onContentRendered: () => void = () => undefined,
): App => {
  const storage = safeLocalStorage(doc.defaultView);
  const state: AppState = {
    lang: resolveInitialLanguage(
      readStoredLanguage(storage),
      doc.defaultView?.navigator.languages ?? [],
    ),
    filter: 'all',
  };

  const timeline = requireElement('#timeline-wrapper', doc);
  const techGrid = requireElement('#tech-grid', doc);
  const projectGrid = requireElement('#projects-grid', doc);
  const filterButtons = [
    ...doc.querySelectorAll<HTMLButtonElement>('#project-filters [data-filter]'),
  ];
  const languageSelect = requireElement('#lang-selector', doc, HTMLSelectElement);

  const contactForm = initContactForm(
    requireElement('#contact-form', doc, HTMLFormElement),
    state.lang,
  );
  const mobileMenu = initMobileMenu(
    requireElement('#mobile-menu-btn', doc, HTMLButtonElement),
    requireElement('#mobile-nav', doc),
    state.lang,
  );

  const renderFilters = (): void => {
    for (const button of filterButtons) {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  };

  const renderProjectGrid = (): void => {
    renderProjects(projectGrid, projects, state.filter, state.lang);
  };

  const renderLanguage = (): void => {
    applyDocumentLanguage(doc, state.lang);
    applyTranslations(doc, state.lang);
    languageSelect.value = state.lang;
    renderTimeline(timeline, experience, state.lang);
    renderProjectGrid();
    contactForm.setLanguage(state.lang);
    mobileMenu.setLanguage(state.lang);
    onContentRendered();
  };

  const setLanguage = (lang: Language): void => {
    if (lang === state.lang) return;
    state.lang = lang;
    storeLanguage(storage, lang);
    renderLanguage();
  };

  const setFilter = (filter: ProjectFilter): void => {
    state.filter = filter;
    renderFilters();
    renderProjectGrid();
  };

  languageSelect.addEventListener('change', () => {
    if (isLanguage(languageSelect.value)) setLanguage(languageSelect.value);
  });
  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      if (isProjectFilter(button.dataset.filter)) setFilter(button.dataset.filter);
    });
  }

  renderTechStack(techGrid, techStack);
  hydrateIcons(doc);
  renderFilters();
  renderLanguage();

  return { state, setLanguage, setFilter };
};
