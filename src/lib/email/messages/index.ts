import type { EmailLocale } from '../types';

import en from './en.json';
import vi from './vi.json';

const messages: Record<EmailLocale, typeof en> = { en, vi };

export type EmailMessages = (typeof messages)['en'];

export function getEmailMessages(locale: EmailLocale): EmailMessages {
  return messages[locale] ?? messages.en;
}
