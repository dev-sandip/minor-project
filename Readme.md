# Parking Billing

Minor project: a **Intelligent parking billing system using YOLO and OCR** system with a **React** web app and an **Express** API. The backend handles vehicles, billing logic, auth (JWT), and optional real-time vehicle streaming; the frontend is a TanStack Router / Vite app that talks to the API over HTTP.

Plate detection is powered by models **hosted on [Hugging Face](https://huggingface.co/spaces/meraghav/Minor)** (e.g. Inference API, Endpoint, or Space). This repository does not bundle the model weights—the backend calls that service through `PLATE_SERVICE_URL`.

## Monorepo layout

| Directory   | Role |
|------------|------|
| `frontend/` | Web UI (React 19, TanStack Router / Start, Tailwind CSS 4, Vite). Dev server on port **3000** by default. |
| `backend/`  | REST API (Express 5, Drizzle ORM + PostgreSQL, Swagger docs). Default port **3000** via `PORT`—use a **different** port locally when running both apps (e.g. backend `3001`). |

## AI / license plate detection

Nepali license plate reading uses an **OCR + YOLO**-style pipeline (see the landing copy in the app). The **model is hosted on Hugging Face**.

The backend sends vehicle images to that HTTP endpoint via `extractLicensePlate` in `backend/src/lib/liscence.ts`. Set `PLATE_SERVICE_URL` to your Hugging Face inference URL (or any compatible endpoint that returns the JSON shape that function expects).

## Prerequisites

- [Bun](https://bun.sh) (frontend `packageManager`; install with `bun install` in `frontend/`)
- Node.js (backend uses `npm`/`tsx`; see `backend/package.json`)
- PostgreSQL

## Backend

### Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — see Environment variables below
```

### Environment variables

Validated at startup in `backend/src/config/env.ts`:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret for signing JWTs
- `IMAGE_KIT_PUBLIC_KEY`, `IMAGE_KIT_PRIVATE_KEY`, `IMAGE_KIT_ENDPOINT` — [ImageKit](https://imagekit.io) (avatars/uploads)

Optional / defaults:

- `NODE_ENV` (default `development`)
- `PORT` (default `3000`)
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`

Required when using vehicle image upload for entry/exit (plate extraction):

- `PLATE_SERVICE_URL` — base URL for the plate-detection service (e.g. your Hugging Face Inference API or Space URL). Used by `backend/src/lib/liscence.ts`.

`backend/.env.example` lists some variables; align your `.env` with the code if anything is missing.

### Database (Drizzle)

```bash
npm run db:generate   # generate migrations
npm run db:migrate    # apply migrations
# or: npm run db:push  # push schema (dev)
npm run db:studio     # Drizzle Studio
```

### Run

```bash
npm run dev    # tsx watch src/server.ts
npm run build && npm start   # production
npm test       # Jest
```

### API overview

- **Root:** `GET /` — API info
- **Health:** `/health`
- **Auth:** `/api/auth/*` (login, profile, etc.)
- **Vehicles:** `/api/vehicles/*` (entry, exit, list, single vehicle)
- **Stream:** `/api/vehicles/stream` — vehicle events stream
- **Docs:** `/api/docs` (Swagger UI), `/api/docs.json` (OpenAPI JSON)

CORS allows `http://localhost:3000` and `https://parking.thesandip.dev` (see `backend/src/app.ts`).

## Frontend

### Setup

```bash
cd frontend
bun install
```

Create `frontend/.env.local` (or equivalent) with:

- `VITE_BASE_URL` — full base URL of the backend API (e.g. `http://localhost:3001` if the API runs on 3001)

### Run

```bash
bun run dev      # http://localhost:3000
bun run build
bun run preview
bun run test     # Vitest
bun run lint
```

Frontend API paths are centralized in `frontend/src/config/api-endpoints.ts`.

More detail on TanStack Router, testing, and tooling: see [`frontend/README.md`](frontend/README.md).

## Local dev: two processes

1. Start **PostgreSQL** and configure `DATABASE_URL`.
2. Configure **`PLATE_SERVICE_URL`** if you use image-based entry/exit.
3. Start **backend** on e.g. port **3001** (`PORT=3001` in `.env`).
4. Set **`VITE_BASE_URL=http://localhost:3001`** for the frontend.
5. Start **frontend** on port **3000** (`bun run dev` in `frontend/`).

## License

Backend `package.json` specifies **MIT** (see `backend/package.json`).

## Author
**Pranika Angdembe Limbu**
**Raghav Upadhyay**
**Sandip Sapkota**
**Sulav Paudel**
