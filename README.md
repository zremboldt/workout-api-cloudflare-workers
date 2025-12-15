# Workout API

A workout tracking API built with Cloudflare Workers, D1 (SQLite), Drizzle ORM, Hono, Zod, and Scalar.

## Run project locally

```shell
pnpm i
pnpm dev
```

Access the **Scalar interactive OpenAPI documentation** at `http://localhost:8787/reference`.

## Deploy to Cloudflare Workers

First login to Cloudflare from your web browser.
Then:

```shell
pnpm wrangler login
pnpm run deploy
```

## Interacting with a D1 database

[Create a D1 database](https://developers.cloudflare.com/workers/wrangler/commands/#d1-create)
[Execute a D1 database](https://developers.cloudflare.com/workers/wrangler/commands/#d1-execute)

### Initial DB setup (if starting fresh)

Create the database

```shell
npx wrangler d1 create workout-api-cloudflare-workers-d1
```

After creation, update `wrangler.jsonc` with the database ID, then run migrations:

```bash
pnpm db:migrate:local
```

### Database Management

Generate new migrations whenever the schema changes

```bash
pnpm db:generate
```

Apply migrations to local database

```bash
pnpm db:migrate:local
```

Apply migrations to production database

```bash
pnpm db:migrate:remote
```

Delete the database (if needed)

```bash
npx wrangler d1 delete workout-api-cloudflare-workers-d1
```

## Type Generation

Generate TypeScript types from your Wrangler configuration:

```bash
pnpm cf-typegen
```

Re-run this command after changing `wrangler.jsonc`.

## Project Structure

```
src/
  db/
    index.ts              # Re-exports all schemas
  routes/
    users/
      users.schema.ts     # Drizzle table + Zod schemas
      users.routes.ts     # OpenAPI route definitions
      users.handlers.ts   # Route handlers
      users.index.ts      # Route exports
```

## Credits

- This project was started with the `create hono` CLI.
- Then I setup deployment on Cloudflare along with a D1 SQLite database based on what I learned from [this video](https://youtu.be/yPrQ7u3gWqk).
- Then I used [this video](https://youtu.be/sNh9PoM9sUE) to help set up things like Drizzle, Zod, and Scalar.
