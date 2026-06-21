<div align="center">

  <h1>
    <span>Notify</span><span style="color:#E11D48">flow</span>
  </h1>

  <p>Multi-channel notification delivery infrastructure for developers</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-E11D48?style=flat-square)](LICENSE)

  <br/>

  [Live Demo](https://notifyflow-dashboard.vercel.app) · 
  [Documentation](https://notifyflow.mintlify.app) · 
  [Report Bug](https://github.com/soham1826/notifyflow/issues)

</div>

<br/>

---

## Overview

**Notifyflow** is an open-source, multi-channel notification infrastructure that enables developers to dispatch emails, webhooks, in-app messages, and SMS alerts via a single API call. By adopting a Bring Your Own Keys (BYOK) model, it securely encrypts and stores your custom provider credentials, giving you complete control over your delivery reputation and billing rates without sacrificing a unified delivery pipeline.

<br/>

---

## Features

| Feature | Description |
|---|---|
| **Multi-channel** | Email, Webhooks, In-App, and SMS (mock) unified under a single API schema |
| **Bring Your Own Keys (BYOK)** | Securely connect your own service providers (e.g., Resend for email) |
| **Three Priority Queues** | Jobs are divided into high, default, and bulk queues to ensure critical alerts never block |
| **Exponential Backoff** | Automated job retry loop with up to 4 attempts and exponential backoff spacing |
| **Dead Letter Queue (DLQ)** | Failed notifications are held in a DLQ for manual inspection and rerun triggers |
| **Atomic Rate Limiting** | Sliding-window rate limits evaluated atomically inside Redis via custom Lua scripts |
| **Real-time Delivery Stream** | Delivery statuses and payload lifecycle events streamed via Server-Sent Events (SSE) |
| **Redis Pub/Sub** | Decoupled cross-process message bus connecting worker engines with client controllers |
| **AES-256-GCM Encryption** | Stored provider API keys encrypted at rest using server-side keys |
| **Multi-tenant Architecture** | Isolated database, queue contexts, and API keys scoped per tenant |
| **Template Interpolation** | Dynamic double-brace `{{variable}}` substitution parsed at runtime |
| **Live Dashboard** | Real-time queue metrics, worker state logs, and connection health metrics |

<br/>

---

## Architecture

```text
┌─────────────────────────────────────────────────┐
│                  Developer App                   │
└──────────────────────┬──────────────────────────┘
                       │ POST /api/v1/notify
                       │ x-api-key: nf_live_xxx
                       ▼
┌─────────────────────────────────────────────────┐
│              Notifyflow API Server               │
│         Express + TypeScript + Zod               │
│                                                  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth (JWT) │  │ Rate     │  │  Template  │  │
│  │  + API Keys │  │ Limiter  │  │  Engine    │  │
│  └─────────────┘  └──────────┘  └────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ Enqueue job
                       ▼
┌─────────────────────────────────────────────────┐
│                  Redis (BullMQ)                  │
│                                                  │
│   notifications:high  →  concurrency: 10         │
│   notifications:default → concurrency: 5         │
│   notifications:bulk  →  concurrency: 1          │
└──────────────────────┬──────────────────────────┘
                       │ Process job
                       ▼
┌─────────────────────────────────────────────────┐
│             BullMQ Worker Process                │
│                                                  │
│  ┌──────────┐ ┌─────────┐ ┌───────┐ ┌───────┐  │
│  │  Email   │ │Webhook  │ │In-App │ │  SMS  │  │
│  │ (Resend) │ │(HMAC)   │ │ (DB)  │ │(Mock) │  │
│  └──────────┘ └─────────┘ └───────┘ └───────┘  │
│                                                  │
│  Retry: 4 attempts, exponential backoff          │
│  Failure → Dead Letter Queue                     │
└──────────────────────┬──────────────────────────┘
                       │ Redis Pub/Sub
                       ▼
┌─────────────────────────────────────────────────┐
│           Next.js Dashboard (SSE)                │
│   Real-time delivery stream + Queue health       │
└─────────────────────────────────────────────────┘
```

<br/>

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Strict type safety across packages and shared modules |
| **Backend** | ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | Lightweight Node.js REST API server |
| **Validation** | ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white) | Schema verification and runtime type enforcement |
| **Queue** | ![BullMQ](https://img.shields.io/badge/BullMQ-orange?style=flat-square) + ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) | Queueing architecture, concurrency control, and job retention |
| **Database** | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) + ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Relational persistence layer and ORM |
| **Auth** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Session management, JWT generation, and OAuth signups |
| **Email** | ![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square&logo=resend&logoColor=white) | Transactional email provider for the BYOK engine |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) + ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Interactive settings dashboard and landing pages |
| **Components** | ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white) | Reusable design system UI components |
| **Docs** | ![Mintlify](https://img.shields.io/badge/Mintlify-15E8B7?style=flat-square) | Public API developer guides and reference portals |
| **Deployment** | ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white) + ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | Deployment infrastructure for API and Client |

