import { createTransport, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.STARTLS_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: false,
});

const defaultFromAddress = process.env.SMTP_FROM ?? 'Tribal Trend <commerce@mail.tribaltrend.com.ar>';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

const normalizeRecipients = (to: string | string[]): string => {
  return Array.isArray(to) ? to.join(', ') : to;
};

const sendEmail = async ({ to, subject, text, html, from, replyTo }: SendEmailOptions) => {
  const mailOptions: SendMailOptions = {
    from: from ?? defaultFromAddress,
    to: normalizeRecipients(to),
    subject,
    text,
    html,
    replyTo,
  };

  return transporter.sendMail(mailOptions);
};

export { sendEmail, transporter };