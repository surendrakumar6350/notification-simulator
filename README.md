<p align="center">
    <img src="https://iili.io/K5cI42V.md.png" align="center" width="50%" style="border-radius: 5%;">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/AWS Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white" alt="AWS Lambda">
  <img src="https://img.shields.io/badge/Monorepo-000000?style=for-the-badge&logo=github&logoColor=white" alt="Monorepo">
</p>
<br>


| Directory            | Description                                      |
|----------------------|--------------------------------------------------|
| `apps/web`           | Next.js frontend application                     |
| `external/worker`    | AWS Lambda-compatible SMS worker service         |
| `packages/`          | Shared utilities and type definitions            |

---

## 📂 Project Structure
```text
notification-simulator/
├── .github/                # GitHub configurations (workflows, actions, etc.)
│   └── ...
├── .husky/                 # Git hooks (e.g., pre-push checks)
│   └── pre-push
├── apps/                   # Application layer
│   ├── docs/               # Documentation site
│   └── web/                # Next.js frontend application
├── external/               # External services
│   ├── .serverless/        # Serverless framework files
│   ├── apk-server/         # APK server
│   └── worker/             # AWS Lambda-compatible SMS worker service
├── mobile/                 # Mobile app
├── packages/               # Shared packages
│   ├── tests/              # Testing utilities
│   └── types/              # TypeScript type definitions
└── vercel.json             # Vercel deployment configuration
```


## 🚀 Setup Instructions

Follow these steps to get the project running locally:

### 1. **Clone the Repository**

```bash
git clone {{REPOSITORY_CLONE_URL}}
cd notification-simulator
```

### 2. **Install Dependencies**

```bash
npm install
```
This will install root, frontend and shared package dependencies.

## 🔑 Environment Variables

**Both `apps/web` and `external/worker` require their own `.env` files.**  
Always use the latest `.env.example` files as a template.

### 🔒 External Link Configuration

This repository uses placeholders for external links to improve security. Before deployment:

1. Replace `{{REPOSITORY_CLONE_URL}}` with your actual repository URL
2. Replace `{{MONGODB_ATLAS_URL}}` with the MongoDB Atlas URL or your preferred database provider  
3. Replace `{{API_SERVER_URL}}` in `apps/docs/src/openapi.json` with your API server URL
4. Configure analytics URLs in environment variables (see `.env.example`)

### 🧹 Link Sanitization

Use the included sanitization script to scan for hardcoded external links:

```bash
# Scan for external links
npm run sanitize-links

# Replace links with placeholders (dry run)
npm run sanitize-links -- --fix --dry-run

# Replace links with placeholders
npm run sanitize-links -- --fix

# Use custom placeholder
npm run sanitize-links -- --fix --placeholder "YOUR_PLACEHOLDER"
```

### Required Secrets & How To Obtain

| Variable                | Where?             | Description / How to Get                      |
|-------------------------|--------------------|-----------------------------------------------|
| `DB`                    | web                | From [MongoDB Atlas]({{MONGODB_ATLAS_URL}}) |
| `REDIS_URL`             | web                | From your Redis hosting provider              |
| `WORKER_URI`            | web                | API Gateway/Lambda endpoint URL for worker    |
| `WORKER_SECRET`         | web, worker        | Secret shared between web & worker (AWS secret or env) |
| `TURNSTILE_SITE_KEY`    | web                | Cloudflare Turnstile dashboard                |
| `TURNSTILE_SECRET_KEY`  | web                | Cloudflare Turnstile dashboard                |
| `JWT_SECRET_KEY`        | web, worker        | Generate: `openssl rand -base64 32`           |
| `MAILSENDER_KEY`        | web                | From your MailSender provider                 |
| `MAILSENDER_FROM`       | web                | Verified sender address                       |
| `ADMIN_PASSWORD`        | web                | Strong password for admin panel               |

### Example: Copying Env Files

```bash
cp apps/web/.env.example apps/web/.env
cp external/worker/.env.example external/worker/.env
```

**Edit the new `.env` files with your real credentials.**  

---

### **Run the Next.js Frontend**

From the project root:

```bash
npm run dev --workspace=web
```
or, manually:

```bash
cd apps/web
npm install
npm run dev
```

App will be available at [http://localhost:3000](http://localhost:3000).

### **Run the Worker Service**

In a separate terminal:

```bash
cd external/worker
npm install
npm run dev
```

---

<p align="center">
  <!-- Tech Stack -->
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/AWS Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white" alt="AWS Lambda">

  <br/>

  <!-- Project Status -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&color=28a745" alt="status">
  <img src="https://img.shields.io/github/commit-activity/m/surendrakumar6350/notification-simulator?style=for-the-badge&color=0080ff" alt="commit-activity">
  <img src="https://img.shields.io/github/issues/surendrakumar6350/notification-simulator?style=for-the-badge&color=orange" alt="issues">

  <br/>

  <!-- Fun -->
  <img src="https://img.shields.io/badge/Made%20with-Love-red?style=for-the-badge" alt="made-with-love">
  <img src="https://img.shields.io/badge/Powered%20By-Coffee-brown?style=for-the-badge" alt="powered-by-coffee">
  <img src="https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge&logo=github" alt="prs-welcome">
</p>
