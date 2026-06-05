# Per Aspera Mod Creator — Web UI

A **dockerized web application** for creating Per Aspera mods without manual YAML editing.

## Features

✨ Create and manage:
- **Resources** (materials, gases, manufactured items)
- **Buildings** (miners, factories, research labs)
- **Technologies** (research tree)
- **Building Categories** (organization)
- **Knowledge** (game knowledge entries)

🎯 Auto-generate YAML files and export complete mods

🔄 Real-time YAML preview and validation

## Quick Start

### With Docker (Recommended)
```bash
docker-compose up -d
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Admin: http://localhost:8080 (adminer)

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
per-aspera-mod-creator/
├── frontend/          # React + TypeScript
├── backend/           # Node.js + Express
├── db/                # PostgreSQL scripts
├── docker-compose.yml
└── docs/
    └── SPEC.md        # Full specification
```

## API Documentation

Swagger UI: http://localhost:3001/api/docs

## Development Phases

- [ ] Phase 1: Project Setup
- [ ] Phase 2: Backend API — Resources
- [ ] Phase 3: Backend API — Buildings
- [ ] Phase 4: Backend API — Tech/Category/Knowledge
- [ ] Phase 5: Frontend Layout
- [ ] Phase 6: Frontend Resource Forms
- [ ] Phase 7: Frontend Building Forms
- [ ] Phase 8: Export & Mods Manager

## Contributing

All Per Aspera mod creator development happens here.

## License

MIT — Part of Per Aspera modding ecosystem
