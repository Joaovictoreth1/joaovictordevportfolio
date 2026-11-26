import { translate } from '../i18n/dictionary';
import type { Language } from '../i18n/types';
import { createIcon } from './icons';

export interface MobileMenuController {
  readonly isOpen: () => boolean;
  readonly close: () => void;
  readonly setLanguage: (lang: Language) => void;
}

export const initMobileMenu = (
  button: HTMLButtonElement,
  menu: HTMLElement,
  initialLang: Language,
): MobileMenuController => {
  let lang = initialLang;
  let open = false;

  const render = (): void => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', translate(lang, open ? 'menuClose' : 'menuOpen'));
    button.replaceChildren(createIcon(open ? 'x' : 'menu', 'w-6 h-6'));
  };

  const setOpen = (next: boolean, restoreFocus = false): void => {
    if (open === next) return;
    open = next;
    render();
    if (!open && restoreFocus) button.focus();
  };

  button.addEventListener('click', () => {
    setOpen(!open);
  });
  menu.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setOpen(false, true);
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });

  render();

  return {
    isOpen: () => open,
    close: () => {
      setOpen(false);
    },
    setLanguage: (next) => {
      lang = next;
      render();
    },
  };
};

export const scrollProgress = (scrollY: number, scrollHeight: number, viewport: number): number => {
  const scrollable = scrollHeight - viewport;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / scrollable));
};

export const initScrollChrome = (header: HTMLElement, progressBar: HTMLElement): void => {
  let frame = 0;
  const update = (): void => {
    frame = 0;
    const { scrollY, innerHeight } = window;
    header.classList.toggle('is-scrolled', scrollY > 50);
    progressBar.style.transform = `scaleX(${scrollProgress(scrollY, document.documentElement.scrollHeight, innerHeight)})`;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
};
