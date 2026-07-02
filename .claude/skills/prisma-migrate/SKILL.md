---
name: prisma-migrate
description: Create and run Prisma database migrations for this project. Use when the user wants to create a new migration after editing prisma/schema.prisma, apply pending migrations to the database, or check migration status. Handles both development migrations and production deploys.
---

# Prisma Migrations

This project uses Prisma 7 with PostgreSQL. The schema lives at `prisma/schema.prisma` and config at `prisma.config.ts`. Migrations are stored in `prisma/migrations/`.

The database connection comes from the `DATABASE_URL` environment variable (loaded via `dotenv` in `prisma.config.ts`). Confirm it is set before running anything that touches the database — if it is missing, tell the user rather than guessing a value.

## Creating a migration

After the user edits `prisma/schema.prisma`, create and apply a new migration in development:

```
npx prisma migrate dev --name <descriptive-name>
```

- Pick a short, kebab-case `<descriptive-name>` that describes the change (e.g. `add-user-model`, `add-post-published-at`). If the user did not give one, infer it from the schema diff and confirm with them.
- This generates the SQL migration under `prisma/migrations/` and applies it to the dev database.
- To create the migration SQL **without** applying it (review first), use:

```
npx prisma migrate dev --name <descriptive-name> --create-only
```

After the migration is applied, always regenerate the Prisma Client so the generated types under `app/_generated/prisma` match the new schema:

```
npx prisma generate
```

`migrate dev` does not reliably regenerate the client in this project (the `prisma-client` generator with a driver adapter), so run `prisma generate` explicitly and confirm `app/_generated/prisma` exists before relying on the client.

## Running / applying migrations

Apply all pending migrations to the database without generating new ones:

- Development (or any non-production environment):

```
npx prisma migrate dev
```

- Production / CI (applies committed migrations, never prompts, never resets):

```
npx prisma migrate deploy
```

Use `migrate deploy` for anything production-facing — it only applies existing migrations and will not generate or alter them.

## Other useful commands

- Check status of applied vs. pending migrations:

```
npx prisma migrate status
```

- Regenerate the Prisma Client without migrating (e.g. after a `git pull`):

```
npx prisma generate
```

- Reset the dev database (DROPS ALL DATA, re-applies every migration). Destructive — only run when the user explicitly asks, and confirm first:

```
npx prisma migrate reset
```

## Notes

- Always run from the project root so `prisma.config.ts` is picked up.
- Commit the generated files under `prisma/migrations/` — they are the source of truth for the schema history.
- Before reporting success, check the command output for errors (connection failures, drift, failed SQL) and surface them to the user.
