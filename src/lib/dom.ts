type Child = Node | string | null | undefined | false;

type Attributes = Readonly<Record<string, string | number | boolean | undefined>>;

/** Minimal element factory: children are inserted as nodes or text, never parsed as HTML. */
export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attributes = {},
  children: readonly Child[] = [],
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    el.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
};

export const requireElement = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
  type?: abstract new (...args: never[]) => T,
): T => {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Required element not found: ${selector}`);
  const expected = type ?? HTMLElement;
  if (!(el instanceof expected)) throw new Error(`Element ${selector} is not a ${expected.name}`);
  return el as T;
};
