# 11 – Deployment & CI/CD
> **Version 1.0 — 2025-06-20**  
> _Author: Lovable-iPadOS Core Team_

---

## 🎯 Purpose
Deliver code from keyboard → 🚗 dashboard **fast, safely, and on repeat**. This doc is the single source-of-truth for every build, test, release, and rollback step.

---

## 🗺️ Environment Matrix
| Stage | URL / Host | Git Branch | Container Tag | Notes |
|-------|------------|-----------|---------------|-------|
| **Local** | `localhost:*` | feature/* | `:<sha>-local` | Vite + Docker Compose hot reload |
| **Dev** | `dev.ipados-clone.lovable.run` | `develop` | `:<sha>-dev` | Auto-deploy each push |
| **Staging** | `staging.ipados-clone.lovable.run` | `release/*` | `:<sha>-stg` | Canary toggles on |
| **Prod** | `app.ipados-clone.com` | `main` | `vX.Y.Z` | Blue-green rollout 5 % ➜ 100 % |

---

## 🔄 CI Pipeline (GitHub Actions)
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint && pnpm typecheck
      - run: pnpm test -- --coverage
      - run: pnpm build:ci
      - uses: snyk/actions/node@v3
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
      - name: Upload artefact
        uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

---

## 🚁 CD Workflow (Lovable Runner)
| Step | Tool | Description |
|------|------|-------------|
| **Build Image** | `docker build` | Multi-stage → `ipados-clone:<sha>` |
| **Push** | GHCR | Tag with branch + semver |
| **Deploy** | Lovable Rollout | Blue-green on k3s cluster |
| **Smoke** | Playwright | Core-flow e2e |
| **Notify** | Slack + GitHub | success / rollback alert |

> 🔄 **Automatic rollback** if smoke tests fail or p95 latency > 300 ms.

---

## 🛂 Secrets & Credentials
All secrets live in **GitHub Encrypted Secrets** and mirror to Lovable Secret Manager:
- `TESLA_API_KEY`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `SENTRY_DSN`

Rotation every 90 days per §08 (Security & Privacy).

---

## 📊 Observability
| Layer | Tool | Threshold |
|-------|------|-----------|
| Web Vitals | Vercel Analytics | LCP ≤ 2 s |
| API | Prometheus | p95 < 300 ms |
| Errors | Sentry | ≤ 0.5 % error rate |
| Uptime | UptimeRobot | 99.9 % |

---

## 🌳 Branching & Release Strategy
```mermaid
gitGraph
   commit id:"main" tag:"v1.0.0";
   branch develop
   commit id:"feature/x";
   commit;
   merge develop --> main
   tag "v1.1.0";
   branch release/1.2.0
   commit;
   merge release/1.2.0 --> main
   tag "v1.2.0";
```
- **feature/** ➜ short-lived PRs into `develop`.
- **develop** ➜ deploys Dev.
- **release/** ➜ stabilise ➜ Staging.
- **main** ➜ protected, tags, deploys Prod.

---

## 📦 Artefact Storage
- **GHCR** → Docker images
- **Cloudflare R2** → static build & manifest

---

## 📝 Open Tasks
- [ ] CUDA cache layer for faster GPU builds.
- [ ] Integrate Lighthouse-CI on PRs.
- [ ] Add cost-cap alerting for Cloudflare egress.

---

## 🔗 Related Docs
- **08_SECURITY_AND_PRIVACY.md** – secret rotation, threat model
- **09_ANALYTICS_AND_PERFORMANCE.md** – telemetry budgets
- **A_ROADMAP.md** – upcoming milestones

> _“If it ain’t automated, it ain’t repeatable.”_
