# TextbookHub

A Next.js website for selling/sharing primary & secondary school textbooks and notes, with:

- Public site: browse by class → subject → book → chapters, free previews, ad slots
- Paystack payment to unlock a paid book (one-time fee per book, per email)
- Full admin panel: upload books & chapters (text or PDF), publish/unpublish, set per-book
  pricing, and **change the site-wide default fee at will**
- Structured admin login (NextAuth, credentials-based, sessions protected by middleware)

## 1. Install

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `NEXTAUTH_SECRET` / `ACCESS_TOKEN_SECRET` — run `openssl rand -base64 32` for each
- `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — from your Paystack dashboard
  (use test keys first, switch to live keys when ready to accept real payments)
- Leave `NEXT_PUBLIC_ADSENSE_CLIENT_ID` blank until your AdSense account is approved

## 2. Set up the database

This ships with SQLite so you can run it immediately with zero server setup:

```bash
npx prisma migrate dev --name init
npm run seed
```

The seed script creates:
- A default admin login: **admin@textbookhub.local / ChangeMe123!** — change this password
  immediately after your first login (see "Changing the admin password" below)
- A default fee of ₦500 per book
- Starter class levels: Primary 5–6, JSS1–3, SS1–3

## 3. Run it

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## 4. Using the admin panel

1. **Log in** at `/admin/login`.
2. **Add a book**: Admin → Books & Chapters → Add Book. Pick a class, pick or create a
   subject, add a cover image, and choose whether it's free or paid (leave price blank to
   use the site's default fee, or set a custom price for that one book).
3. **Add chapters**: on the book's edit page, add chapters one at a time — either write text
   directly or upload a PDF. Mark any chapter as a "free preview" so visitors can read it
   without paying (great for hooking readers before they pay for the rest).
4. **Publish**: a book stays hidden from the public site until you click "Publish" on its
   edit page.
5. **Change the fee at will**: Admin → Fees & Settings → update "Default unlock fee" and
   save. This instantly applies to every book that doesn't have its own custom price — no
   redeploy needed.
6. **Turn on ads**: once your Google AdSense account is approved, paste your Client ID and
   Slot ID into Fees & Settings. Ad units will start appearing on the home page, class pages,
   book pages, and between chapter content.

### Changing the admin password
There's no UI for this yet (kept the MVP lean) — the fastest way is Prisma Studio:
```bash
npx prisma studio
```
Open the `Admin` table and replace `passwordHash` with a new bcrypt hash. Or ask me and I'll
add a "change password" screen.

## 5. How payments work

1. A visitor opens a locked chapter → sees the paywall with a price.
2. They enter their email and click "Pay" → redirected to Paystack's secure checkout.
3. After payment, Paystack redirects back to the book page with a reference.
4. The server verifies the payment directly with Paystack's API (never trusts the client),
   then sets a signed, httpOnly cookie remembering which books that email has unlocked.
5. The visitor can now read every chapter of that book, on that device, for 180 days (cookie
   lifetime — easy to extend in `lib/access.ts`).

This means no student account/signup system is required — friction stays low, which matters
a lot for a first launch in Nigeria where every extra step loses users.

## 6. Deploying (low budget)

**Cheapest realistic path:**
- Push this project to GitHub
- Deploy free on [Vercel](https://vercel.com) (perfect fit for Next.js)
- Swap SQLite for a free-tier Postgres database (e.g. [Neon](https://neon.tech) or
  [Supabase](https://supabase.com)) — SQLite's local file won't persist on Vercel's
  serverless filesystem. To switch:
  1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`
  2. Set `DATABASE_URL` in Vercel's environment variables to your Postgres connection string
  3. Run `npx prisma migrate deploy`
- File uploads: the local `/public/uploads` folder also won't persist on Vercel. For
  production, swap the upload route (`app/api/admin/upload/route.ts`) to upload to
  Cloudinary or an S3-compatible bucket instead — same idea, just returns a public URL from
  a cloud provider instead of local disk. Happy to wire this up when you're ready to deploy.

## 7. What's intentionally left simple (v1 scope)

To keep this a genuinely low-budget, shippable MVP, a few things are minimal by design and
can be extended later:
- Rich text editor for chapters is a plain textarea (accepts basic HTML tags) rather than a
  full WYSIWYG editor
- No student accounts — access is tracked by email + cookie, not login
- No refunds/dispute flow
- Single admin role (no "editor" vs "super admin" tiers)
- No search bar yet on the public site (browse by class instead)

None of these block a real launch — they're the first things worth adding once the site has
real traffic and you know what students/parents actually ask for.
