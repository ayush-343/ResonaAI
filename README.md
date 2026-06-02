# ResonaAI 🎙️

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6%2B-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2-F38020?style=for-the-badge&logo=cloudflare)](https://www.cloudflare.com/products/r2/)

ResonaAI is a state-of-the-art, open-source, multi-tenant AI Text-to-Speech (TTS) SaaS platform. Built on top of **Next.js 15+ (App Router)**, **React 19**, **Prisma**, **PostgreSQL**, and **Clerk**, ResonaAI provides high-fidelity, highly configurable voice generation tailored for workspaces and organizations.

Whether you're building audiobooks, podcasts, customer service agents, or custom voice motif generations, ResonaAI offers fine-grained ML parameter tuning (temperature, top-P, top-K, repetition penalty) along with a robust tenant-isolation architecture.

---

## 🚀 Key Features

*   👥 **Multi-Tenant Organization Workspaces:** Securely manage voices, generations, and settings scoped to Clerk-managed organizations.
*   🎛️ **Granular ML Hyperparameter Tuning:** Complete control over output characteristics during generation (Temperature, Top-K, Top-P, and Repetition Penalty).
*   💵 **Real-Time Cost Estimation:** Live character count and cost prediction on the frontend using dynamic pricing algorithms before running costly ML inferences.
*   📦 **Hybrid Cloud Architecture:** Heavy audio blobs are uploaded to Cloudflare R2 (S3-compatible, zero-egress fee blob storage) while light metadata is queried from a high-performance PostgreSQL instance.
*   🎙️ **Custom & System Voice Libraries:** Organize voices by categories (Podcast, Audiobook, Narrative, Meditations, Advertising, and more) and variants (System/Custom).
*   🛡️ **Edge-Level Route & Tenant Protection:** Middleware proxy handles JWT parsing and mandates organization selection prior to dashboard access.
*   💾 **Resilient History Preservation:** Implements database denormalization strategies so that custom voices can be deleted without breaking the historical generation records of your organization.

---

## 🛠️ Tech Stack & Architecture

### Core Architecture

```mermaid
flowchart TD
    Client[Next.js Client app] -->|1. Request / Authenticate| Clerk[Clerk Auth / Proxy Middleware]
    Clerk -->|2. Validates Tenant/Org| ServerAction[Next.js Server Actions]
    ServerAction -->|3. Validate Inputs| Zod[Zod Schema / TanStack Form]
    ServerAction -->|4. ML Inference| ML[TTS Engine / API]
    ML -->|5. Store Audio Blob| R2[(Cloudflare R2 Storage)]
    ServerAction -->|6. Save Metadata| Prisma[Prisma ORM]
    Prisma -->|7. Persist State| DB[(PostgreSQL Database)]
```

### The Stack

*   **Framework:** Next.js 15+ (App Router, Server Actions, Server Components)
*   **UI Components:** React 19, Radix UI, `@base-ui/react`, Lucide React
*   **Styling:** Tailwind CSS v4, PostCSS, Glassmorphism design system
*   **Database ORM:** Prisma with `PrismaPg` adapter for Edge / Serverless deployment
*   **Database:** PostgreSQL
*   **Form & State Validation:** `@tanstack/react-form` combined with `zod` for type-safe validation
*   **Authentication:** Clerk (`@clerk/nextjs`) with middleware-based multi-tenancy

---

## 📁 File Structure

The project strictly follows a **domain-driven feature-slicing** layout:

```
src/
├── app/                  # Next.js App Router (Layouts, Pages, Clerk routing)
├── components/           # Generic / Global reusable UI Components
├── features/             # Domain features
│   ├── dashboard/        # Dashboard view & layout features
│   └── text-to-speech/   # TTS generators, settings, history panels
│       ├── components/   # Isolated UI components (Sliders, Inputs, Buttons)
│       ├── data/         # Backend hooks, Server Actions, & Services
│       └── views/        # Main text-to-speech layouts and parent view
├── generated/            # Auto-generated Prisma client
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities (DB clients, Environment helpers)
└── proxy.ts              # Edge middleware for Clerk auth/org checks
```

---

## 🎛️ ML Hyperparameters Explained

When generating audio, ResonaAI allows users to tune:

*   **Temperature:** Controls the randomness of the generated audio waveform. Lower values are more stable; higher values are more expressive but might introduce audio artifacts.
*   **Top-P (Nucleus Sampling):** Samples from the smallest set of acoustic tokens whose cumulative probability exceeds P. This prevents the model from generating improbable sounds.
*   **Top-K:** Restricts sampling to the K most probable next acoustic tokens, hardening the tail of the probability distribution for voice stability.
*   **Repetition Penalty:** Crucial parameter to prevent the transformer from entering infinite loops, stuttering, or repeated patterns during inference.

---

## 🛠️ Getting Started

### Prerequisites

*   **Node.js** v20+
*   **PostgreSQL** database instance
*   **Clerk** Account (for Authentication & Organizations)
*   **Cloudflare R2** Bucket (for Audio storage)

### 1. Clone the repository

```bash
git clone https://github.com/ayush-343/ResonaAI.git
cd resonaai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` (or `.env.local`) file in the root directory:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Cloudflare R2 Credentials (Optional / for ML Storage)
CLOUDFLARE_R2_BUCKET=your_bucket_name
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
```

### 4. Database Setup & Prisma Generation

Generate the type-safe Prisma client and apply database schemas:

```bash
# Generate the custom output client inside src/generated/prisma
npx prisma generate

# Deploy schema to database
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤝 Contributing to ResonaAI

We welcome contributions from the open-source community! To contribute:

1.  **Fork** the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a **Pull Request**.

### Code Style Guidelines
*   Keep files structured in their corresponding domain folder under `src/features/`.
*   Validate all forms and server requests using **Zod schemas**.
*   Verify your code builds locally before pushing: `npm run build`.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

