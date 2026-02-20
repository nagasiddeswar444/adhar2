# Aadhaar Advance — Frontend (Vite + React + TypeScript)

Short guide to the repository: code layout, features, and how to run the app locally.

**Overview**
- **What:** A demo frontend for an Aadhaar update scheduling and analytics platform. It includes an AI-assisted slot assignment flow, fraud analytics, user profile and tracking, and both in-person and online update flows.
- **Important:** All data in this repository is synthetic/anonymized (see `src/data/mockData.ts`). No real Aadhaar PII or biometrics are stored.

**Key Features**
- **Slot booking flow:** multi-step booking with biometric face-scan verification, AI auto-assignment for biometric updates, and optional online submission for eligible update types (`src/pages/BookSlot.tsx`).
- **Dashboard & Forecasting:** demand forecast, center load, hourly load and risk breakdown charts (`src/pages/Dashboard.tsx`, `src/components/dashboard/*`).
- **Fraud & Security Analytics:** risk-based classification, detection metrics and security architecture UI (`src/pages/FraudAnalytics.tsx`).
- **User Profile & Appointments:** profile view, appointment list, auto-book alerts and appointment history (`src/pages/Profile.tsx`).
- **Tracking & Live Queue:** appointment search, update history, document statuses and simulated live queue visualization (`src/pages/Tracking.tsx`).

**Tech stack**
- Frontend: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS (+ tailwind-animate, tailwind-typography)
- State/query: `@tanstack/react-query`
- Routing: `react-router-dom`
- Charts: `recharts`
- UI primitives: Radix + custom `src/components/ui/*`
- Optional backend/client: `@supabase/supabase-js` (placeholder in `src/supabase.js`)

**Quick start**
Prerequisites: Node.js (>=18 recommended) and npm/yarn/pnpm.

Install dependencies:
```bash
npm install
# or yarn
# yarn
```

Run dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run tests:
```bash
npm run test
```

**Project layout (important files)**
- `src/main.tsx` — app entry
- `src/App.tsx` — routes and providers (React Query, UserContext, tooltip/toaster)
- `src/pages/` — main views: `Index`, `Dashboard`, `BookSlot`, `FraudAnalytics`, `Tracking`, `Profile`
- `src/components/booking/` — booking flow building blocks (SlotPicker, CenterPicker, FaceScanVerification, OnlineUpdateFlow, BookingConfirmation)
- `src/components/dashboard/` — charts and load cards used in dashboard
- `src/components/home/` — landing page sections used on `/`
- `src/components/ui/` — shared UI primitives (button, card, toast, tabs, etc.)
- `src/data/mockData.ts` — synthetic data used across the app (centers, slots, updateTypes, forecasts, stats)
- `src/contexts/UserContext.tsx` — simple user/provider abstraction used across pages
- `src/supabase.js` — Supabase client scaffold (replace with real values to enable backend integration)

**Notes for developers**
- The booking flow demonstrates a couple of advanced UX concepts:
  - Face-scan verification gating: `BookSlot` triggers `FaceScanVerification` before advancing.
  - AI auto-assignment: biometric update types are auto-assigned the best available slot (see `autoAssignSlot()` in `src/pages/BookSlot.tsx`).
  - Online-capable updates can be submitted with `OnlineUpdateFlow`.
- Security & compliance UI is demonstrative — read `src/pages/FraudAnalytics.tsx` for claims; the repository uses synthetic data only.
- To enable a real Supabase backend, update `src/supabase.js` with your `supabaseUrl` and `supabaseKey`.

**Where to look first when exploring the code**
1. `src/App.tsx` — see routers and providers to understand app wiring.
2. `src/pages/BookSlot.tsx` — main booking logic and UX patterns.
3. `src/data/mockData.ts` — the synthetic dataset referenced throughout the UI.
4. `src/components/ui/` — custom UI primitives you'll reuse for changes.

If you want, I can:
- run the dev server and verify it starts in this environment;
- wire a real Supabase project by updating `src/supabase.js` and a simple auth flow;
- or generate a brief dev-task checklist for implementing a backend endpoint.

---

Generated on 2026-02-18 by a workspace analysis tool.
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
