# GoEvoli

Collectible-card inspired project management for agile teams.

GoEvoli combines a Kanban workflow with trading-card visuals for stories, tasks, bugs, and project progress. The application is split into a Go API, a React frontend, and MongoDB persistence.

## Documentation

- [Project Documentation](./docs/PROJEKT_DOKUMENTATION.md)
- [Architecture](./docs/architecture.md)
- [Requirements](./docs/requirements.md)
- [Roadmap and Known Issues](./docs/TODO.md)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Go, Chi, MongoDB driver, JWT session cookies |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Database | MongoDB |
| Deployment | Docker, Docker Compose, Render, Vercel |

## Local Development

### Prerequisites

- Go 1.22 or newer
- Node.js 20 or newer
- MongoDB, local or hosted

### Environment

```bash
cp .env.example .env
```

Configure at least:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

### Backend

```bash
cd backend
go run ./cmd/seed
go run ./cmd/server
```

The API runs on `http://localhost:8080` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Docker

```bash
cp .env.example .env
docker compose up --build -d
```

Default local endpoints:

- Frontend: `http://localhost`
- Backend: `http://localhost:8080`

## Seed Data

The seed command creates a demo project with representative users, stories, tasks, bugs, memberships, WIP limits, and board states. It is intended for local development and QA environments.

## Project Structure

```text
GoEvoli/
├── backend/
│   ├── cmd/
│   │   ├── server/
│   │   └── seed/
│   └── internal/
│       ├── auth/
│       ├── handlers/
│       ├── middleware/
│       ├── models/
│       ├── repositories/
│       ├── response/
│       ├── services/
│       └── validation/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── types/
│       └── utils/
├── docs/
├── docker-compose.yml
├── render.yaml
└── README.md
```

Local-only operational files belong in `local/` or `.agents/`; both directories are ignored by Git.

## API Overview

All routes are served under `/api` and authenticated routes use an HttpOnly session cookie.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout` |
| Projects | `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id/wip-limits` |
| Stories | `GET /projects/:id/stories`, `POST /projects/:id/stories`, `DELETE /stories/:id` |
| Tasks | `GET /stories/:id/tasks`, `POST /stories/:id/tasks`, `POST /tasks/:id/move`, `DELETE /tasks/:id` |
| Bugs | `GET /projects/:id/bugs`, `POST /projects/:id/bugs`, `POST /bugs/:id/close` |
| Comments | `GET /stories/:id/comments`, `POST /stories/:id/comments` |

## Current Roadmap

- Task assignment workflow
- Real-time board updates
- Drag and touch movement hardening
- Inline story and task editing
- Board-level bug management
- Session refresh handling
