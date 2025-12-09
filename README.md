# Workout API with Cloudflare Workers and D1

This is a simple workout API built using Cloudflare Workers and D1 database.

## Base commands

`pnpm install`
`pnpm dev`

## Deployment

To deploy to Cloudflare, run:

`pnpm run deploy`

## Setting up D1 Database

Create the database

`wrangler d1 create workout-api-cloudflare-workers-d1`

After creation, execute the schema to set up tables (on local)

`wrangler d1 execute workout-api-cloudflare-workers-d1 --local --file=./schema.sql`

After creation, execute the schema to set up tables (on production)

`wrangler d1 execute workout-api-cloudflare-workers-d1 --remote --file=./schema.sql`

## Cloudflare Type Generation

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
pnpm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/app.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

📣 Remember to rerun 'wrangler types' after you change your wrangler.json file.
