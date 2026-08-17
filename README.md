PizzaBlog
===================================

Blog software themed around pizza with customizability. Creating my own blog software has actually been something I've been meaning to do since pre-2019. This is my attempt at finally getting around to it!

Requirements
============

- Node.js 20+
- PostgreSQL

Running
============

Set up the environment. `.env` holds the database URL that Prisma reads, and
`.env.local` holds what the app reads at runtime:

```shell
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/pizzablog"
```

```shell
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/pizzablog"
SESSION_SECRET="any-long-random-string"
DUMMY_PASSWORD="any-placeholder-password-for-hashes"
```

Run the app locally:

```shell
npm install
npx prisma migrate dev
npm run dev
```

Then open http://localhost:3000, with the admin login at http://localhost:3000/admin/login.

Run the app in production mode:

```shell
npm install
npx prisma migrate deploy
npm run build
npm start
```

Migrations
============

The schema lives in `prisma/schema.prisma`. After editing it, create a
migration and regenerate the client:

```shell
npx prisma migrate dev --name what_changed
```
