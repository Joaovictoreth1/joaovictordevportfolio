import csharpIcon from 'devicon/icons/csharp/csharp-original.svg';
import dockerIcon from 'devicon/icons/docker/docker-original.svg';
import flutterIcon from 'devicon/icons/flutter/flutter-original.svg';
import gitIcon from 'devicon/icons/git/git-original.svg';
import html5Icon from 'devicon/icons/html5/html5-original.svg';
import javascriptIcon from 'devicon/icons/javascript/javascript-original.svg';
import linuxIcon from 'devicon/icons/linux/linux-original.svg';
import mongodbIcon from 'devicon/icons/mongodb/mongodb-original.svg';
import sqlServerIcon from 'devicon/icons/microsoftsqlserver/microsoftsqlserver-original.svg';
import mysqlIcon from 'devicon/icons/mysql/mysql-original.svg';
import nodejsIcon from 'devicon/icons/nodejs/nodejs-original.svg';
import phpIcon from 'devicon/icons/php/php-original.svg';
import postgresqlIcon from 'devicon/icons/postgresql/postgresql-original.svg';
import pythonIcon from 'devicon/icons/python/python-original.svg';
import reactIcon from 'devicon/icons/react/react-original.svg';
import typescriptIcon from 'devicon/icons/typescript/typescript-original.svg';
import type { Localized } from '../i18n/types';
import type { IconName } from '../ui/icons';

export interface Experience {
  readonly period: Localized;
  readonly role: Localized;
  readonly company: string;
  readonly description: Localized;
  readonly tech: readonly string[];
}

export interface TechItem {
  readonly name: string;
  readonly icon: string;
}

export interface TechCategory {
  readonly category: string;
  readonly items: readonly TechItem[];
}

export const PROJECT_CATEGORIES = ['backend', 'fullstack', 'edge'] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectFilter = ProjectCategory | 'all';

export interface Project {
  readonly title: Localized;
  readonly category: ProjectCategory;
  readonly description: Localized;
  readonly tags: readonly string[];
  readonly url: string;
  readonly icon: IconName;
}

export const experience: readonly Experience[] = [
  {
    period: { pt: 'Mar 2026 - Set 2026', en: 'Mar 2026 - Sep 2026' },
    role: { pt: 'Fullstack Developer', en: 'Fullstack Developer' },
    company: 'Revisa Pass',
    description: {
      pt: 'Construção de plataforma educacional. Frontend em React.js + Tailwind, Backend em Laravel/SQL e integração nativa com API de pagamentos ASAAS.',
      en: 'Built an educational platform. Frontend in React.js + Tailwind, Backend in Laravel/SQL and native integration with ASAAS payment API.',
    },
    tech: ['React.js', 'Laravel', 'SQL', 'Tailwind', 'APIs'],
  },
  {
    period: { pt: 'Jun 2024 - Nov 2025', en: 'Jun 2024 - Nov 2025' },
    role: { pt: 'Game & Web Developer', en: 'Game & Web Developer' },
    company: 'S2 DominozDuels',
    description: {
      pt: 'Desenvolvimento de engine de jogos online (Dominó multiplayer em tempo real, Paciência, Campo Minado) com integrações financeiras.',
      en: 'Development of online game engine (Real-time multiplayer Dominoes, Solitaire, Minesweeper) with financial integrations.',
    },
    tech: ['JavaScript', 'PHP', 'WebSockets', 'SQL', 'HTML/CSS'],
  },
  {
    period: { pt: 'Out 2024 - Fev 2025', en: 'Oct 2024 - Feb 2025' },
    role: { pt: 'Node.js Developer', en: 'Node.js Developer' },
    company: 'B7 Desenvolvimento',
    description: {
      pt: 'Desenvolvimento de APIs robustas em Node.js integradas com MongoDB, além de arquitetura Frontend utilizando React.js e gestão de Device Farm.',
      en: 'Development of robust Node.js APIs integrated with MongoDB, plus Frontend architecture using React.js and Device Farm management.',
    },
    tech: ['Node.js', 'MongoDB', 'React.js', 'Appium'],
  },
  {
    period: { pt: 'Jan 2024 - Jul 2024', en: 'Jan 2024 - Jul 2024' },
    role: { pt: 'Mobile Developer', en: 'Mobile Developer' },
    company: 'Captador',
    description: {
      pt: 'Engenharia de aplicativo (Dart/Flutter) focado em chat de atendimento corporativo integrado ao WhatsApp Business e gateways de pagamento.',
      en: 'App engineering (Dart/Flutter) focused on corporate customer service chat integrated with WhatsApp Business and payment gateways.',
    },
    tech: ['Flutter', 'Dart', 'WhatsApp API'],
  },
];

