# GoEvoli 🃏

> A collectible card game-inspired agile Kanban board for managing software projects.

![Go](https://img.shields.io/badge/Backend-Go%201.22-00ADD8?logo=go)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker)

---

## Dokumentation

Detaillierte Informationen findest du im [docs/](./docs/) Verzeichnis:
- [Projektdokumentation & Konventionen](./docs/PROJEKT_DOKUMENTATION.md)
- [Architektur-Überblick](./docs/architecture.md)
- [Anforderungen & Spezifikation](./docs/requirements.md)
- [Aktuelle TO-DO Liste](./docs/TODO.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Go 1.22, Chi Router, JWT (HttpOnly Cookies) |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Database** | MongoDB (Atlas or self-hosted) |
| **Deployment** | Docker + Docker Compose |

---

## Quick Start (Local Development)

### Prerequisites
- Go 1.22+
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Configure environment
```bash
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
```

### 2. Start backend
```bash
cd backend
go run ./cmd/seed    # Seed demo data (run once)
go run ./cmd/server
# → http://localhost:8080
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Docker Deployment

```bash
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, FRONTEND_URL, APP_ENV=production, COOKIE_SECURE=true

docker compose up --build -d
# Frontend → http://localhost:80
# Backend  → http://localhost:8080
```

---

## Demo Accounts

After running `go run ./cmd/seed` (password for all: `password123`):

| Email | Role |
|-------|------|
| `admin@example.com` | Admin / Product Owner |
| `dev@example.com` | Developer |
| `tester@example.com` | Tester |
| `viewer@example.com` | Viewer |

---

## Project Structure

```
GoEvoli/
├── backend/              # Go API server
│   ├── cmd/
│   │   ├── server/       # Entry point
│   │   └── seed/         # Demo data seeder
│   └── internal/
│       ├── handlers/     # HTTP handlers
│       ├── services/     # Business logic
│       ├── models/       # Data models & enums
│       └── repositories/ # MongoDB queries
├── frontend/             # React SPA
│   ├── src/
│   │   ├── api/          # API client layer
│   │   ├── components/   # Reusable components (cards, ui, board)
│   │   ├── pages/        # Route-level pages
│   │   ├── context/      # AuthContext
│   │   └── types/        # TypeScript types
│   └── nginx.conf        # Production SPA routing
├── docs/                 # Project documentation
│   ├── PROJEKT_DOKUMENTATION.md
│   ├── architecture.md
│   ├── requirements.md
│   └── TODO.md
├── local/                # Local-only sensitive data (gitignored)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Overview

All routes under `/api/`. Auth via HttpOnly session cookie.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Projects | `GET/POST /projects/`, `PATCH /projects/:id/wip-limits` |
| Stories | `GET/POST /projects/:id/stories`, `DELETE /stories/:id` |
| Tasks | `GET/POST /stories/:id/tasks`, `POST /tasks/:id/move`, `DELETE /tasks/:id` |
| Bugs | `GET/POST /projects/:id/bugs`, `POST /bugs/:id/close` |
| Comments | `GET/POST /stories/:id/comments` |

---

## Known Limitations / Roadmap

- [ ] Task assignment (Assigned tab – UI placeholder exists)
- [ ] Real-time updates via WebSocket
- [ ] Drag & Drop (dnd-kit integration pending)
- [ ] Inline edit for stories/tasks
- [ ] Bug management UI on board
- [ ] Token refresh logic
