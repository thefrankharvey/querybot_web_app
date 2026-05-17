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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Stripe Checkout: automatic discount (optional)

For the in-app discount modal and `/api/checkout-redirect?discount=WELCOME30`, pre-applied promos use these **optional** variables. Values must be the Promotion Code **id** from the Stripe Dashboard (`promo_...`), in the same test/live mode as your secret key and prices.

```
# When APP_ENV=dev — test mode promotion code id
STRIPE_DEV_WELCOME30_PROMOTION_CODE_ID=promo_...

# When APP_ENV=prod — live mode promotion code id
STRIPE_PROD_WELCOME30_PROMOTION_CODE_ID=promo_...
```

If omitted, Checkout still allows customers to enter a code manually when no auto-discount is passed.

Add the following to `.env.local` to enable the WordPress-driven blog:

```
# WordPress
WPGRAPHQL_ENDPOINT=https://your-wp-site.com/graphql
# Optional: max time (ms) to wait for each WPGraphQL request (default 10000, min 1000, max 60000)
# WPGRAPHQL_FETCH_TIMEOUT_MS=15000
WP_SITE_URL=https://your-wp-site.com
# Optional: if your WordPress media is served from a specific host
# WP_MEDIA_HOST=your-wp-site.com

# Canonical site URL used in metadata and sitemaps
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# On-demand ISR secret used by /api/revalidate
REVALIDATE_SECRET=replace-with-a-random-string
```
