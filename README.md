
```markdown
# Tri Dash — Triathlon dashboard

Quick summary

Tri Dash is a Next.js (App Router) dashboard that integrates with Strava using OAuth. The UI is built with Ant Design and charts with Recharts. Authentication and athlete tokens are stored server-side using `iron-session`. Activities are fetched from Strava via server API routes and cached locally in the browser's `localStorage` alongside manually added sessions.

Architecture (high level)

- Frontend: React + Next.js (App Router) with client components for interactive UI.
- Backend: Next API route handlers in `app/api/*` that act as a proxy to Strava and manage session cookies with `iron-session`.
- Persistence: tokens and athlete data stored in server-side session (cookie). Activity cache and manual sessions are stored in `localStorage` on the client.


```

Project structure

```
tri-dash/
├── app/
│   ├── layout.jsx              ← Ant Design ConfigProvider + theme/dark mode
│   ├── page.jsx                ← Main dashboard (client component)
│   ├── globals.css
+│   └── api/
│       ├── me/route.js         ← GET /api/me (basic athlete info)
│       ├── activities/route.js ← GET /api/activities (proxy to Strava + refresh)
│       └── auth/
│           ├── login/route.js     ← GET /api/auth/login (start OAuth)
│           ├── callback/route.js  ← GET /api/auth/callback (exchange code -> token)
│           └── logout/route.js    ← GET /api/auth/logout (destroy session)
├── components/                  ← UI components: TopBar, KpiGrid, ChartsRow, SessionsList, AddSessionForm, AuthCard
├── lib/                         ← shared logic: session config, Strava mapping, constants
├── next.config.js
├── package.json
└── README.md
```

Important endpoints

- GET /api/auth/login — start OAuth flow (redirect to Strava)
- GET /api/auth/callback — OAuth callback, exchanges code for tokens and saves `session.athlete`
- GET /api/auth/logout — clear session
- GET /api/me — return basic athlete info (id, firstname, lastname, profile)
- GET /api/activities?weeks=N — fetch activities from Strava (uses session token; refreshes token if needed)

Local setup

1) Install dependencies

```bash
npm install
```

2) Environment variables

Create a `.env.local` file at the project root and set the variables:

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
APP_URL=http://localhost:3000
SESSION_SECRET=random_32_bytes_hex_or_base64
```

Generate a secure `SESSION_SECRET` example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Security note: do not commit `.env.local`. In production, always set `SESSION_SECRET` to a secure value with at least 32 bytes of entropy.

3) Configure your Strava application

On Strava's API settings (https://www.strava.com/settings/api) create an app and set the authorization callback URL:

- Local: `http://localhost:3000/api/auth/callback`
- Production: `https://YOUR_DOMAIN/api/auth/callback`

4) Run locally

```bash
npm run dev
# Open http://localhost:3000
```

Deploy to Vercel

1. Push the repo to GitHub and import it into Vercel.
2. Configure environment variables in the Vercel dashboard (STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, APP_URL, SESSION_SECRET).
3. Update the Strava app callback to match your production domain.

Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI | Ant Design |
| Charts | Recharts |
| Session | iron-session (httpOnly cookie) |
| HTTP | fetch (native) |
| Deployment | Vercel |

Quick recommendations

- Ensure `SESSION_SECRET` is set in production and remove the insecure fallback from server code.
- Manual sessions are stored in `localStorage` and are not shared between devices — consider adding server-side persistence keyed by `athlete.id` if you need multi-device sync.
- Avoid logging secrets (client secret or tokens). Add monitoring for OAuth/token exchange errors and for token refresh failures.
- Consider protecting the token refresh logic from parallel refresh race conditions if your app issues concurrent requests.

License / notes

Personal project. Adjust environment variables and domains as needed.

``` 

Docker & CI
------------

This repository includes Docker and GitHub Actions configuration to build a production image and optionally export a static site to GitHub Pages (note: static export will not include server APIs or OAuth flows).

Files added:
- `Dockerfile.prod` — multi-stage build using Next.js standalone output.
- `docker-compose.dev.yml` — development compose with hot-reload (mounts code, runs `next dev`).
- `docker-compose.prod.yml` — simple compose for production image running `node server.js` from standalone output.
- `.github/workflows/ci.yml` — workflow that builds the app, pushes a Docker image to GHCR and attempts a static `next export` to deploy to GitHub Pages (if applicable).

Run locally with Docker (development):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run production image locally (example):

```bash
docker build -f Dockerfile.prod -t tri-dash:prod .
docker run -it --rm -p 3000:3000 \
  -e STRAVA_CLIENT_ID=xxx \
  -e STRAVA_CLIENT_SECRET=yyy \
  -e APP_URL=http://localhost:3000 \
  -e SESSION_SECRET=your_secret_here \
  tri-dash:prod
```

GitHub Actions
--------------

The workflow pushes a Docker image to GitHub Container Registry and attempts to export static pages to GitHub Pages (only works for apps that can be statically exported). Configure repository secrets if you want the GHCR image to be pushed under your account — the workflow uses `GITHUB_TOKEN` by default.

Notes & limitations
- The Next.js static export (`next export`) will not include server API routes or the OAuth callback; GitHub Pages can only serve a static site — the app's interactive features that depend on server APIs will not work there. For full functionality, deploy the Docker image to a server or platform that runs containers (VPS, DigitalOcean, AWS ECS, etc.).
- Keep secrets out of source and provide them at runtime using environment variables or secret managers.


