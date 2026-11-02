// Emails from the website agent (sent from info@monos.ai over the portal's SMTP settings).
// Kept separate from src/lib/email.ts because the agent also runs outside Next.js (Netlify background function).
import nodemailer from "nodemailer";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@monos.ai";
const FROM = process.env.EMAIL_FROM || "MONOS Technology <info@monos.ai>";

export async function mail(to: string, subject: string, body: string, replyTo?: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[site-agent] SMTP not configured; skipped "${subject}" to ${to}`);
    return false;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await t.sendMail({
    from: FROM, to, subject, replyTo,
    html: `<div style="background:#f7f6f4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#141213"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3dfdd;border-radius:12px;padding:28px"><div style="font-weight:800;font-size:22px;letter-spacing:-.02em;margin-bottom:20px">MONOS <span style="font-weight:400;font-size:14px">Technology</span> <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d23b2c;vertical-align:middle"></span></div>${body}</div><p style="text-align:center;color:#5f595b;font-size:12px;margin-top:16px">MONOS Technology · monostechnology.co.uk</p></div>`,
  });
  return true;
}

export const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:#d23b2c;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;display:inline-block">${label}</a></p>`;
export const h = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
