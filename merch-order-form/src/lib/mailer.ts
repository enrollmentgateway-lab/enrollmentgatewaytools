import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

function transporter(): Transporter {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return cached;
}

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
};

export async function sendMail(options: MailOptions): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error("SMTP is not configured. Set SMTP_HOST in your environment.");
  }
  await transporter().sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    ...options,
  });
}

/** Sends without throwing — used where a failed notification must not fail the request. */
export async function trySendMail(options: MailOptions): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    await sendMail(options);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}
