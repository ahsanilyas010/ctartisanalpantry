# E-commerce setup

This site now has a real storefront (cart + checkout with Cash on Delivery /
Bank Transfer) and a password-protected admin panel at `/admin/login.html`
for managing inventory and orders. It needs three things connected before it
works — none of these can be set up by Claude directly; they require your
Vercel account and email inbox.

## 1. Database (Vercel Postgres via Neon)

1. Open your project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Go to the **Storage** tab → **Create Database** → **Postgres** (powered by Neon).
3. Connect it to this project. Vercel will automatically add a `DATABASE_URL`
   (or `POSTGRES_URL`) environment variable — no manual copy-pasting needed.

## 2. Email notifications (Resend)

1. Sign up free at [resend.com](https://resend.com) using the same inbox you
   want order notifications to land in ideally (see note below).
2. Create an API key.
3. In Vercel → your project → **Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = the key you just created

   > **Note:** Until you verify your own domain with Resend, their shared
   > sending domain can only deliver to the email address your Resend
   > account is registered with. If you want notifications to go to
   > `ahsanilyas35@gmail.com` and that's the email you sign up to Resend
   > with, this works immediately. If you add a second notification email
   > later (mentioned below) that's *different* from your Resend account
   > email, you'll need to verify a domain in Resend first for that second
   > address to actually receive mail.

4. Optional: add `ORDER_NOTIFY_EMAILS` = a comma-separated list of emails to
   notify on each order (defaults to `ahsanilyas35@gmail.com` if not set).
   Add your second email here whenever you have it.

## 3. Admin credentials & session security

Add these in Vercel → **Settings → Environment Variables**. The actual
values were generated for you and shared directly in chat (not committed to
this repo) — paste them in as-is:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `SETUP_TOKEN`

## 4. Initialize the database

Once the above are all set and the project has redeployed, visit this URL
once in your browser (replace with your real domain and the `SETUP_TOKEN`
value you were given):

```
https://<your-domain>/api/setup?token=<SETUP_TOKEN>
```

This creates the `products`, `orders`, and `order_items` tables and seeds
the 4 products from your official price list (Vanilla Beans, Vanilla
Caviar, Vanilla Bean Paste with Honey, Cocoa). It's safe to visit more than
once — it won't duplicate data.

## 5. Log in to the admin panel

Go to `/admin/login.html` and log in with the `ADMIN_USERNAME` /
`ADMIN_PASSWORD` you were given. From there:

- **Products** — edit prices, stock, and active/inactive status, or add
  new products.
- **Orders** — see every order placed, view line items and customer
  details, and update order status (pending → confirmed → shipped →
  completed, or cancelled).

## Notes on what's simplified for now

- **Peppercorn and Chili Oil** aren't in the checkout yet — they weren't on
  your official price list. Add them from the admin **Products** page
  whenever you have real pricing for them.
- **Bank transfer** doesn't show account details on the site yet — the
  checkout page tells the customer you'll send bank details by phone/
  WhatsApp after they place the order. If you'd rather display your
  account details directly on the checkout page, that's a small edit to
  `checkout.html`.
- **Stock counts** were seeded at a placeholder of 50 units per product —
  update these to your real inventory from the admin Products page before
  going live.
