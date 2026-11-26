import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fira-code';
import '@fontsource-variable/syne';
import './styles/main.css';
import { createApp } from './app';
import { requireElement } from './lib/dom';
import { hasFinePointer, prefersReducedMotion } from './lib/motion';
import {
  initCustomCursor,
  initMagneticElements,
  observeReveals,
  playIntro,
  runBootSequence,
} from './ui/motion-effects';
import { initScrollChrome } from './ui/navigation';
import { TERMINAL_SOURCE, typeCode } from './ui/terminal';

const reducedMotion = prefersReducedMotion();
const root = document.documentElement;
root.classList.add('js');
root.classList.toggle('reduced-motion', reducedMotion);

createApp(document, () => {
  observeReveals();
});
initScrollChrome(requireElement('#navbar'), requireElement('#progress-bar'));

if (hasFinePointer() && !reducedMotion) {
  initCustomCursor(requireElement('#cursor-dot'), requireElement('#cursor-ring'));
  initMagneticElements();
}

const terminal = requireElement('#terminal-container');

void runBootSequence(requireElement('#preloader'), reducedMotion).then(() => {
  if (!reducedMotion) playIntro();
  void typeCode(terminal, TERMINAL_SOURCE, { instant: reducedMotion });
});

const startBackground = (): void => {
  void import('./webgl/particle-sphere').then(({ startParticleSphere }) =>
    startParticleSphere(
      requireElement('#webgl-canvas', document, HTMLCanvasElement),
      !reducedMotion,
    ),
  );
};

if ('requestIdleCallback' in window) window.requestIdleCallback(startBackground, { timeout: 2000 });
else setTimeout(startBackground, 500);
