# MONOS Client Portal

A private portal for each MONOS Technology client: build progress, consultation form, file uploads, agreement signing and payments. Branded as MONOS for every client; what each client sees is customised per project from the admin screen.

Stack: Next.js 15 (App Router), Supabase (auth, Postgres with row-level security, storage), deployed on Vercel.

## What's in it

**For clients**
- Sign in by password or emailed link. New clients are invited by email and choose a password.
- **Progress:** a completion ring and a timeline of the 7-day build (Discovery, Design, Build, Review, Launch) with due dates and notes from MONOS, plus a "next steps" list.
- **Consultation:** the website brief, saved as a draft or submitted. Only the sections switched on for that client appear.
- **Files:** upload a logo, photos and documents.
- **Agreement:** read and e-sign (typed name, checkbox consent, and the timestamp and IP recorded), then download as a PDF via print.
- **Payments:** deposit and balance with status and a "Pay now" button that links to a PayPal or Stripe payment link.

**For MONOS (admin)**
- Dashboard: websites sold out of the 10 target, £ booked and £ collected, and every client's progress, brief, signature and payment status. Overdue stages show in amber.
- Add a client: sends the invite and creates the project, the five stages with due dates, a 50/50 deposit and balance, and the agreement, all in one step.
- Per client: update stages and client-visible notes, switch portal sections on and off, choose consultation sections, add or mark payments, edit the agreement until it's signed, and read their brief and files.

## Set up (about 20 minutes)

1. **Supabase:** create a free project at supabase.com (region: London). In the SQL editor, run `supabase/schema.sql`.
2. **Auth settings:** in Authentication → URL configuration, set Site URL to `https://portal.monostechnology.co.uk` and add it to redirect URLs. In Authentication → Email templates:
   - **Invite user:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
   - **Magic link:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - **Reset password:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   For reliable delivery, add your own SMTP (for example your Google Workspace or Resend) under Project settings → Auth → SMTP.
3. **Vercel:** import the GitHub repo, then add the environment variables from `.env.example` (from Supabase → Project settings → API). Add the domain `portal.monostechnology.co.uk` and create the CNAME it asks for at your DNS provider.
4. **Make yourself admin:** invite yourself from Supabase → Authentication → Users, set a password, then run in the SQL editor:
   ```sql
   update profiles set role = 'admin' where email = 'you@monostechnology.co.uk';
   ```
5. Sign in at the portal, and you land on the admin screen. Add your first client.

## Payments

Each payment row takes a payment link. Create one in PayPal (or Stripe Payment Links) for the deposit and the balance, paste it in, and mark the payment as paid when it arrives. Automatic "paid" updates by webhook are a planned next step.

## Local development

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Notes
- Row-level security means a client can only read their own project, stages, payments, agreement and files, even if they call the API directly. Clients sign through a database function that refuses an already-signed agreement.
- The agreement text in `src/lib/agreement.ts` is a starting template. Have it checked before first use.
- Brand colours are tokens at the top of `src/app/globals.css`.
