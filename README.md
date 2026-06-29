# Organizer

Full-stack productivity organizer built from `organizer_build_prompt.md`.

## Stack

- Backend: Rails 8 API-only
- Database: PostgreSQL 16
- Frontend: React + Vite
- Styling: Tailwind CSS
- Routing: React Router
- API: JSON REST
- Auth: email/password with JWT

## Backend Setup

```sh
cd backend
bundle install
cp .env.example .env
rails db:prepare
rails db:seed
rails server -p 3000
```

Database connection is configured in `backend/config/database.yml`, with local values loaded from `backend/.env`. You can also use `DATABASE_URL` if you prefer a single PostgreSQL URL.

Seed login:

```txt
bashar@example.com
password123
```

## Frontend Setup

```sh
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open `http://localhost:5173`. If you open the app at `http://127.0.0.1:5173`, keep that origin in `FRONTEND_ORIGIN` too.

## Run Both Apps

After setup, start the backend and frontend together from the project root:

```sh
./bin/dev
```

Stop both dev servers:

```sh
./bin/stop-dev
```

## Useful Commands

```sh
cd backend
rails routes
rails zeitwerk:check
rails test
```

```sh
cd frontend
npm run lint
npm run build
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/account`
- `GET /api/dashboard`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/:task_id/task_detail`
- `POST /api/tasks/:task_id/task_detail`
- `GET /api/targets`
- `POST /api/targets`
- `GET /api/calendar/month`
- `GET /api/calendar/day`
- `GET /api/calendar_events`
- `POST /api/calendar_events`

Task deadlines are returned by the calendar endpoints automatically; they are not duplicated as calendar events.
