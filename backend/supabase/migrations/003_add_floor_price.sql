-- Add floor price and related columns to gifts table
-- This stores price data fetched from Portals marketplace

-- Floor price in TON
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "floor_price" DECIMAL(18, 4);

-- Floor price currency (default: TON)
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "floor_price_asset" TEXT DEFAULT 'TON';

-- NFT model name (e.g., "Night Market")
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "model" TEXT;

-- Portals collection ID for this gift type
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "collection_id" INTEGER;

-- Last time the floor price was updated
ALTER TABLE "gifts"
ADD COLUMN IF NOT EXISTS "floor_price_updated_at" TIMESTAMPTZ;

-- Add index for collection lookups
CREATE INDEX IF NOT EXISTS "gifts_collection_id_idx" ON "gifts"("collection_id");

-- Add index for model lookups
CREATE INDEX IF NOT EXISTS "gifts_model_idx" ON "gifts"("model");

