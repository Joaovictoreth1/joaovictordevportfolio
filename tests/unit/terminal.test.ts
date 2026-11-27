import { describe, expect, it, vi } from 'vitest';
import { TERMINAL_SOURCE, tokenize, typeCode } from '../../src/ui/terminal';

describe('tokenize', () => {
  it('round-trips the source exactly', () => {
    expect(
      tokenize(TERMINAL_SOURCE)
        .map((t) => t.text)
        .join(''),
    ).toBe(TERMINAL_SOURCE);
  });

  it('classifies keywords, strings, calls, this and comments', () => {
    const tokens = tokenize('/** doc */ const x = "class"; this.y = await SQL.optimize();');
    expect(tokens).toEqual([
      { kind: 'comment', text: '/** doc */' },
      { kind: 'plain', text: ' ' },
      { kind: 'keyword', text: 'const' },
      { kind: 'plain', text: ' x = ' },
      { kind: 'string', text: '"class"' },
      { kind: 'plain', text: '; ' },
      { kind: 'self', text: 'this' },
      { kind: 'plain', text: '.y = ' },
      { kind: 'keyword', text: 'await' },
      { kind: 'plain', text: ' ' },
      { kind: 'call', text: 'SQL.optimize' },
      { kind: 'plain', text: '();' },
    ]);
  });

  it('does not highlight keywords inside identifiers', () => {
    expect(tokenize('classic newer')).toEqual([{ kind: 'plain', text: 'classic newer' }]);
  });
});

describe('typeCode', () => {
  it('renders instantly with text nodes only and no markup corruption', async () => {
    const el = document.createElement('pre');
    await typeCode(el, 'class A { x = "<b>&amp;</b>" }', { instant: true });
    expect(el.textContent).toBe('class A { x = "<b>&amp;</b>" }');
    expect(el.querySelector('b')).toBeNull();
    expect(el.querySelector('.text-purple-400')?.textContent).toBe('class');
    expect(el.querySelector('.text-green-400')?.textContent).toBe('"<b>&amp;</b>"');
    expect(el.lastElementChild?.className).toBe('terminal-caret');
  });

  it('types one character per tick and ends with the full source', async () => {
    const el = document.createElement('pre');
    const queue: (() => void)[] = [];
    const schedule = vi.fn((cb: () => void) => queue.push(cb));
    const done = typeCode(el, 'new "x"', { instant: false, schedule, delay: () => 0 });

    expect(el.textContent).toBe('n');
    while (queue.length) queue.shift()?.();
    await done;

    expect(el.textContent).toBe('new "x"');
    expect(schedule).toHaveBeenCalledTimes(7);
    expect(el.querySelector('.text-purple-400')?.textContent).toBe('new');
  });
});
