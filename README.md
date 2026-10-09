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

## Test the local backend (`feat/db-optimization`)

Run the UI test branch `codex/test-db-optimization-ui` in its separate worktree.
The original UI checkout can remain on its current branch.

1. Start Flask from the backend checkout on `feat/db-optimization`, using your
   backend environment settings (`DB_URL` is required):

   ```bash
   cd /Users/matthewgarrett/Development/query_bot_flask_app
   git branch --show-current
   querybot_env/bin/python flask_app.py
   ```

   Flask defaults to port `10000`. Check it with
   `curl http://127.0.0.1:10000/health`.

2. In the UI worktree, keep your existing Clerk, Supabase, and Stripe settings in
   the ignored `.env.local`, install dependencies if needed, and start the UI:

   ```bash
   cd /Users/matthewgarrett/.codex/worktrees/test-db-optimization-ui/querybot_web_app
   npm run dev:backend
   ```

3. Open [Smart Match](http://localhost:3000/smart-match) and sign in. Test trait
   search, agent matching, agent details, and Dispatch. Test creating a trait only
   when the backend's vocabulary write flag is enabled for your test workspace.

`dev:backend` sets `APP_ENV=dev` and sends matching, agent detail, Dispatch, trait,
and search-history API requests to `http://127.0.0.1:10000/`. It overrides both
API environment URLs and the separate trait URL for this process. UI links and
checkout return URLs use the local UI origin. `npm run dev` keeps its existing
behavior.

To use different local ports:

```bash
PORT=3001 WQH_LOCAL_API_URL=http://127.0.0.1:10001 npm run dev:backend
```

Set the backend's `PORT=10001` separately. The launcher accepts loopback backend
URLs only. `WQH_HISTORY_API_KEY` must match the backend for Smart Match history.

The new vocabulary API is opt-in on the backend. Set `WQH_VOCAB_API_ENABLED=true`,
`WQH_VOCAB_BUILD_ID`, and `WQH_VOCAB_WORKSPACE_ID` there to test its new reads.
Set `WQH_VOCAB_TRAIT_WRITES_ENABLED=true` there to test creating traits. These IDs
must refer to your existing vocabulary build and review workspace. See the
backend's `app/docs/shared_vocabulary.md` for setup and scope.

### Prepared local database

This worktree is connected to `wqh_ui_db_optimization` on `127.0.0.1:5432`.
The backend checkout has a Python 3.11 environment in the ignored `querybot_env/`
directory and an ignored `.env` with its local database connection,
vocabulary build/workspace IDs, trait writes enabled, and a history key matching
the UI worktree. A separate `WQH_VOCAB_WRITE_TOKEN` is shared by Flask and the UI
for trait writes. The proxy sends it only to loopback destinations when
`dev:backend` is running in development. The runtime database account has no superuser, database-creation,
or role-creation privileges.

The database contains the saved Rules041 snapshot exported on October 8, 2026:
3,285 agents, 3,357 original dictionary rows, 6,566 vocabulary entries, and 3,348
selectable traits. Its source file and setup record are in the ignored
`.local/db-optimization/` directory. This is a local API test copy. Public source
tables were reconstructed from the exported original rows, and review workspace
tables contain the fields required by these APIs. Writer search history and
editable profiles and social feeds start empty. It is not a complete production
database clone. Use a new project name in Smart Match; hosted saved projects may
refer to search-history IDs that do not exist in this local database.

Start PostgreSQL before Flask if it is not already running. Restart Flask after
backend code changes; its development server disables automatic reload to keep
in-memory export tasks intact.

Clerk sign-in and UI saved projects still use the configured hosted services.
UI saves use `NEXT_PUBLIC_SUPABASE_URL`; Flask matching, trait changes, agent
profiles, and search history use the new local `DB_URL`. `dev:backend` starts only
the UI, so start Flask in the separate terminal shown above. It does not rerun
migrations or reset your test data.

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
