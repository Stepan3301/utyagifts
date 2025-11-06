# Rocket Gifts 🚀

A crash-rocket-style game where users play for Telegram gifts (NFT-like objects).

## Project Structure

```
rocket-gifts/
├── frontend/          # React/Next.js Mini App
├── backend/           # Node.js/TypeScript API + Telegram logic
├── infra/             # Docker Compose, nginx configs, deployment scripts
└── package.json       # Monorepo root
```

## Quick Start

### Prerequisites

- Node.js v20 LTS+
- pnpm (or yarn/npm)
- Docker + Docker Compose
- Git

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env` and fill in your values
   - Copy `frontend/.env.example` to `frontend/.env.local` and fill in your values

3. **Start infrastructure (PostgreSQL + Redis):**
   ```bash
   cd infra
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   cd backend
   pnpm run db:migrate
   ```

5. **Start development servers:**
   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - Backend API on `http://localhost:4000`
   - Frontend on `http://localhost:3000`

## Environment Setup

### Backend Environment Variables

See `backend/.env.example` for required variables:
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `TELEGRAM_BOT_USERNAME` - Bot username
- `RELAYER_TELEGRAM_ID` - Telegram ID of the relayer account
- Database connection details
- Redis connection details (optional)

### Frontend Environment Variables

See `frontend/.env.example` for required variables:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Bot username

## Architecture

### Backend

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (optional)
- **Structure**: Layered architecture (Controllers → Services → Repositories)

### Frontend

- **Framework**: Next.js with TypeScript
- **Styling**: TailwindCSS
- **Integration**: Telegram WebApp API

### Infrastructure

- **Database**: PostgreSQL (Docker)
- **Cache**: Redis (Docker)
- **Reverse Proxy**: Nginx (for production)

## Development

### Run Backend Only
```bash
cd backend
pnpm dev
```

### Run Frontend Only
```bash
cd frontend
pnpm dev
```

## Production Deployment

See `infra/` directory for deployment configurations.

## License

MIT