<br/>

---

## Getting Started

### Prerequisites

Make sure you have the following services installed or configured:
- **Node.js** 20+
- **PostgreSQL** database (or a Supabase account)
- **Redis** server (or Render Key Value)
- **Resend** account (for sending transactional emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/soham1826/notifyflow.git
cd notifyflow

# Install project dependencies
npm install

# Set up local environment variables
cp .env.example .env
```

### Environment Setup

Add the following values into your `.env` file at the root:

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (use pooler URL for migrations/production) |
| `REDIS_URL` | ✅ | Redis connection endpoint |
| `SUPABASE_URL` | ✅ | Supabase project instance URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous API key |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client-exposed Supabase instance URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client-exposed Supabase anonymous key |
| `NEXT_PUBLIC_API_URL` | ✅ | API base URL for the Next.js frontend to target |
| `PROVIDER_ENCRYPTION_KEY` | ✅ | 64-character hexadecimal key for AES-256-GCM encryption |
| `RESEND_API_KEY` | ✅ | Default Resend API key used for system/test notifications |
| `CORS_ORIGIN` | ✅ | Allowed client domain header for CORS protection |
| `GOOGLE_CLIENT_ID` | ⚪ | Google Client ID for Supabase OAuth setup (optional) |
| `GOOGLE_CLIENT_SECRET` | ⚪ | Google Secret key for Supabase OAuth setup (optional) |

### Running Locally

```bash
# 1. Generate the provider API key encryption key (if not already set in .env)
npx ts-node scripts/generate-encryption-key.ts

# 2. Run Prisma migrations to build your database schema
npm run db:migrate

# 3. Spin up the Express API server in development mode
npm run dev --workspace=apps/api

# 4. Spin up the Next.js dashboard frontend in development mode
npm run dev --workspace=apps/dashboard
```

<br/>

---

## API Usage

To trigger a delivery, send a `POST` request to the ingestion endpoint with your tenant API key:

```bash
curl -X POST https://notifyflow-api.onrender.com/api/v1/notify \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "EMAIL",
    "recipient": "user@example.com",
    "template": "welcome",
    "data": {
      "name": "Sarah",
      "company": "Acme Corp"
    },
    "priority": "HIGH"
  }'
