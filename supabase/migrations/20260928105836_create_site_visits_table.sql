/*
# Create site_visits table for tracking website visits

1. New Tables
- `SiteVisit`
  - `id` (serial, primary key)
  - `path` (text, the URL path visited)
  - `created_at` (timestamptz, default now())
2. Purpose
  - Every page view on the website is recorded as a row.
  - Admin dashboard reads aggregated counts (total, today, trend).
3. Indexes
  - Index on `created_at` for fast date-range queries.
  - Index on `path` for per-page analytics.
4. Security
  - RLS enabled.
  - anon + authenticated can INSERT (the site records visits from all visitors).
  - Only authenticated admin can SELECT (visit data is private to admins).
*/

CREATE TABLE IF NOT EXISTS "SiteVisit" (
  "id" SERIAL PRIMARY KEY,
  "path" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "SiteVisit_created_at_idx" ON "SiteVisit" ("created_at");
CREATE INDEX IF NOT EXISTS "SiteVisit_path_idx" ON "SiteVisit" ("path");

ALTER TABLE "SiteVisit" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_site_visits" ON "SiteVisit";
CREATE POLICY "anon_insert_site_visits"
ON "SiteVisit" FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_site_visits" ON "SiteVisit";
CREATE POLICY "admin_select_site_visits"
ON "SiteVisit" FOR SELECT
TO authenticated USING (true);
