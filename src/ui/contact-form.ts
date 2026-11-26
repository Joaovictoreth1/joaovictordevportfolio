import { translate } from '../i18n/dictionary';
import type { Language } from '../i18n/types';
import { requireElement } from '../lib/dom';
import { createIcon } from './icons';

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error' | 'invalid';

export const MAX_MESSAGE_LENGTH = 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactPayload {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export const validatePayload = ({ name, email, message }: ContactPayload): boolean =>
  name.trim().length > 0 &&
  EMAIL_PATTERN.test(email.trim()) &&
  message.trim().length > 0 &&
  message.length <= MAX_MESSAGE_LENGTH;

/** Netlify Forms expects a urlencoded body that includes the `form-name` field. */
export const encodeFormData = (form: HTMLFormElement): string => {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (typeof value === 'string') params.append(key, value);
  }
  return params.toString();
};

type Fetch = (input: string, init: RequestInit) => Promise<Pick<Response, 'ok' | 'status'>>;

export interface ContactFormController {
  readonly getStatus: () => SubmitStatus;
  readonly setLanguage: (lang: Language) => void;
}

export const initContactForm = (
  form: HTMLFormElement,
  initialLang: Language,
  fetcher: Fetch = (input, init) => fetch(input, init),
): ContactFormController => {
  let lang = initialLang;
  let status: SubmitStatus = 'idle';

  const submitButton = requireElement('button[type="submit"]', form, HTMLButtonElement);
  const submitLabel = requireElement('[data-submit-label]', form);
  const submitIcon = requireElement('[data-submit-icon]', form);
  const feedback = requireElement('[data-form-feedback]', form);
  const field = (name: string): string =>
    (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '';

  const render = (): void => {
    const sending = status === 'sending';
    submitButton.disabled = sending;
    form.setAttribute('aria-busy', String(sending));
    submitLabel.textContent = translate(lang, sending ? 'formSending' : 'formSubmit');
    submitIcon.replaceChildren(
      createIcon(sending ? 'loader-circle' : 'send', sending ? 'w-4 h-4 animate-spin' : 'w-4 h-4'),
    );

    feedback.dataset.state = status;
    feedback.hidden = status === 'idle' || status === 'sending';
    if (feedback.hidden) {
      feedback.replaceChildren();
      return;
    }
    const success = status === 'success';
    const messageKey = success ? 'formSuccess' : status === 'invalid' ? 'formInvalid' : 'formError';
    feedback.replaceChildren(
      createIcon(success ? 'circle-check' : 'circle-alert', 'w-4 h-4 flex-shrink-0 mt-0.5'),
      document.createTextNode(translate(lang, messageKey)),
    );
  };

  const setStatus = (next: SubmitStatus): void => {
    status = next;
    render();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const payload = { name: field('name'), email: field('email'), message: field('message') };
    if (field('bot-field')) {
      form.reset();
      setStatus('success');
      return;
    }
    if (!validatePayload(payload)) {
      setStatus('invalid');
      return;
    }

    setStatus('sending');
    fetcher(form.getAttribute('action') ?? '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(form),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Form submission failed with HTTP ${response.status}`);
        form.reset();
        setStatus('success');
      })
      .catch((error: unknown) => {
        console.error(error);
        setStatus('error');
      });
  });

  render();

  return {
    getStatus: () => status,
    setLanguage: (next) => {
      lang = next;
      render();
    },
  };
};
