# HFT Trading Dashboard

A high-frequency trading dashboard with real-time candlestick charts, order book visualization, and order entry system.

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- TailwindCSS 4
- Lightweight Charts (TradingView)
- Radix UI + Shadcn components

**Backend:**
- Bun runtime
- Drizzle ORM
- PostgreSQL

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **PostgreSQL:** localhost:5432

### Local Development

**Frontend:**
```bash
cd app
npm install
npm run dev
```

**Backend:**
```bash
cd server
bun install
bun run dev
```

## Environment Variables

### Frontend (`app/.env`)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (`server/.env`)
```env
DATABASE_URL=postgres://user:password@localhost:5432/hft_db
JWT_SECRET=your-secret-key
```

## Project Structure

```
hft/
├── app/                    # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── chart/      # Candlestick chart
│   │   │   ├── container/  # Orderbook container
│   │   │   ├── trade/      # Order form
│   │   │   └── ui/         # Shadcn components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Dashboard, Login
│   │   └── hooks/          # Custom hooks
│   └── Dockerfile
├── server/                 # Backend (Bun)
│   ├── src/
│   │   └── index.ts        # API server
│   ├── drizzle/            # Database migrations
│   └── Dockerfile
└── docker-compose.yml
```

## Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### Backend
| Command | Description |
|---------|-------------|
| `bun run dev` | Start with hot reload |
| `bun run start` | Start production |
| `bun run db:generate` | Generate migrations |
| `bun run db:migrate` | Run migrations |

## License

MIT
