# Tri Dash — Next.js + Ant Design

Dashboard de triathlon com integração Strava. Stack: Next.js 14 (App Router) + Ant Design 5 + Recharts + iron-session.

## Estrutura

```
tri-dash-next/
├── app/
│   ├── layout.jsx              ← ConfigProvider Ant Design + dark mode
│   ├── page.jsx                ← Dashboard principal (client component)
│   ├── globals.css
│   └── api/
│       ├── me/route.js         ← GET /api/me
│       ├── activities/route.js ← GET /api/activities
│       └── auth/
│           ├── login/route.js     ← GET /api/auth/login
│           ├── callback/route.js  ← GET /api/auth/callback
│           └── logout/route.js    ← GET /api/auth/logout
├── components/
│   ├── AuthCard.jsx
│   ├── TopBar.jsx
│   ├── KpiGrid.jsx
│   ├── SportCards.jsx
│   ├── ChartsRow.jsx
│   ├── SessionsList.jsx
│   └── AddSessionForm.jsx
├── lib/
│   ├── session.js     ← iron-session config (server)
│   ├── strava.js      ← mapActivity + TSS estimate
│   └── constants.js   ← SPORTS, helpers, formatters
├── next.config.js
└── package.json
```

## Setup local

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite `.env.local`:
```
STRAVA_CLIENT_ID=seu_client_id
STRAVA_CLIENT_SECRET=seu_client_secret
APP_URL=http://localhost:3000
SESSION_SECRET=string_aleatoria_32_chars
```

Gerar SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar app no Strava
Em https://www.strava.com/settings/api:
- **Authorization Callback Domain**: `localhost`

### 4. Rodar
```bash
npm run dev
```
Acesse: http://localhost:3000

---

## Deploy no Vercel

### 1. Push para o GitHub
```bash
git init && git add . && git commit -m "feat: tri dash next"
git remote add origin https://github.com/SEU_USUARIO/tri-dash-next.git
git push -u origin main
```

### 2. Importar no Vercel
- https://vercel.com/new → importar repositório
- Framework Preset: **Next.js** (detectado automaticamente)
- Clicar em **Deploy**

### 3. Variáveis de ambiente no Vercel
Settings → Environment Variables:

| Variável | Valor |
|---|---|
| `STRAVA_CLIENT_ID` | ID da app Strava |
| `STRAVA_CLIENT_SECRET` | Secret da app Strava |
| `APP_URL` | `https://tri-dash-next.vercel.app` |
| `SESSION_SECRET` | String aleatória ≥ 32 chars |

Após adicionar: **Deployments → Redeploy**

### 4. Atualizar callback no Strava
Em https://www.strava.com/settings/api:
- **Authorization Callback Domain**: `tri-dash-next.vercel.app`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Ant Design 5 |
| Gráficos | Recharts |
| Sessão | iron-session |
| HTTP (Strava) | fetch nativo |
| Deploy | Vercel |
