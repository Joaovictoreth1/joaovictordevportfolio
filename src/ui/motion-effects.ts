import { gsap } from 'gsap';

const BOOT_LINES = [
  'INIT SYSTEM: kernel module jvbm_core loaded.',
  'MOUNTING: virtual_dom on /dev/ui...',
  'STARTING: WebGL Physics Engine...',
  'LOADING: Skills matrix [Python, C#, JS, SQL]... OK',
  'ESTABLISHING: Secure connection to neural net...',
  'STATUS: Architecture stabilized. Ready for deploy.',
];

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** Plays the boot log, then fades the preloader out. Resolves once the page is revealed. */
export const runBootSequence = async (
  preloader: HTMLElement,
  reducedMotion: boolean,
): Promise<void> => {
  if (!reducedMotion) {
    for (const text of BOOT_LINES) {
      const line = document.createElement('p');
      line.className = 'boot-line';
      line.textContent = `> ${text}`;
      preloader.append(line);
      window.requestAnimationFrame(() => {
        line.classList.add('visible');
      });
      await wait(Math.random() * 200 + 80);
    }
    await wait(300);
  }
  preloader.classList.add('is-done');
  window.setTimeout(
    () => {
      preloader.remove();
    },
    reducedMotion ? 0 : 700,
  );
};

export const playIntro = (): void => {
  gsap.fromTo(
    '.gs-reveal',
    { y: 60, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: 'power4.out' },
  );
  gsap.fromTo(
    '.gs-reveal-right',
    { x: 100, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out', delay: 0.5 },
  );
};

const INTERACTIVE = '.interactive, button, a, input, textarea, select';

export const initCustomCursor = (dot: HTMLElement, ring: HTMLElement): void => {
  const root = document.documentElement;
  root.classList.add('has-custom-cursor');
  window.addEventListener(
    'pointermove',
    (event) => {
      dot.style.transform = `translate3d(${event.clientX - 3}px, ${event.clientY - 3}px, 0)`;
      ring.style.transform = `translate3d(calc(${event.clientX}px - 50%), calc(${event.clientY}px - 50%), 0)`;
    },
    { passive: true },
  );
  document.addEventListener('pointerdown', () => {
    root.classList.add('cursor-click');
  });
  document.addEventListener('pointerup', () => {
    root.classList.remove('cursor-click');
  });
  document.addEventListener('pointerover', (event) => {
    root.classList.toggle('cursor-hover', Boolean((event.target as Element).closest(INTERACTIVE)));
  });
};

export const initMagneticElements = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>('.magnetic-wrap').forEach((wrapper) => {
    const target = wrapper.firstElementChild;
    if (!target) return;
    wrapper.addEventListener('pointermove', (event) => {
      const rect = wrapper.getBoundingClientRect();
      gsap.to(target, {
        x: (event.clientX - rect.left - rect.width / 2) * 0.3,
        y: (event.clientY - rect.top - rect.height / 2) * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    wrapper.addEventListener('pointerleave', () => {
      gsap.to(target, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
  });
};

export const observeReveals = (root: ParentNode = document): void => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.1 },
  );
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    observer.observe(el);
  });
};
