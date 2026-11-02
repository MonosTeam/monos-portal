# MONOS Client Portal

A private portal for each MONOS Technology client: build progress, consultation form, file uploads, agreement signing and payments. Branded as MONOS for every client; what each client sees is customised per project from the admin screen.

Stack: Next.js 15 (App Router), Supabase (auth, Postgres with row-level security, storage), deployed on Netlify (the same place client sites are hosted). Email goes from info@monos.ai.

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

## Packages and private offers

Packages live in `src/lib/packages.ts`:

| | Retail | Festive special offer |
|---|---|---|
| Price | £3,500 (RRP) | £490 (invite-only) |
| Payment | 75% on signing/booking, 25% on delivery | 75% on signing/booking, 25% on delivery |
| Pages | Up to 5 of the client's choice | Home, About, Services, Gallery, Contact |
| Revisions | 2 rounds | 1 round |
| Extras | | 30-min 1-1 with Aisha, connection to their existing domain |
| Turnaround | 7 days | 7 days |

The **£490 offer can only be booked with an offer code**, so it never appears on the public site. In the admin **Offers** tab, create a code (by default `LAUNCH490`, 20 places, expiring 15 Nov). Copy its link, `https://portal.monostechnology.co.uk/book?offer=LAUNCH490`, into the email campaign. You can also lock a code to a single email address for a personal invite.

`/book` without a code is the retail booking page (£3,500), so the website's "Book now" button can link there. Bookings create the client's account, send their portal invite, and set up the stages, 75/25 payments, and a package-specific agreement. The admin dashboard tracks progress against 20 sites by 15 Nov.

## Set up (about 20 minutes)

1. **Supabase:** create a free project at supabase.com (region: London). In the SQL editor, run `supabase/schema.sql`.
2. **Auth settings:** in Authentication → URL configuration, set Site URL to `https://portal.monostechnology.co.uk` and add it to redirect URLs. In Authentication → Email templates:
   - **Invite user:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
   - **Magic link:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - **Reset password:** link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   For reliable delivery, add your own SMTP (for example your Google Workspace or Resend) under Project settings → Auth → SMTP.
3. **Netlify:** Add new site → Import from GitHub → `MonosTeam/monos-portal`. Netlify detects Next.js automatically, so no extra config is needed. Add the environment variables from `.env.example` under Site configuration → Environment variables (the Supabase values are in Supabase → Project settings → API). Add the domain `portal.monostechnology.co.uk` under Domain management and create the CNAME it shows at your DNS provider.
   **Email from info@monos.ai:** create a Google app password for info@monos.ai (Google account → Security → App passwords) and put it in `SMTP_PASS`. Use the same SMTP details in Supabase → Project settings → Auth → SMTP, so login and invite emails also come from info@monos.ai.
4. **Make yourself admin:** invite yourself from Supabase → Authentication → Users, set a password, then run in the SQL editor:
   ```sql
   update profiles set role = 'admin' where email = 'you@monostechnology.co.uk';
   ```
5. Sign in at the portal, and you land on the admin screen. Create the `LAUNCH490` offer code in the Offers tab, and add your first client.

Upgrading from the first version? Run `supabase/migration-001-offers.sql` instead of the full schema.

## Sign-up endpoint (landing page)

`POST https://portal.monostechnology.co.uk/api/signup?offer=LAUNCH490` with JSON `{ name, business, email, phone, industry, domain, about, source }`. It redeems the offer code, creates the client's login and project, emails them their portal invite, pre-fills their consultation form (business_name, what_you_do, domain_name, industry, mobile), and emails info@monos.ai about the new booking. It returns `{ ok, package, depositPence, depositLink, portalUrl }`. Without a valid code the booking is at retail price. CORS origins are set by `SIGNUP_ALLOWED_ORIGINS`.

## Notifications

info@monos.ai is emailed when a client books and when they sign their agreement. Clients get their invite (and later login links) from the same address.

## Payments

Payments use PayPal payment links on the MONOS PayPal account: £367.50 (75%) and £122.50 (25%) for the festive special offer. These links are built in as defaults (https://www.paypal.com/ncp/payment/45ALR2Y4ECJXL for £367.50 and https://www.paypal.com/ncp/payment/NSVTCNUHPALVA for £122.50), so every new £490 booking gets them automatically. To change them, set `PAY_LINK_LAUNCH490_DEPOSIT` and `PAY_LINK_LAUNCH490_BALANCE`. Each link asks the payer for their business name, so you can match the payment and mark it as paid in the client's page. Automatic "paid" updates from PayPal webhooks are a planned next step.

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

## Website agent

When a client submits their consultation form, the portal builds their 5-page website (Home, About, Services, Gallery, Contact) automatically, puts a private preview on Netlify and emails Aisha. Aisha approves it in **Admin → Websites**, which publishes that exact preview, and then sends it to the client with one click.

How it works (code in `src/lib/site-agent/`):
1. **Brief**: the consultation answers (`src/lib/brief.ts`) and the client's uploads from the Files tab.
2. **Writer** (`generate.ts`): Claude reads the brief, looks at the photos, and returns the full site content as structured JSON: copy for every page, SEO titles, FAQs, the theme (bold, clean or warm), fonts, brand colours and where each photo goes. It only uses facts from the brief, never invents reviews, awards or prices, and lists anything missing as notes for Aisha. Phone numbers, emails, addresses and links are inserted straight from the brief, never written by the model.
3. **Images** (`images.ts`): uploads are rotated, resized and converted to WebP. Empty slots use Unsplash stock photos if `UNSPLASH_ACCESS_KEY` is set, otherwise designed colour panels.
4. **Designer** (`render/`): renders a fast static site with responsive layouts, mobile menu, scroll animations, gallery lightbox, a Netlify Forms enquiry form (enquiries are emailed to the client), click-to-call, Google map, LocalBusiness schema, sitemap and robots.txt.
5. **Hosting** (`netlify.ts`): creates the client's Netlify site and uploads a draft deploy (the preview). Approving publishes it and attaches the client's domain if they gave one.
6. **Changes**: on the review page Aisha can type changes ("darker colours, mention free quotes") and the agent rebuilds just those, as a new version.

Set up:
1. Run `supabase/migration-002-site-builds.sql` in the Supabase SQL editor.
2. Add the website agent variables from `.env.example`: `ANTHROPIC_API_KEY`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_ACCOUNT_SLUG`, `SITE_AGENT_SECRET`, and on Netlify `SITE_AGENT_WORKER_URL`. Optional: `UNSPLASH_ACCESS_KEY`.
3. Hosting the portal on Netlify: the build runs in `netlify/functions/site-agent-background.mts` (background functions can run for 15 minutes). On Vercel it runs in `/api/site-agent/build`.

Try it locally without the portal: `npx tsx scripts/site-agent-local.mts scripts/samples/plumber.brief.json --out out` (needs `ANTHROPIC_API_KEY`), or re-render the saved sample content with `--content scripts/samples/plumber.content.json`.
