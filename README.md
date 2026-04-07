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

**En cas d’erreur `ERR_CONNECTION_RESET` ou `Failed to load resource`** : le backend n’est probablement pas démarré ou redémarre en boucle. Vérifier que tous les services tournent :

```bash
docker-compose ps
docker-compose logs backend
```

Si `db-init` a échoué, le backend ne démarre pas. Relancer après correction :

```bash
docker-compose down
docker-compose up -d
```

Tester l’API : http://localhost:3000/api/health/liveness (doit répondre `{"status":"ok",...}`).

#### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Accéder à Prisma Studio (interface graphique pour la base de données)
docker exec -it hyrox-backend npx prisma studio
# Puis ouvrir http://localhost:5555
```

## Qualite de code (duplication)

Le projet utilise `jscpd` pour mesurer la duplication de code TypeScript.

- Commande locale: `npm run duplication`
- Commande CI: `npm run duplication:ci`
- Rapport généré dans `reports/duplication` (JSON + HTML)
- Le pipeline GitHub Actions exécute l'analyse sur chaque PR et push sur `main`
- **Important**: Le rapport est **informatif uniquement** et ne bloque jamais la CI (permet d'identifier des opportunités de refactoring)
- Artefact publie dans `Actions > duplication-report` pour faciliter la consultation

## Architecture

- **Frontend** : Angular (port 4200)
- **Backend** : NestJS (port 3000)
- **Database** : PostgreSQL 15 (port 5432)

## Tests

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```
