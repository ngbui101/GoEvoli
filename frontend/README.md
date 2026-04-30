# GoEvoli Frontend

React single-page application for the GoEvoli agile board.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Create `frontend/.env.local` for local overrides:

```env
VITE_API_URL=http://localhost:8080/api
```

The production deployment sets `VITE_API_URL` to the live backend API.

## Structure

- `src/api` - API clients
- `src/components` - shared UI, board, and trading-card components
- `src/context` - application providers
- `src/pages` - route-level screens
- `src/types` - shared TypeScript models
