# Workout API with Cloudflare Workers and D1

A workout tracking API built with Cloudflare Workers, D1 (SQLite), Drizzle ORM, Hono, Zod, and Scalar.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Visit `http://localhost:8787` to see your API running locally.

Access the **Scalar interactive OpenAPI documentation** at `http://localhost:8787/reference`.

## Initial DB setup (if starting fresh)

Create the D1 database:

```bash
wrangler d1 create workout-api-cloudflare-workers-d1
```

After creation, update `wrangler.jsonc` with the database ID, then run migrations:

```bash
pnpm db:migrate:local
```

## Database Management

### Generate migrations from schema changes

```bash
pnpm db:generate
```

### Apply migrations to local database

```bash
pnpm db:migrate:local
```

### Apply migrations to production database

```bash
pnpm db:migrate:remote
```

### Adding test data

```bash
npx wrangler d1 execute workout-api-cloudflare-workers-d1 --local --command="INSERT INTO users (firstName, lastName, email) VALUES ('John', 'Doe', 'john.doe@example.com');"
```

### Querying data

```bash
npx wrangler d1 execute workout-api-cloudflare-workers-d1 --local --command="SELECT * FROM users;"
```

## Deployment

```bash
pnpm deploy
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
