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
- UI Grafana : `http://localhost:3001`
- Dashboard provisionné : `Hyrox / Hyrox Backend`
- Métriques exposées :
  - runtime Node.js/process via `prom-client`
  - trafic HTTP par méthode, route et code HTTP
  - latence HTTP avec histogramme Prometheus
  - requêtes HTTP en cours
  - statut et durée du check PostgreSQL