export const techStack: readonly TechCategory[] = [
  {
    category: 'Back-end',
    items: [
      { name: 'Python', icon: pythonIcon },
      { name: 'C#', icon: csharpIcon },
      { name: 'Node.js', icon: nodejsIcon },
      { name: 'PHP', icon: phpIcon },
    ],
  },
  {
    category: 'Front-end',
    items: [
      { name: 'JavaScript', icon: javascriptIcon },
      { name: 'TypeScript', icon: typescriptIcon },
      { name: 'React', icon: reactIcon },
      { name: 'HTML/CSS', icon: html5Icon },
    ],
  },
  {
    category: 'Database',
    items: [
      { name: 'SQL Server', icon: sqlServerIcon },
      { name: 'PostgreSQL', icon: postgresqlIcon },
      { name: 'MongoDB', icon: mongodbIcon },
      { name: 'MySQL', icon: mysqlIcon },
    ],
  },
  {
    category: 'DevOps & Tools',
    items: [
      { name: 'Git', icon: gitIcon },
      { name: 'Linux', icon: linuxIcon },
      { name: 'Docker', icon: dockerIcon },
      { name: 'Flutter', icon: flutterIcon },
    ],
  },
];

export const projects: readonly Project[] = [
  {
    title: { pt: 'Mercado Bela Esperança', en: 'Bela Esperança Market' },
    category: 'fullstack',
    description: {
      pt: 'Plataforma E-commerce Enterprise. Arquitetura para alto tráfego, banco otimizado e frontend de alta conversão.',
      en: 'Enterprise E-commerce Platform. High-traffic architecture, optimized database and high-conversion frontend.',
    },
    tags: ['Node.js', 'React', 'SQL', 'Payment API'],
    url: 'https://mercadobelaesperanca.shop',
    icon: 'shopping-cart',
  },
  {
    title: { pt: 'CyberEdge Gym', en: 'CyberEdge Gym' },
    category: 'edge',
    description: {
      pt: 'Dashboard para academias com Edge Computing. Offline-first, sync background e gráficos de alta performance via Canvas.',
      en: 'Gym dashboard with Edge Computing. Offline-first, background sync and high-performance Canvas charts.',
    },
    tags: ['Edge Node', 'JS', 'PWA'],
    url: 'https://cyberedgegym.shop',
    icon: 'activity',
  },
  {
    title: { pt: 'Core API Architecture', en: 'Core API Architecture' },
    category: 'backend',
    description: {
      pt: 'Conjunto de APIs RESTful escaláveis em C# e Python. Foco em microsserviços, web scraping seguro e autenticação JWT.',
      en: 'Set of scalable RESTful APIs in C# and Python. Focus on microservices, secure web scraping and JWT auth.',
    },
    tags: ['C#', '.NET', 'Python', 'Security'],
    url: 'https://github.com/Joaovictoreth1',
    icon: 'server-cog',
  },
  {
    title: { pt: 'DominozDuels Engine', en: 'DominozDuels Engine' },
    category: 'fullstack',
    description: {
      pt: 'Motor de jogos de tabuleiro em tempo real via WebSockets. Sincronização de estado complexa e latência ultrabaixa.',
      en: 'Real-time board game engine via WebSockets. Complex state synchronization and ultra-low latency.',
    },
    tags: ['WebSockets', 'JS', 'PHP', 'Game Engine'],
    url: 'https://dominozduels.com',
    icon: 'gamepad-2',
  },
];
