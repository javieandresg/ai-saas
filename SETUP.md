# Setting up your own service accounts

The app needs five services. Create an account on each, copy the values into a `.env` file (start from `.env.example`), then deploy. Every service below has a free tier or test mode that is enough to get running.

## 1. Clerk (sign-in)

1. Sign up at https://dashboard.clerk.com and create an application (enable Email and/or Google).
2. Open **API Keys** and copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
3. Leave the four `NEXT_PUBLIC_CLERK_*_URL` values as they are in `.env.example`.

## 2. MySQL database

Prisma uses MySQL with `relationMode = "prisma"`, so any hosted MySQL works (Aiven, Railway, TiDB Cloud, or your own server).

1. Create a MySQL database and copy its connection string into `DATABASE_URL`, in the form `mysql://USER:PASSWORD@HOST:3306/DATABASE`. Add `?sslaccept=strict` or the provider's SSL parameter if it asks for one.
2. Create the tables:
   ```bash
   npm install
   npx prisma db push
   ```

## 3. OpenAI (conversation, code, image)

1. Sign up at https://platform.openai.com, add a payment method under **Billing** (the API has no free usage).
2. Create a key at https://platform.openai.com/api-keys → `OPENAI_API_KEY`.

## 4. Replicate (music, video)

1. Sign up at https://replicate.com and add billing.
2. Copy a token from https://replicate.com/account/api-tokens → `REPLICATE_API_TOKEN`.

## 5. Stripe (Pro subscription)

The checkout creates a $20/month "Prometheus Pro" price on the fly, so you do not need to create a product.

1. Sign up at https://dashboard.stripe.com and stay in **Test mode** until you are ready to charge real cards.
2. **Developers → API keys**: copy the Secret key → `STRIPE_SECRET_KEY`.
3. **Settings → Billing → Customer portal**: activate the portal (the Settings page uses it to manage subscriptions).
4. Webhook signing secret → `STRIPE_WEBHOOK_SECRET`:
   - **Local:** install the Stripe CLI and run `stripe listen --forward-to localhost:3000/api/webhook`; it prints a `whsec_...` value.
   - **Deployed:** **Developers → Webhooks → Add endpoint** with URL `https://YOUR_DOMAIN/api/webhook` and the events `checkout.session.completed` and `invoice.payment_succeeded`, then copy its signing secret.

## 6. App URL and Crisp chat

- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` locally, your real domain (no trailing slash) when deployed.
- `NEXT_PUBLIC_CRISP_WEBSITE_ID`: the support chat widget. Create a free account at https://app.crisp.chat and copy the Website ID from **Settings → Website settings**.

## Run and deploy

```bash
cp .env.example .env   # then fill it in
npm install
npx prisma db push
npm run dev
```

To deploy on Vercel, import the repository, paste every variable from `.env` into **Project → Settings → Environment Variables** (with `NEXT_PUBLIC_APP_URL` set to the Vercel domain), deploy, then add the production Stripe webhook from step 5.