```

### Response

```json
{
  "notification_id": "notif_01HX...",
  "status": "queued"
}
```

<br/>

---

## Key Engineering Decisions

### 1. Async-First Delivery Pipeline
The REST API endpoint behaves purely as a high-throughput ingestion queue. When a payload is submitted, it validates the request body using a Zod schema and immediately pushes a job metadata object to Redis before returning a `202 Accepted` status back to the client. This decouples the client from down-stream HTTP handshakes, provider latencies, and third-party rate limits, ensuring maximum throughput and high system durability.

### 2. Three-Tier Priority Queues
Notifyflow uses three dedicated BullMQ queues (`high`, `default`, and `bulk`) to isolate notification categories. High-priority operations, such as OTPs and password reset triggers, bypass other messages, running with a concurrency of 10. Default alerts, such as notifications or comments, run with a concurrency of 5. Bulk campaigns, such as marketing digests, run with a concurrency of 1. This prevents marketing dispatches from causing delivery lag on critical system emails.

### 3. Atomic Rate Limiting via sliding-window Lua Script
To prevent race conditions, the sliding-window rate limiter is implemented inside a Redis Lua script. Checking the window size and incrementing the request counter are executed as a single transaction block directly in Redis. This prevents "double-spend" bypasses in multi-node API clusters where parallel requests might otherwise fetch stale client counters concurrently.

### 4. Bring Your Own Keys (BYOK) with AES-256-GCM Encryption
To allow tenants to use their own sending infrastructure, Notifyflow implements a BYOK engine. API credentials for Resend or other providers are encrypted on submit using AES-256-GCM. The initialization vectors (IVs) and authentication tags are stored in the database alongside the cipher. Keys are decrypted only inside worker execution memory during job execution, meaning raw keys are never exposed in logs or databases.

### 5. Decoupled Cross-Process SSE Pipeline via Redis Pub/Sub
The worker process and the Express API server are separated to isolate workloads. When a worker completes a delivery job, it publishes a payload lifecycle event to a Redis Pub/Sub channel. The API server subscribes to this channel and pipes matching event strings to active client streams via Server-Sent Events (SSE), keeping frontend dashboards updated without database polling.

### 6. Strategy Pattern for Provider Channel Abstraction
The codebase maps channel dispatch logic using a modular Strategy pattern. Each messaging provider implements a standard `NotificationChannel` interface exposing `send(recipient, content, config)` contracts. Adding new delivery providers (such as Twilio or Amazon SES) involves writing a new strategy subclass, leaving the core queueing pipeline, workers, and Express routing completely unchanged.

<br/>

---

## Project Structure

```text
notifyflow/
├── apps/
│   ├── api/                  # Express API + BullMQ Worker
│   │   ├── src/
│   │   │   ├── channels/     # Email, Webhook, InApp, SMS
│   │   │   ├── middleware/   # Auth, rate limiting
│   │   │   ├── queues/       # BullMQ queue definitions
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── workers/      # Job processors
│   │   │   └── utils/        # Encryption, SSE, templates
│   │   ├── server.ts         # API entry point
│   │   └── worker.ts         # Worker entry point
│   └── dashboard/            # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── (landing)/  # Landing page
│           │   ├── auth/       # Login, signup, callback
│           │   └── dashboard/  # Main app pages
│           └── lib/            # API client, Supabase
├── packages/
│   ├── db/                   # Prisma schema + client
│   └── shared/               # Zod schemas + types
├── docs/                     # Mintlify documentation
└── README.md
```

<br/>

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| **API Server + Worker** | Render (Web Service) | https://notifyflow-api.onrender.com |
| **Dashboard** | Vercel | https://notifyflow-dashboard.vercel.app |
| **Database** | Supabase | — |
| **Redis / Queue** | Render Key Value | — |
| **Docs** | Mintlify | https://notifyflow.mintlify.app |

> [!NOTE]
> Please refer to the deployment guide in the [Mintlify docs](https://notifyflow.mintlify.app) for step-by-step instructions.

<br/>

---

## Roadmap

- [x] Multi-channel delivery (Email, Webhook, In-App)
- [x] BullMQ priority queues with exponential backoff
- [x] Dead letter queue + manual retry
- [x] BYOK provider system with AES-256-GCM encryption
- [x] Atomic Redis rate limiting (sliding window Lua)
- [x] Real-time dashboard with SSE
- [x] Multi-tenant architecture
- [x] Google OAuth + Supabase Auth
- [x] Mintlify documentation
- [ ] Event-driven inbound (POST /events + trigger rules)
- [ ] Real SMS provider (MSG91 / Twilio)
- [ ] Webhook retry with configurable endpoints
- [ ] Usage analytics per tenant
- [ ] Scheduled/delayed notifications
- [ ] SDK (Node.js client library)

<br/>

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use this project as a reference or starting point for your own notification infrastructure.

<br/>

---

## Author

<div align="center">
  Built by Soham — Full Stack Developer
  
  [LinkedIn](https://www.linkedin.com/in/soham-ashok-kulkarni/) · [GitHub](https://github.com/soham1826) · [Portfolio](https://www.sohamkulkarni.in/)
</div>
