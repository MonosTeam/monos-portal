import "server-only";
import nodemailer from "nodemailer";

// All portal email goes out from info@monos.ai over SMTP (Google Workspace app password, or any SMTP relay).
const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const FROM = process.env.EMAIL_FROM || "MONOS Technology <info@monos.ai>";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@monos.ai";

export async function sendEmail({ to, subject, html, replyTo }: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  if (!transport) {
    console.warn(`[email] SMTP not configured; skipped "${subject}" to ${to}`);
    return { sent: false };
  }
  await transport.sendMail({ from: FROM, to, subject, html: layout(html), replyTo });
  return { sent: true };
}

// Minimal MONOS-branded wrapper so every email looks the same.
function layout(body: string) {
  return `<div style="background:#f7f6f4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#141213">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3dfdd;border-radius:12px;padding:28px">
    <div style="font-weight:800;font-size:22px;letter-spacing:-.02em;margin-bottom:20px">MONOS <span style="font-weight:400;font-size:14px">Technology</span> <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e0141e;vertical-align:middle"></span></div>
    ${body}
  </div>
  <p style="text-align:center;color:#5f595b;font-size:12px;margin-top:16px">MONOS Technology · monostechnology.co.uk</p>
</div>`;
}
