# Setup Guide

This guide will help you set up the Rocket Gifts project for development.

## Prerequisites

Make sure you have the following installed:
- Node.js v20 LTS or higher
- pnpm (or yarn/npm)
- Docker and Docker Compose
- Git

## Step-by-Step Setup

### 1. Install Dependencies

From the project root:
```bash
pnpm install
```

### 2. Set Up Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:
- `TELEGRAM_BOT_TOKEN` - Get from @BotFather on Telegram
- `TELEGRAM_BOT_USERNAME` - Your bot's username
- `RELAYER_TELEGRAM_ID` - Telegram ID of the relayer account
- Database credentials (or use defaults for local dev)
- `WEBAPP_URL` - Your frontend URL (e.g., `http://localhost:3000` for dev)

#### Frontend
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and set:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (e.g., `http://localhost:4000/api`)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot's username

### 3. Start Infrastructure Services

```bash
cd ../infra
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 4. Set Up Database

```bash
cd ../backend
pnpm run db:generate  # Generate Prisma client
pnpm run db:migrate   # Run migrations
```

### 5. Start Development Servers

From the project root:
```bash
pnpm dev
```

This will start:
- Backend API on `http://localhost:4000`
- Frontend on `http://localhost:3000`

## Testing the Setup

1. **Check Backend Health:**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Check Frontend:**
   Open `http://localhost:3000` in your browser

3. **Test Telegram Bot:**
   - Send `/start` to your bot on Telegram
   - You should see a welcome message with an "Open Game" button

## Next Steps

1. **Implement Telegram initData validation** in `backend/src/services/authService.ts`
2. **Implement gift receiving logic** in `backend/src/services/telegramService.ts`
3. **Build the game UI** in `frontend/app/page.tsx`
4. **Implement real-time game logic** for the crash game

## Troubleshooting

### Database Connection Issues
- Make sure Docker containers are running: `docker ps`
- Check database credentials in `.env`
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`

### Port Already in Use
- Change ports in `.env` files or stop conflicting services
- Backend default: 4000
- Frontend default: 3000
- PostgreSQL default: 5432
- Redis default: 6379

### Telegram Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check if webhook is set (if using webhook mode)
- For development, bot will use polling mode if `TELEGRAM_WEBHOOK_URL` is not set

## Development Tips

- Use `pnpm run db:studio` to open Prisma Studio for database management
- Backend logs will show in the terminal where you ran `pnpm dev`
- Frontend hot-reloads automatically on file changes
- Use `docker-compose logs -f` to view infrastructure logs

