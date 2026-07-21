# 🚀 Deploying EduOMR on Railway

This guide outlines how to deploy the entire EduOMR multi-tenant monorepo on **Railway** in under 5 minutes.

---

## Architecture Overview

Railway will run 4 services inside a unified **Project**:
1. **Database**: Managed PostgreSQL.
2. **Cache & Queue**: Managed Redis.
3. **Backend API**: Node.js/Express ESM container (built from `apps/api/Dockerfile`).
4. **Frontend Web**: Vite/React container served by Nginx (built from `apps/web/Dockerfile`).

---

## Step-by-Step Deployment

### Step 1: Create a Railway Project
1. Go to [Railway.app](https://railway.app/) and sign in.
2. Click **New Project** → **Empty Project**.

### Step 2: Provision Databases
1. Click **+ Add Service** → **Database** → **Add PostgreSQL**.
2. Click **+ Add Service** → **Database** → **Add Redis**.

---

### Step 3: Add Backend API Service
1. Click **+ Add Service** → **GitHub Repo** → select your `eduomr` repository.
2. Railway will add a service. Click on it, go to **Settings** → **General**:
   - Change **Service Name** to `api`.
   - Set **Root Directory** to `/apps/api` (this triggers monorepo scoping).
3. Under **Variables**, add the following environment variables:
   - `PORT`: `3000` (this is matched in our Dockerfile).
   - `DATABASE_URL`: `${{PostgreSQL.DATABASE_URL}}` (wires the managed Postgres).
   - `REDIS_URL`: `${{Redis.REDIS_URL}}` (wires the managed Redis).
   - `JWT_SECRET`: Generate a secure 512-bit random string (at least 32 chars).
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://${{web.RAILWAY_PUBLIC_DOMAIN}}` (wires our React domain automatically).
4. Go to **Settings** → **Networking** → Click **Generate Domain** (gives you the API endpoint).

---

### Step 4: Add Frontend Web Service
1. Click **+ Add Service** → **GitHub Repo** → select the `eduomr` repository again.
2. Click on it, go to **Settings** → **General**:
   - Change **Service Name** to `web`.
   - Set **Root Directory** to `/apps/web` (this triggers monorepo scoping).
3. Under **Settings** → **Networking** → Click **Generate Domain** (gives you your public-facing student/teacher app domain).
4. Under **Variables**, add the following:
   - `PORT`: `80` (this matches the Nginx port exposed by the web Dockerfile).

---

## Post-Deployment Validation

### 1. Migrations & Seeding
On the first boot, the `api` container automatically executes `npx prisma migrate deploy` via the `docker-entrypoint.sh` script to set up all 20+ tables.

To seed the initial platform data (super_admin, subscription plans, default institution):
1. Install Railway CLI locally: `npm i -g @railway/cli`.
2. Login: `railway login`.
3. Run the seed script:
   ```bash
   railway run -s api npm run prisma:seed
   ```
4. You can now log into the web app using:
   - **Platform Owner**: `platform@eduomr.com` / `Admin@123`
   - **Institution Admin**: `admin@alpha.edu` / `Admin@123`
   - **Teacher**: `teacher@alpha.edu` / `Admin@123`
   - **Student**: `student@alpha.edu` / `Admin@123`
   - **Parent**: `parent@alpha.edu` / `Admin@123`

### 2. Scaling Background Workers
To scale background workers (evaluation/notifications):
By default, the API container boots the Express app. In high-traffic scenarios, you can add a separate worker service on Railway pointing to root directory `/apps/api` with command `node src/jobs/notification.worker.js` and `node src/jobs/evaluation.worker.js` respectively.

---

## Secrets Rotation

Make sure to periodically rotate the following production variables inside the `api` service:
- `JWT_SECRET`
- `META_APP_SECRET`
- `META_WEBHOOK_TOKEN`
- `SMTP_PASS`
