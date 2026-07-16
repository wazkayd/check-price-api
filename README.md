# check-price-api

Check Price is a location-based price comparison platform. It allows users to search and compare product prices across participating stores before visiting a store.

## Phase 1 API

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` (Bearer token required)
- Swagger UI: `/api-docs`

## Local development

```bash
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run start:dev
```

If your password contains `%`, URL-encode it as `%25` in `DATABASE_URL`.

## Deploy to Render

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect the `wazkayd/check-price-api` repo.
4. Render reads `render.yaml` and creates:
   - Web service: `check-price-api`
   - PostgreSQL database: `check-price-db`
5. Click **Apply** and wait for the deploy to finish.

### Option B — Manual setup

1. **Create PostgreSQL** on Render (free tier).
2. **Create Web Service** → connect GitHub repo `wazkayd/check-price-api`.
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
4. Add environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal connection string from Render Postgres |
| `JWT_SECRET` | Long random secret |
| `JWT_EXPIRES_IN` | `1d` |
| `DATABASE_SSL` | `true` |

Render sets `RENDER_EXTERNAL_URL` automatically for Swagger.

## Share with frontend

After deploy, send:

```
API Base URL: https://<your-service>.onrender.com
Swagger:      https://<your-service>.onrender.com/api-docs
Guide:        check-price-backend-integration-guide.mdc
```
