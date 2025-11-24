-- Add animation_data column to gifts table to store Lottie JSON
-- This allows storing the full animation data extracted from Telegram .tgs files

ALTER TABLE "gifts" 
ADD COLUMN IF NOT EXISTS "animation_data" JSONB;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "gifts_animation_data_idx" ON "gifts" USING GIN ("animation_data");

-- Add gift_url column to store the Telegram gift URL
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "gift_url" TEXT;

-- Add index for gift_url lookups
CREATE INDEX IF NOT EXISTS "gifts_gift_url_idx" ON "gifts"("gift_url");

