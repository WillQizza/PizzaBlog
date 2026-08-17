-- AlterTable: nullable first so the existing rows can be backfilled.
ALTER TABLE "Post" ADD COLUMN     "slug" TEXT;

-- Backfill. A simplified form of app/_lib/slug.ts: lowercase, collapse every
-- run of non-alphanumerics to a single dash, trim dashes, cap at 80 chars, and
-- fall back to 'post' when a title slugifies to nothing. ROW_NUMBER gives
-- duplicate titles the same -2, -3 suffixes the application hands out.
WITH "based" AS (
    SELECT
        "id",
        COALESCE(NULLIF(trim(BOTH '-' FROM left(
            regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g'), 80
        )), ''), 'post') AS "base"
    FROM "Post"
),
"numbered" AS (
    SELECT "id", "base", ROW_NUMBER() OVER (PARTITION BY "base" ORDER BY "id") AS "rn"
    FROM "based"
)
UPDATE "Post" AS "p"
SET "slug" = CASE WHEN "n"."rn" = 1 THEN "n"."base" ELSE "n"."base" || '-' || "n"."rn" END
FROM "numbered" AS "n"
WHERE "p"."id" = "n"."id";

-- Safety net: a generated suffix can land on a title that already slugified to
-- that exact value (two posts named "Pizza" plus one named "Pizza 2"). The
-- primary key makes any leftover duplicate distinct.
WITH "dupes" AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") AS "rn"
    FROM "Post"
)
UPDATE "Post" AS "p"
SET "slug" = "p"."slug" || '-' || "p"."id"
FROM "dupes" AS "d"
WHERE "p"."id" = "d"."id" AND "d"."rn" > 1;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
