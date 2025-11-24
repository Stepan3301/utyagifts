-- Add gift to user inventory
-- User ID: 9794c890-6d1e-41a1-b4bb-11b6ff449a44
-- Gift URL: https://t.me/nft/HappyBrownie-55934
-- Telegram Gift ID: HappyBrownie-55934

-- Step 1: Insert the gift into the gifts table
INSERT INTO gifts (
  name,
  gift_url,
  created_at,
  updated_at
) VALUES (
  'Happy Brownie',  -- Name extracted from URL
  'https://t.me/nft/HappyBrownie-55934',
  NOW(),
  NOW()
)
RETURNING id;

-- Step 2: Link the gift to the user in user_gifts table
-- (Replace <GIFT_ID> with the ID returned from Step 1)
INSERT INTO user_gifts (
  user_id,
  gift_id,
  quantity,
  metadata
) VALUES (
  '9794c890-6d1e-41a1-b4bb-11b6ff449a44',
  <GIFT_ID>,  -- Replace with the ID from Step 1
  1,
  jsonb_build_object(
    'telegram_gift_id', 'HappyBrownie-55934',
    'status', 'owned'
  )
);

-- Alternative: Single transaction approach (recommended)
-- This does both steps in one transaction
WITH new_gift AS (
  INSERT INTO gifts (
    name,
    gift_url,
    created_at,
    updated_at
  ) VALUES (
    'Happy Brownie',
    'https://t.me/nft/HappyBrownie-55934',
    NOW(),
    NOW()
  )
  RETURNING id
)
INSERT INTO user_gifts (
  user_id,
  gift_id,
  quantity,
  metadata
)
SELECT 
  '9794c890-6d1e-41a1-b4bb-11b6ff449a44',
  new_gift.id,
  1,
  jsonb_build_object(
    'telegram_gift_id', 'HappyBrownie-55934',
    'status', 'owned'
  )
FROM new_gift;

