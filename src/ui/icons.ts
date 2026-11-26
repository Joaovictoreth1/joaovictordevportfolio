import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CircleAlert,
  CircleCheck,
  CodeXml,
  Cpu,
  ExternalLink,
  Gamepad2,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  Menu,
  Send,
  ServerCog,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  X,
  createElement,
  createIcons,
  type IconNode,
} from 'lucide';

const ICONS = {
  activity: Activity,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'brain-circuit': BrainCircuit,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'code-xml': CodeXml,
  cpu: Cpu,
  'external-link': ExternalLink,
  'gamepad-2': Gamepad2,
  globe: Globe,
  'loader-circle': LoaderCircle,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  send: Send,
  'server-cog': ServerCog,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
  terminal: Terminal,
  x: X,
} as const satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

const toPascalCase = (name: string): string =>
  name.replace(/(^|-)(\w)/g, (_match, _dash: string, letter: string) => letter.toUpperCase());

const REGISTRY: Record<string, IconNode> = Object.fromEntries(
  Object.entries(ICONS).map(([name, node]) => [toPascalCase(name), node]),
);

/** Replaces every `<i data-lucide="...">` placeholder under `root` with its inline SVG. */
export const hydrateIcons = (root: Element | Document = document): void => {
  createIcons({ icons: REGISTRY, root, attrs: { 'aria-hidden': 'true', focusable: 'false' } });
};

export const createIcon = (name: IconName, className = ''): SVGElement =>
  createElement(ICONS[name], {
    class: ['lucide', `lucide-${name}`, className].filter(Boolean).join(' '),
    'aria-hidden': 'true',
    focusable: 'false',
  });
