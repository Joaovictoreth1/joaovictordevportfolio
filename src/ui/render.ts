import type { Experience, Project, ProjectFilter, TechCategory } from '../content/data';
import { translate } from '../i18n/dictionary';
import type { Language } from '../i18n/types';
import { h } from '../lib/dom';
import { createIcon } from './icons';

const chip = (label: string, className: string): HTMLSpanElement =>
  h('span', { class: className }, [label]);

export const renderTimeline = (
  container: HTMLElement,
  items: readonly Experience[],
  lang: Language,
): void => {
  container.replaceChildren(
    ...items.map((job) =>
      h('article', { class: 'relative pl-8 mb-12 reveal' }, [
        h('div', { class: 'timeline-dot', 'aria-hidden': 'true' }),
        h('div', { class: 'glass-panel p-6 rounded-2xl group hover:border-brand-500/50' }, [
          h(
            'div',
            { class: 'flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2' },
            [
              h(
                'h3',
                {
                  class:
                    'font-display font-bold text-xl text-white group-hover:text-brand-400 transition-colors',
                },
                [job.role[lang]],
              ),
              h(
                'span',
                {
                  class:
                    'font-mono text-xs text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 self-start md:self-auto',
                },
                [job.period[lang]],
              ),
            ],
          ),
          h('p', { class: 'text-slate-400 font-medium mb-4' }, [job.company]),
          h('p', { class: 'text-slate-300 text-sm leading-relaxed mb-6 font-light' }, [
            job.description[lang],
          ]),
          h(
            'ul',
            { class: 'flex flex-wrap gap-2', role: 'list' },
            job.tech.map((tech) =>
              h('li', {}, [
                chip(
                  tech,
                  'text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700',
                ),
              ]),
            ),
          ),
        ]),
      ]),
    ),
  );
};

export const renderTechStack = (
  container: HTMLElement,
  categories: readonly TechCategory[],
): void => {
  container.replaceChildren(
    ...categories.map((group) =>
      h('div', { class: 'glass-panel p-6 rounded-2xl flex flex-col reveal' }, [
        h(
          'h3',
          {
            class:
              'font-mono text-sm text-slate-400 mb-6 uppercase tracking-widest border-b border-surface-border pb-2',
          },
          [group.category],
        ),
        h(
          'ul',
          { class: 'grid grid-cols-2 gap-4 flex-grow', role: 'list' },
          group.items.map((item) =>
            h(
              'li',
              {
                class:
                  'flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors group',
              },
              [
                h('img', {
                  src: item.icon,
                  alt: '',
                  width: 40,
                  height: 40,
                  loading: 'lazy',
                  decoding: 'async',
                  class:
                    'w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110',
                }),
                h(
                  'span',
                  {
                    class:
                      'text-xs font-medium text-slate-400 group-hover:text-white transition-colors text-center',
                  },
                  [item.name],
                ),
              ],
            ),
          ),
        ),
      ]),
    ),
  );
};

export const filterProjects = (
  items: readonly Project[],
  filter: ProjectFilter,
): readonly Project[] => (filter === 'all' ? items : items.filter((p) => p.category === filter));

export const renderProjects = (
  container: HTMLElement,
  items: readonly Project[],
  filter: ProjectFilter,
  lang: Language,
): void => {
  const visible = filterProjects(items, filter);

  if (visible.length === 0) {
    container.replaceChildren(
      h('p', { class: 'col-span-full text-center text-slate-400 font-mono text-sm' }, [
        translate(lang, 'projectsEmpty'),
      ]),
    );
    return;
  }

  container.replaceChildren(
    ...visible.map((project, index) => {
      const title = project.title[lang];
      return h(
        'article',
        {
          class: `glass-panel rounded-3xl p-6 flex flex-col h-full group project-card animate-fade-up project-delay-${Math.min(index, 5)}`,
        },
        [
          h(
            'div',
            {
              class:
                'w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 relative z-10',
            },
            [createIcon(project.icon)],
          ),
          h('h3', { class: 'font-display text-xl font-bold mb-3 text-slate-200' }, [title]),
          h('p', { class: 'text-slate-400 text-sm mb-8 flex-grow leading-relaxed font-light' }, [
            project.description[lang],
          ]),
          h(
            'div',
            {
              class:
                'flex items-center justify-between border-t border-surface-border pt-5 mt-auto gap-4',
            },
            [
              h(
                'ul',
                { class: 'flex flex-wrap gap-2', role: 'list' },
                project.tags
                  .slice(0, 3)
                  .map((tag) =>
                    h('li', {}, [
                      chip(
                        tag,
                        'text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20',
                      ),
                    ]),
                  ),
              ),
              h(
                'a',
                {
                  href: project.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': `${translate(lang, 'openProject')}: ${title} ${translate(lang, 'newTab')}`,
                  class:
                    'w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 hover:border-brand-500 transition-all interactive flex-shrink-0',
                },
                [createIcon('arrow-up-right', 'w-4 h-4')],
              ),
            ],
          ),
        ],
      );
    }),
  );
};
