import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  encodeFormData,
  initContactForm,
  MAX_MESSAGE_LENGTH,
  validatePayload,
} from '../../src/ui/contact-form';
import { requireElement } from '../../src/lib/dom';

const mount = (): HTMLFormElement => {
  document.body.innerHTML = `
    <form id="f" action="/">
      <input type="hidden" name="form-name" value="contact" />
      <input name="bot-field" />
      <input name="name" /><input name="email" /><textarea name="message"></textarea>
      <button type="submit"><span data-submit-label></span><span data-submit-icon></span></button>
      <p data-form-feedback hidden></p>
    </form>`;
  return requireElement('form', document, HTMLFormElement);
};

const fill = (form: HTMLFormElement, values: Record<string, string>): void => {
  for (const [name, value] of Object.entries(values)) {
    (form.elements.namedItem(name) as HTMLInputElement).value = value;
  }
};

const submit = (form: HTMLFormElement): void => {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
};

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there' };

describe('validatePayload', () => {
  it('accepts a complete payload', () => {
    expect(validatePayload(valid)).toBe(true);
  });
  it.each([
    { ...valid, name: '  ' },
    { ...valid, email: 'not-an-email' },
    { ...valid, message: '' },
    { ...valid, message: 'x'.repeat(MAX_MESSAGE_LENGTH + 1) },
  ])('rejects %o', (payload) => {
    expect(validatePayload(payload)).toBe(false);
  });
});

describe('initContactForm', () => {
  let form: HTMLFormElement;
  const feedback = (): HTMLElement => requireElement('[data-form-feedback]', form);

  beforeEach(() => {
    form = mount();
  });

  it('encodes every field including form-name for Netlify', () => {
    fill(form, valid);
    expect(encodeFormData(form)).toBe(
      'form-name=contact&bot-field=&name=Ada&email=ada%40example.com&message=Hello+there',
    );
  });

  it('posts urlencoded data and shows success only after the server accepts it', async () => {
    let resolveFetch: (value: { ok: boolean; status: number }) => void = () => undefined;
    const fetcher = vi.fn(
      () =>
        new Promise<{ ok: boolean; status: number }>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const controller = initContactForm(form, 'en', fetcher);
    fill(form, valid);
    submit(form);

    expect(controller.getStatus()).toBe('sending');
    expect(form.querySelector('button')?.disabled).toBe(true);
    expect(form.querySelector('[data-submit-label]')?.textContent).toBe('Sending...');
    submit(form);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: expect.stringContaining('form-name=contact') as string,
    });

    resolveFetch({ ok: true, status: 200 });
    await flush();

    expect(controller.getStatus()).toBe('success');
    expect(feedback().hidden).toBe(false);
    expect(feedback().textContent).toBe("Message received. I'll get back to you soon.");
    expect((form.elements.namedItem('name') as HTMLInputElement).value).toBe('');
  });

  it('shows an error and keeps the user input when the server rejects it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const controller = initContactForm(form, 'pt', () =>
      Promise.resolve({ ok: false, status: 500 }),
    );
    fill(form, valid);
    submit(form);
    await flush();

    expect(controller.getStatus()).toBe('error');
    expect(feedback().dataset.state).toBe('error');
    expect(feedback().textContent).toContain('Não foi possível enviar');
    expect((form.elements.namedItem('message') as HTMLTextAreaElement).value).toBe('Hello there');
    expect(form.querySelector('button')?.disabled).toBe(false);
    expect(error).toHaveBeenCalled();

    controller.setLanguage('en');
    expect(feedback().textContent).toContain("Couldn't send right now");
  });

  it('blocks invalid input without a request', () => {
    const fetcher = vi.fn();
    const controller = initContactForm(form, 'en', fetcher);
    fill(form, { ...valid, email: 'nope' });
    submit(form);
    expect(controller.getStatus()).toBe('invalid');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('silently drops honeypot submissions', () => {
    const fetcher = vi.fn();
    const controller = initContactForm(form, 'en', fetcher);
    fill(form, { ...valid, 'bot-field': 'spam' });
    submit(form);
    expect(controller.getStatus()).toBe('success');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
