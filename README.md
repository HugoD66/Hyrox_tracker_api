# Hyrox Tracker

Application de suivi des performances Hyrox avec Angular et NestJS (développement local uniquement).

## Prérequis

- Docker et Docker Compose
- Node.js 20+
- PostgreSQL 15+

## Installation

### Développement local

1. Installer les dépendances du backend (nécessaire pour que le conteneur trouve `bcryptjs` et les autres modules) :

```bash
cd backend && npm install && cd ..
```

2. Lancer tous les services :

```bash
docker-compose up -d
```

3. Les migrations et le seed sont exécutés automatiquement au démarrage via le service `db-init`.

4. Accéder à l'application :

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **API Documentation (Swagger)** : http://localhost:3000/api/docs
- **Health check** : http://localhost:3000/api/health/liveness

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
