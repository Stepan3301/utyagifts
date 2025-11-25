-- Add per-session timing fields so every user can run an isolated countdown
ALTER TABLE "game_sessions"
ADD COLUMN IF NOT EXISTS "countdown_ends_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP WITH TIME ZONE;

-- Backfill missing countdown values for legacy rows to avoid NULL timers
UPDATE "game_sessions"
SET "countdown_ends_at" = COALESCE("countdown_ends_at", "created_at" + interval '10 seconds')
WHERE "countdown_ends_at" IS NULL;

-- Ensure animation_data always uses JSONB to match Lottie payload expectations
ALTER TABLE "gifts"
ALTER COLUMN "animation_data"
TYPE JSONB
USING CASE
  WHEN "animation_data" IS NULL THEN NULL
  ELSE "animation_data"::jsonb
END;

