import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { assertEmailConfig, emailConfig } from '../config';
import type { EmailProvider, SendEmailOptions } from '../types';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    assertEmailConfig();

    const tlsOptions = emailConfig.ignoreTls
      ? { rejectUnauthorized: false }
      : { minVersion: 'TLSv1.2' as const };

    const transportOptions: SMTPTransport.Options = {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      requireTLS: emailConfig.requireTls,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
      tls: tlsOptions,
      connectionTimeout: emailConfig.connectionTimeout,
      greetingTimeout: emailConfig.connectionTimeout,
      socketTimeout: emailConfig.connectionTimeout,
    };

    transporter = nodemailer.createTransport(transportOptions);
  }
  return transporter;
}

async function sendWithRetry(
  transport: Transporter,
  options: SendEmailOptions,
  attempt = 0,
): Promise<void> {
  try {
    await transport.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    const isLastAttempt = attempt >= emailConfig.maxRetries;
    const message = error instanceof Error ? error.message : String(error);
    const retriable =
      message.includes('socket close') ||
      message.includes('ECONNRESET') ||
      message.includes('ETIMEDOUT');

    if (!isLastAttempt && retriable) {
      if (emailConfig.pool) {
        transporter?.close();
        transporter = null;
      }
      await sendWithRetry(getTransporter(), options, attempt + 1);
      return;
    }

    throw error;
  }
}

export const nodemailerProvider: EmailProvider = {
  async send(options: SendEmailOptions): Promise<void> {
    const transport = getTransporter();
    await sendWithRetry(transport, options);
  },
};

/** Reset pooled connection (e.g. after config change in dev) */
export function resetEmailTransporter(): void {
  transporter?.close();
  transporter = null;
}
