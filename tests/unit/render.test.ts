import { describe, expect, it } from 'vitest';
import { experience, projects, techStack, type Project } from '../../src/content/data';
import { h, requireElement } from '../../src/lib/dom';
import {
  filterProjects,
  renderProjects,
  renderTechStack,
  renderTimeline,
} from '../../src/ui/render';

describe('h', () => {
  it('sets attributes and inserts children as text, never HTML', () => {
    const el = h('a', { href: '/x', hidden: true, skip: undefined, off: false, n: 3 }, [
      '<img src=x onerror=alert(1)>',
      null,
      false,
    ]);
    expect(el.getAttribute('href')).toBe('/x');
    expect(el.hasAttribute('hidden')).toBe(true);
    expect(el.hasAttribute('skip')).toBe(false);
    expect(el.hasAttribute('off')).toBe(false);
    expect(el.getAttribute('n')).toBe('3');
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('requireElement throws for a missing node', () => {
    expect(() => requireElement('#missing')).toThrow('Required element not found: #missing');
  });
});

describe('filterProjects', () => {
  it('returns everything for "all" and only matching categories otherwise', () => {
    expect(filterProjects(projects, 'all')).toHaveLength(projects.length);
    const fullstack = filterProjects(projects, 'fullstack');
    expect(fullstack.length).toBeGreaterThan(0);
    expect(fullstack.every((p) => p.category === 'fullstack')).toBe(true);
  });
});

describe('renderProjects', () => {
  it('renders the localized, filtered cards with safe external links', () => {
    const grid = document.createElement('div');
    renderProjects(grid, projects, 'edge', 'en');
    const cards = grid.querySelectorAll('article');
    expect(cards).toHaveLength(1);
    expect(cards[0]?.querySelector('h3')?.textContent).toBe('CyberEdge Gym');
    const link = cards[0]?.querySelector('a');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.getAttribute('aria-label')).toBe(
      'Open project: CyberEdge Gym (opens in a new tab)',
    );
    expect(cards[0]?.querySelectorAll('svg').length).toBe(2);
  });

  it('renders an empty state when nothing matches', () => {
    const grid = document.createElement('div');
    renderProjects(grid, [] satisfies Project[], 'backend', 'pt');
    expect(grid.textContent).toBe('Nenhum projeto nesta categoria ainda.');
  });
});

describe('renderTimeline and renderTechStack', () => {
  it('renders every job in the requested language', () => {
    const el = document.createElement('div');
    renderTimeline(el, experience, 'en');
    expect(el.querySelectorAll('article')).toHaveLength(experience.length);
    expect(el.textContent).toContain('Mar 2026 - Sep 2026');
    renderTimeline(el, experience, 'pt');
    expect(el.textContent).toContain('Mar 2026 - Set 2026');
  });

  it('renders each tech with a lazy, decorative icon and visible name', () => {
    const el = document.createElement('div');
    renderTechStack(el, techStack);
    const images = el.querySelectorAll('img');
    expect(images).toHaveLength(techStack.flatMap((c) => c.items).length);
    images.forEach((img) => {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });
});
