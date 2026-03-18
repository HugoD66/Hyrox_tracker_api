# Hyrox Tracker

Application de suivi des performances Hyrox avec Angular et NestJS (développement local uniquement).

## Lancer le projet

```bash
docker compose up -d
```

- Frontend : `http://localhost:4200`
- API : `http://localhost:3000`
- Swagger : `http://localhost:3000/api/docs`

## Qualité backend

- Hooks Husky : `pre-commit` (lint-staged), `pre-push` (lint, typecheck, test)
- Commandes :
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

## Metrics backend

- Endpoint Prometheus : `GET http://localhost:3000/api/metrics`
- UI Prometheus : `http://localhost:9090`

