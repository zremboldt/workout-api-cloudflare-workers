# Workout API

A workout tracking API built with Hono, Cloudflare Workers, and D1 (SQLite).

## Features

- Fast and lightweight API framework with [Hono](https://hono.dev/)
- Hosted on Cloudflare Workers [workers](https://developers.cloudflare.com/workers/)
- Uses Cloudflare D1 (SQLite) database [D1](https://developers.cloudflare.com/d1/)
- Structured logging with [pino](https://getpino.io/) / [hono-pino](https://www.npmjs.com/package/hono-pino)
- Documented / type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- Interactive API documentation with [scalar](https://scalar.com/#api-docs) / [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- Convenience methods / helpers to reduce boilerplate with [stoker](https://www.npmjs.com/package/stoker)
- Type-safe schemas and environment variables with [zod](https://zod.dev/)
- Single source of truth database schemas with [drizzle](https://orm.drizzle.team/docs/overview) and [drizzle-zod](https://orm.drizzle.team/docs/zod)
- Sensible editor, formatting and linting settings with [@antfu/eslint-config](https://github.com/antfu/eslint-config)

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
