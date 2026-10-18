# DrawerLocal

![DrawerLocal hero](drawerlocal_hero.jpg)

**DrawerLocal** – a premium, privacy‑first receipt‑sorting side‑hustle built on open‑weight AI. Upload your receipts (JPG/PNG/PDF), let an **open‑weight vision model** (Gemma 3 via Ollama or a deterministic mock) extract structured data, review & correct low‑confidence fields, and export CSV or printable tax summaries.

---

## 📚 What I Built

- **FastAPI + SQLModel** backend with background extraction, vendor‑rule overrides, and real‑time status via Server‑Sent Events.
- **Next.js 15 (App Router) + Tailwind CSS** front‑end with a dark‑first glassmorphism design system, dashboard charts, animated counters, and a command‑palette.
- **Demo‑mode** (`DEMO_MODE=true`) – runs entirely on a mock provider, no GPU, no internet, zero cost.
- **Docker Compose** orchestration (`api`, `frontend`, `ollama`) – one command to spin up the whole stack.
- **Render deployment** – `render.yaml` ready for a one‑click deploy of both API and static site.
- **Open‑innovation narrative** – all AI components are open‑weight (Ollama, Gemma 3), keeping data on‑device and costs minimal.

---

## 🎬 Demo

[Live demo on Render]({{RENDER_LINK}}) (replace with your Render URL once deployed).

---

## 🚀 Getting Started

```bash
# clone the repo (we’ll create it shortly)
# cd into the project folder
cd "d:/Hacktoberfest/Week 2"

# Build and run everything
docker compose up --build
```

The API will be reachable at `http://localhost:8000/api/v1` and the UI at `http://localhost:3000`.

### Environment variables

Create a `.env` in `backend/` (copy from `.env.example`). The most important flag is `DEMO_MODE=true` for the zero‑cost experience.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend[Next.js UI]
        A[Landing] --> B[Upload]
        B --> C[Review / Edit]
        C --> D[Dashboard]
        D --> E[Export CSV / Tax Summary]
    end
    subgraph Backend[FastAPI]
        F[API Router]
        G[Background Extraction]
        H[SQLModel (SQLite)]
        I[Model Provider]
    end
    subgraph Model[Ollama / Mock]
        J[Gemma 3 (4B) or Mock]
    end
    A & B & C & D & E --> F
    F --> G
    G --> I
    I --> J
    G --> H
    H --> F
```

---

## 💡 Why Open Innovation Matters

- **Data never leaves the machine** – receipts stay on the user’s disk; the mock provider guarantees zero network traffic.
- **Cost‑free scaling** – the demo runs on a laptop without a GPU; switching to Ollama lets you run the same model locally for a fraction of cloud fees.
- **Vendor lock‑in avoidance** – swap the provider (Ollama ↔ OpenAI‑compatible ↔ Mock) by changing a single env var.
- **Community‑driven improvement** – the code is fully open‑source; anyone can fine‑tune the prompt, add new vendor rules, or replace the model.

---

## 📦 Deploy to Render (one‑click)

```yaml
services:
  - type: web
    name: drawerlocal-api
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DEMO_MODE
        value: "true"
  - type: static
    name: drawerlocal-frontend
    env: static
    buildCommand: npm install && npm run build
    publishPath: frontend/.next
```

Create the two services on Render, add the same env vars, and you’ll have a live instance.

---

## 🧪 Tests

```bash
cd backend && pytest -q      # backend unit tests (seed, export, vendor rules)
cd ../frontend && npx playwright test   # end‑to‑end UI smoke test
```

---

## 🙏 Credits & Partner Tech

- **Render** – free hosting for the API and static site.
- **Ollama** – runs the open‑weight Gemma 3 model locally.
- **Tailwind CSS** – design system with dark‑first glassmorphism.
- **FastAPI & SQLModel** – rapid backend prototyping.
- **DevRelay** – optional session publishing (not required for this repo).

---

## 📜 License

MIT © 2026 DrawerLocal contributors.
