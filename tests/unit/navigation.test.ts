import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireElement } from '../../src/lib/dom';
import { initMobileMenu, initScrollChrome, scrollProgress } from '../../src/ui/navigation';

const stubMatchMedia = (): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn() })),
  );
};

describe('initMobileMenu', () => {
  let button: HTMLButtonElement;
  let menu: HTMLElement;

  beforeEach(() => {
    stubMatchMedia();
    document.body.innerHTML = '<button></button><nav hidden><a href="#about">About</a></nav>';
    button = requireElement('button', document, HTMLButtonElement);
    menu = requireElement('nav');
  });

  it('toggles visibility and accessible state', () => {
    const menuController = initMobileMenu(button, menu, 'en');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Open menu');

    button.click();
    expect(menuController.isOpen()).toBe(true);
    expect(menu.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Close menu');

    menuController.setLanguage('pt');
    expect(button.getAttribute('aria-label')).toBe('Fechar menu');
  });

  it('closes on link click, on Escape (restoring focus) and programmatically', () => {
    const menuController = initMobileMenu(button, menu, 'en');
    button.click();
    menu.querySelector('a')?.click();
    expect(menu.hidden).toBe(true);

    button.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(button);

    button.click();
    menuController.close();
    expect(menuController.isOpen()).toBe(false);
  });
});

describe('scroll chrome', () => {
  it('computes clamped progress and handles non-scrollable pages', () => {
    expect(scrollProgress(0, 1000, 1000)).toBe(0);
    expect(scrollProgress(250, 1500, 500)).toBe(0.25);
    expect(scrollProgress(5000, 1500, 500)).toBe(1);
    expect(scrollProgress(-10, 1500, 500)).toBe(0);
  });

  it('marks the header as scrolled and scales the progress bar', () => {
    const header = document.createElement('header');
    const bar = document.createElement('div');
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    initScrollChrome(header, bar);
    expect(header.classList.contains('is-scrolled')).toBe(false);

    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(header.classList.contains('is-scrolled')).toBe(true);
    expect(bar.style.transform).toMatch(/^scaleX\(/);
  });
});
