# Tri Dash

Training dashboard integrated with Strava. Displays weekly activities, KPIs by sport (swimming, cycling, running and gym) and allows adding manual sessions.

## Stack

- **Next.js 16** (App Router) — frontend and API routes
- **Ant Design + Recharts** — UI and charts
- **better-sqlite3** — local storage for users and tokens
- **iron-session** — HTTP-only cookie session
- **Strava OAuth** — authentication and activity fetching

## Structure

```
app/
├── page.jsx                    ← Main dashboard
├── layout.jsx
└── api/
    ├── me/route.js             ← GET /api/me
    ├── activities/route.js     ← GET /api/activities
    └── auth/
        ├── login/route.js      ← GET /api/auth/login
        ├── callback/route.js   ← GET /api/auth/callback
        └── logout/route.js     ← GET /api/auth/logout
components/                     ← TopBar, KpiGrid, ChartsRow, SessionsList, SportCards, AuthCard
lib/
├── constants.js                ← Utility functions and sport constants
├── crypto.js                   ← AES-256-GCM token encryption
├── db.js                       ← SQLite access
├── session.js                  ← iron-session configuration
└── strava.js                   ← Activity mapping and token refresh
__tests__/                      ← Unit tests (Vitest)
```

## Local setup

**1. Install dependencies**

```bash
npm install
```

**2. Environment variables**

Create a `.env.local` file at the project root:

```env
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
APP_URL=http://localhost:3000
TOKEN_ENCRYPTION_KEY=   # 64-character hex string (32 bytes)
```

Generate the `TOKEN_ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**3. Configure your Strava app**

In [strava.com/settings/api](https://www.strava.com/settings/api), set the authorization callback URL:

- Local: `http://localhost:3000/api/auth/callback`
- Production: `https://YOUR_DOMAIN/api/auth/callback`

**4. Run**

```bash
npm run dev
# http://localhost:3000
```

## Tests

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Tests cover the pure functions in `lib/constants.js`, `lib/crypto.js` and `lib/strava.js`.

## Deploy

Deployed via [Render](https://render.com). CI (GitHub Actions) runs tests and build on every push to `main`, then triggers the Render deploy hook on success.

Environment variables must be configured in the Render dashboard, not in the repository.