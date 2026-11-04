This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Checkout setup

Set these server environment variables before using Monetbil checkout:

- `MONETBIL_SERVICE_KEY` and `MONETBIL_SERVICE_SECRET` from your Monetbil service settings.
- `NEXT_PUBLIC_APP_URL` as the canonical public base URL for this deployment (for example, `https://your-store.example`).
- `PRODUCT_ADMIN_PHONE_NUMBERS` as a comma-separated list of authorized account phone numbers. This is required to initialize and manage vendor contacts.

After signing in with an authorized account, initialize the vendor contacts table and its initial contacts by sending `POST /api/seed/vendor-contacts` or `POST /api/seedForVendor`. Active vendor contacts can be queried from `GET /api/vendor-contacts` and added by an authorized admin with `POST /api/vendor-contacts` using `{ "label": "Vendor", "phoneNumber": "+2376XXXXXXXX" }`.

The checkout route stores order and item records before creating the Monetbil v2.1 hosted payment. Monetbil callbacks are signature-checked and verified through its payment API before an order is marked successful. WhatsApp checkout reads active contacts from the same vendor contacts table.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
