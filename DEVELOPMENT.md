# Development Guide

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Git

### Setup

1. **Clone the repo**
```bash
git clone <repo-url>
cd per-aspera-mod-creator
```

2. **Start with Docker**
```bash
docker-compose up -d
```

3. **Or develop locally**
```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend  
cd frontend && npm install && npm run dev
```

## Project Architecture

```
Frontend (React)
    ↓
Backend API (Express)
    ↓
PostgreSQL DB
```

## API Development

### Adding a new endpoint

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Create service in `backend/src/services/`
4. Update `backend/src/app.ts` to register route
5. Document in Swagger

### Database changes

1. Create migration in `db/migrations/`
2. Update schema in `db/init.sql`
3. Run migrations during docker setup

## Frontend Development

### Adding a new form

1. Create component in `frontend/src/components/forms/`
2. Create page in `frontend/src/pages/`
3. Add route to `frontend/src/App.tsx`
4. Connect to API via `frontend/src/api/`

## Testing

```bash
# Backend
cd backend && npm run test

# Frontend
cd frontend && npm run test
```

## Deployment

Update `docker-compose.yml` for production:
- Set `NODE_ENV: production`
- Remove volume mounts for src
- Add health checks
- Configure proper credentials

## Git Workflow

1. Create feature branch: `git checkout -b feature/resource-editor`
2. Commit changes: `git commit -m "feat: add resource form"`
3. Push: `git push origin feature/resource-editor`
4. Open PR on GitHub

## Documentation

Keep these files updated:
- `README.md` — Overview
- `DEVELOPMENT.md` — This file
- `docs/SPEC.md` — Full specification
- API comments (Swagger)

## Troubleshooting

### Docker issues
```bash
# Clear everything
docker-compose down -v
docker system prune

# Rebuild
docker-compose up -d --build
```

### Database connection
- Check `docker-compose logs db`
- Verify credentials in `.env`
- Adminer at http://localhost:8080

### Frontend not connecting
- Check API URL in `.env`
- Verify backend is running: `curl http://localhost:3001/health`

## Code Style

- **Backend**: ESLint + Prettier
- **Frontend**: Prettier + TypeScript strict mode
- Run before committing: `npm run format && npm run lint`
