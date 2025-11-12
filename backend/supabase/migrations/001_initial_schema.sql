-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "telegramId" INTEGER UNIQUE NOT NULL,
  username TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Gift table
CREATE TABLE IF NOT EXISTS "Gift" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "telegramGiftId" TEXT UNIQUE NOT NULL,
  name TEXT,
  thumbnail TEXT,
  status TEXT DEFAULT 'owned',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "Gift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL
);

-- Create GameSession table
CREATE TABLE IF NOT EXISTS "GameSession" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "giftId" TEXT NOT NULL,
  multiplier DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'active',
  "crashedAt" INTEGER,
  "cashedOutAt" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "GameSession_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_telegramId_idx" ON "User"("telegramId");
CREATE INDEX IF NOT EXISTS "Gift_userId_idx" ON "Gift"("userId");
CREATE INDEX IF NOT EXISTS "Gift_status_idx" ON "Gift"("status");
CREATE INDEX IF NOT EXISTS "GameSession_userId_idx" ON "GameSession"("userId");
CREATE INDEX IF NOT EXISTS "GameSession_status_idx" ON "GameSession"("status");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updatedAt
CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_updated_at
  BEFORE UPDATE ON "Gift"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamesession_updated_at
  BEFORE UPDATE ON "GameSession"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

