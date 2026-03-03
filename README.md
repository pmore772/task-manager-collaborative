# Task Manager Collaborative

Un système de gestion de tâches collaboratif avec Laravel 12 (Backend API) et Angular 20+ (Frontend).

## 🚀 Fonctionnalités

- **Authentification JWT** : Inscription, connexion, déconnexion avec tokens JWT
- **Gestion de projets** : CRUD complet avec couleurs personnalisées
- **Gestion de tâches** : 
  - Création, modification, suppression
  - Statuts : À faire, En cours, Terminé
  - Priorités : Basse, Moyenne, Haute
  - Assignation à plusieurs utilisateurs
  - Date d'échéance
- **Tableau de bord** : Statistiques et tâches récentes
- **Filtrage** : Par statut et priorité

## 📋 Prérequis

- PHP 8.2+
- Composer
- Node.js 20+
- npm
- MySQL 8.0 ou PostgreSQL
- Docker & Docker Compose (optionnel)

## 🛠️ Installation

### Avec Docker (Recommandé)

```bash
# Cloner le dépôt
git clone <repository-url>
cd task-manager-collaborative

# Lancer tous les services
docker-compose up -d

# L'application sera disponible sur :
# - Frontend : http://localhost:4200
# - Backend API : http://localhost:8000
# - phpMyAdmin : http://localhost:8080
```

### Installation Manuelle

#### Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=task_manager
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Générer la clé d'application
php artisan key:generate

# Générer le secret JWT
php artisan jwt:secret

# Exécuter les migrations
php artisan migrate

# (Optionnel) Remplir avec des données de démonstration
php artisan db:seed

# Démarrer le serveur
php artisan serve
```

#### Frontend (Angular)

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

## 🌐 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| GET | `/api/auth/me` | Profil utilisateur |

### Projets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects` | Liste des projets |
| POST | `/api/projects` | Créer un projet |
| GET | `/api/projects/{id}` | Détails d'un projet |
| PUT | `/api/projects/{id}` | Modifier un projet |
| DELETE | `/api/projects/{id}` | Supprimer un projet |

### Tâches
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks` | Liste des tâches (filtrable) |
| POST | `/api/tasks` | Créer une tâche |
| GET | `/api/tasks/{id}` | Détails d'une tâche |
| PUT | `/api/tasks/{id}` | Modifier une tâche |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche |
| PATCH | `/api/tasks/{id}/status` | Changer le statut |
| POST | `/api/tasks/{id}/assign` | Assigner des utilisateurs |

### Dashboard & Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard/stats` | Statistiques |
| GET | `/api/dashboard/recent-tasks` | Tâches récentes |
| GET | `/api/users` | Liste des utilisateurs |

## 🧪 Tests

```bash
cd backend

# Exécuter les tests
php artisan test

# Avec couverture de code
php artisan test --coverage
```

## 📁 Structure du Projet

```
task-manager-collaborative/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Enums/             # TaskStatus, TaskPriority
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Middleware/    # JWT, ForceJson
│   │   │   ├── Requests/      # Form Requests (validation)
│   │   │   └── Resources/     # API Resources
│   │   ├── Models/            # User, Project, Task
│   │   └── Policies/          # Authorization
│   ├── config/
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── tests/
├── frontend/                   # Angular 20+
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── guards/
│           │   ├── interceptors/
│           │   ├── models/
│           │   └── services/
│           ├── features/
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── projects/
│           │   └── tasks/
│           └── shared/
│               └── components/
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Variables d'environnement Backend (.env)

```env
APP_NAME="Task Manager"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=
JWT_TTL=60
```

### Variables d'environnement Frontend

Modifier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## 🎨 Technologies Utilisées

### Backend
- Laravel 12
- PHP 8.2+
- JWT Authentication (php-open-source-saver/jwt-auth)
- MySQL / PostgreSQL

### Frontend
- Angular 20+
- Standalone Components
- Signals (reactive state)
- RxJS
- SCSS

## 📝 Auteur

Projet créé pour démonstration d'une application full-stack moderne.

## 📄 Licence

MIT License
