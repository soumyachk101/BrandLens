# BrandLens

AI-Powered Brand Visibility Monitoring Platform

Track your brand's visibility across ChatGPT, Perplexity, Gemini, and Copilot. Get real-time insights and competitive analysis.

## Monorepo Structure

| Folder | Purpose |
|------------- |--------------------------------------|
| `frontend/` | Next.js 14 web application |
| `backend/` | Express.js API server + workers |
| `shared/` | Shared TypeScript types & constants |
| `supabase/` | Database migrations & schema |
| `docs/` | Business & technical documentation |

## Quick Start

```bash
# Install dependencies
npm install

# Run frontend + backend in development
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Zustand, TanStack Query, Recharts
- **Backend**: Express.js, TypeScript, Prisma, BullMQ, Puppeteer
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI, Anthropic
- **Infrastructure**: Docker, Redis, AWS S3

## Documentation

See the `docs/` folder for architecture, API specs, and business documentation.

## License

Proprietary - BrandLens
