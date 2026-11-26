export type TokenKind = 'keyword' | 'string' | 'call' | 'self' | 'comment' | 'plain';

export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
}

const KEYWORDS = new Set([
  'class',
  'constructor',
  'async',
  'await',
  'try',
  'catch',
  'return',
  'new',
  'const',
  'extends',
]);

const CALLS = new Set([
  'console.log',
  'Logger.fatal',
  'SQL.optimize',
  'REST.deploy',
  'React.render',
]);

const TOKEN_PATTERN =
  /(?<comment>\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(?<string>"(?:[^"\\\n]|\\.)*")|(?<word>[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/g;

const classifyWord = (word: string): TokenKind => {
  if (KEYWORDS.has(word)) return 'keyword';
  if (CALLS.has(word)) return 'call';
  if (word === 'this' || word.startsWith('this.')) return 'self';
  return 'plain';
};

/** Splits source into highlightable tokens. Concatenating the token texts reproduces the input. */
export const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  const push = (kind: TokenKind, text: string): void => {
    if (!text) return;
    const last = tokens.at(-1);
    if (last?.kind === kind && kind === 'plain') {
      tokens[tokens.length - 1] = { kind, text: last.text + text };
    } else {
      tokens.push({ kind, text });
    }
  };

  let cursor = 0;
  for (const match of source.matchAll(TOKEN_PATTERN)) {
    push('plain', source.slice(cursor, match.index));
    const { comment, string, word } = match.groups ?? {};
    if (comment !== undefined) push('comment', comment);
    else if (string !== undefined) push('string', string);
    else if (word !== undefined) {
      if (word.startsWith('this.')) {
        push('self', 'this');
        push('plain', word.slice(4));
      } else {
        push(classifyWord(word), word);
      }
    }
    cursor = match.index + match[0].length;
  }
  push('plain', source.slice(cursor));
  return tokens;
};

export const TOKEN_CLASS: Readonly<Record<TokenKind, string>> = {
  keyword: 'text-purple-400',
  string: 'text-green-400',
  call: 'text-blue-400',
  self: 'text-red-400',
  comment: 'text-slate-400',
  plain: '',
};

export const TERMINAL_SOURCE = `/**
 * @class SoftwareArchitect
 * @extends Developer
 */
class SoftwareArchitect {
  constructor() {
    this.name = "João Victor Barros";
    this.role = "Backend & Systems Arch";
    this.focus = ["Python", "C#", "Node"];
  }

  async buildInfrastructure() {
    try {
      const db = await SQL.optimize();
      const api = await REST.deploy();
      const ui = await React.render();

      return { status: 200, system: "Online" };
    } catch (err) {
      return Logger.fatal(err);
    }
  }
}

const jvbm = new SoftwareArchitect();
jvbm.buildInfrastructure().then(console.log);`;

const createTokenNode = (doc: Document, token: Token): Node => {
  const className = TOKEN_CLASS[token.kind];
  if (!className) return doc.createTextNode('');
  const span = doc.createElement('span');
  span.className = className;
  return span;
};

export interface TypewriterOptions {
  readonly instant: boolean;
  readonly schedule?: (callback: () => void, delayMs: number) => void;
  readonly delay?: () => number;
}

/**
 * Types highlighted code into `container` one character at a time using text nodes only,
 * so the rendered markup can never be corrupted by the code's contents.
 */
export const typeCode = (
  container: HTMLElement,
  source: string,
  {
    instant,
    schedule = (cb, ms) => window.setTimeout(cb, ms),
    delay = () => Math.random() * 20 + 5,
  }: TypewriterOptions,
): Promise<void> => {
  const doc = container.ownerDocument;
  const tokens = tokenize(source);
  const caret = doc.createElement('span');
  caret.className = 'terminal-caret';
  caret.setAttribute('aria-hidden', 'true');
  container.replaceChildren();

  if (instant) {
    for (const token of tokens) {
      const node = createTokenNode(doc, token);
      node.textContent = token.text;
      container.append(node);
    }
    container.append(caret);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let tokenIndex = 0;
    let charIndex = 0;
    let current: Node | null = null;
    container.append(caret);

    const step = (): void => {
      const token = tokens[tokenIndex];
      if (!token) {
        resolve();
        return;
      }
      if (!current) {
        current = createTokenNode(doc, token);
        caret.before(current);
      }
      current.textContent = (current.textContent ?? '') + token.text.charAt(charIndex);
      charIndex += 1;
      if (charIndex >= token.text.length) {
        tokenIndex += 1;
        charIndex = 0;
        current = null;
      }
      container.scrollTop = container.scrollHeight;
      schedule(step, delay());
    };

    step();
  });
};
