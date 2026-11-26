export const prefersReducedMotion = (win: Window = window): boolean =>
  win.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = (win: Window = window): boolean =>
  win.matchMedia('(pointer: fine)').matches;
