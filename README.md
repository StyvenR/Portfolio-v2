# Portfolio v2 — Styven Raya

Portfolio personnel développé avec **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** et **Prisma / PostgreSQL**.
Il contient un site public (présentation, projets, référentiel de compétences, formulaire de contact) et un **back-office d'administration** protégé par JWT pour gérer les projets, les compétences et les messages reçus.

Repo public : <https://github.com/StyvenR/Portfolio-v2>

---

## Sommaire

- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Scripts disponibles](#scripts-disponibles)
- [Pages disponibles](#pages-disponibles)
- [Routes API](#routes-api)
- [Authentification et rôles](#authentification-et-rôles)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)

---

## Stack technique

| Domaine           | Technologies                                                     |
| ----------------- | ---------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router), React 19, TypeScript 5                  |
| Style             | Tailwind CSS 4, `class-variance-authority`, `tailwind-merge`     |
| Animations / 3D   | Motion (Framer Motion), Three.js, postprocessing                 |
| UI                | Radix UI, lucide-react, `@dnd-kit` (drag & drop), TanStack Table |
| Base de données   | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)                     |
| Auth              | JWT (`jsonwebtoken`) + `bcryptjs`                                |
| Stockage fichiers | Vercel Blob (`@vercel/blob`)                                     |
| Hébergement       | Vercel                                                           |

---

## Prérequis

- **Node.js 20+** (Node 24 LTS recommandé)
- **pnpm** (gestionnaire utilisé par le projet — `pnpm-lock.yaml`)
- Une base **PostgreSQL** accessible (locale, Neon, Supabase, etc.)
- Un token **Vercel Blob** si vous voulez uploader des images de projets

```bash
npm install -g pnpm
```

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/StyvenR/Portfolio-v2.git
cd Portfolio-v2

# 2. Installer les dépendances
pnpm install

# 3. Créer le fichier d'environnement à partir du modèle (voir section suivante)
cp .env.example .env.local

# 4. Générer le client Prisma et appliquer les migrations
pnpm db:generate
pnpm db:migrate

# 5. (Optionnel) Alimenter la base avec les données initiales
pnpm db:seed

# 6. Lancer le serveur de développement
pnpm dev
```

Le site est alors disponible sur <http://localhost:3000> et l'admin sur <http://localhost:3000/admin>.

---

## Variables d'environnement

Les variables sont lues depuis `.env.local` **puis** `.env` (`.env.local` est prioritaire, aussi bien pour Next.js que pour le CLI Prisma via `prisma.config.ts`).

| Variable | Requis | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Chaîne de connexion PostgreSQL utilisée par l'application (pooled). |
| `DIRECT_URL` | ⬜ | Connexion directe (non poolée) utilisée par le CLI Prisma pour les migrations. |
| `JWT_SECRET` | ✅ | Secret de signature des tokens JWT de l'admin (validité 7 jours). |
| `NEXTAUTH_SECRET` | ⬜ | Utilisé en repli si `JWT_SECRET` est absent. |
| `NEXTAUTH_URL` | ⬜ | URL de base de l'application. |
| `NEXT_PUBLIC_SITE_URL` | ⬜ | URL publique du site (metadata, sitemap, Open Graph). Défaut : `http://localhost:3000`. |
| `ADMIN_EMAIL` | ⬜ | Email du compte admin créé par le seed. |
| `ADMIN_PASSWORD` | ⬜ | Mot de passe du compte admin créé par le seed. |
| `VISITOR_ADMIN_EMAIL` | ⬜ | Email du compte démo en lecture seule créé par le seed. |
| `VISITOR_ADMIN_PASSWORD` | ⬜ | Mot de passe du compte démo en lecture seule. |
| `BLOB_READ_WRITE_TOKEN` | ⬜ | Token Vercel Blob, nécessaire pour l'upload d'images de projets. |

Le fichier [.env.example](.env.example) sert de modèle documenté à copier.

Exemple minimal de `.env.local` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"
DIRECT_URL="postgresql://user:password@localhost:5432/portfolio"
JWT_SECRET="une-chaine-aleatoire-longue"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="motdepasse-solide"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx"
```

> ⚠️ Ne commitez jamais `.env` / `.env.local`.

---

## Base de données

Le schéma Prisma (`prisma/schema.prisma`) définit quatre modèles :

- **`User`** — comptes du back-office (`email`, `password` haché en bcrypt, `role`).
- **`Project`** — projets du portfolio (`title`, `description`, `image`, `tags[]`, `link`, `github`, `order`).
- **`ProjectCompetence`** — lien projet ↔ compétence du référentiel (`code`, `evidence`). Le référentiel lui-même (activités A1–A7, blocs C1/C2/C3) vit dans [utils/competences.ts](utils/competences.ts).
- **`ContactSubmission`** — messages envoyés depuis le formulaire de contact.

Le script de seed ([prisma/seed.ts](prisma/seed.ts)) crée l'utilisateur admin à partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD`, un compte démo en lecture seule à partir de `VISITOR_ADMIN_EMAIL` / `VISITOR_ADMIN_PASSWORD` s'ils sont renseignés, et importe les projets de secours définis dans [utils/my_project.ts](utils/my_project.ts) si la table `Project` est vide.

---

## Scripts disponibles

| Script              | Description                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm dev`          | Démarre le serveur de développement Next.js.                                                    |
| `pnpm build`        | Génère le client Prisma puis build l'application.                                               |
| `pnpm build:vercel` | Génère le client, applique les migrations (`migrate deploy`) puis build — utilisé en CI/Vercel. |
| `pnpm start`        | Démarre le serveur de production (après un build).                                              |
| `pnpm lint`         | Lance ESLint.                                                                                   |
| `pnpm db:generate`  | Génère le client Prisma.                                                                        |
| `pnpm db:push`      | Synchronise le schéma avec la base sans créer de migration.                                     |
| `pnpm db:migrate`   | Crée et applique une migration en développement.                                                |
| `pnpm db:seed`      | Exécute le script de seed.                                                                      |
| `pnpm db:studio`    | Ouvre Prisma Studio.                                                                            |

---

## Pages disponibles

### Site public

| Route | Description                                                   |
| ----- | ------------------------------------------------------------- |
| `/`   | Page d'accueil, en une seule page avec navigation par ancres. |

Sections de la page d'accueil (accessibles via les ancres) :

| Ancre          | Contenu                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| `#hero`        | Bannière d'accueil avec fond animé (Three.js).                                    |
| `#projets`     | Liste des projets, chargée depuis l'API.                                          |
| —              | Bandeau défilant des technologies et outils.                                      |
| `#competences` | Référentiel de compétences (blocs C1/C2/C3, activités A1–A7) et projets associés. |
| `#a-propos`    | Section « À propos » (parcours, présentation).                                    |
| `#contact`     | Formulaire de contact (envoie vers `POST /api/contact`).                          |

Fichiers de métadonnées générés automatiquement : `/sitemap.xml` ([app/sitemap.ts](app/sitemap.ts)), `/robots.txt` ([app/robots.ts](app/robots.ts)) et `/manifest.webmanifest` ([app/manifest.ts](app/manifest.ts)).

### Back-office `/admin`

Toutes les pages sous `/admin` (sauf `/admin/login`) sont protégées : le layout vérifie le token stocké dans `localStorage` via `GET /api/auth/verify` et redirige vers la page de connexion sinon.

| Route                | Description                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/admin/login`       | Formulaire de connexion (email + mot de passe).                                                             |
| `/admin`             | Tableau de bord : liste paginée et recherchable des messages de contact reçus.                              |
| `/admin/projects`    | Gestion des projets : création, édition, suppression, upload d'image et réordonnancement par drag & drop.   |
| `/admin/competences` | Matrice projets × compétences : associe chaque projet aux compétences du référentiel et saisit les preuves. |

---

## Routes API

### Publiques

| Méthode | Route           | Description                                                                                                                            |
| ------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/api/projects` | Retourne tous les projets triés par `order`, avec leurs compétences associées.                                                         |
| `POST`  | `/api/contact`  | Enregistre un message de contact. Corps : `{ name, email, message }`. Réponses : `201` créé, `400` champs manquants ou email invalide. |

### Authentification

| Méthode | Route              | Description                                                                                                                |
| ------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `POST`  | `/api/auth/login`  | Corps : `{ email, password }`. Retourne un JWT (valide 7 jours) et les infos utilisateur. `401` si identifiants invalides. |
| `GET`   | `/api/auth/verify` | Vérifie le token passé en `Authorization: Bearer <token>` et retourne l'utilisateur.                                       |

### Administration (token requis)

Toutes ces routes attendent l'en-tête `Authorization: Bearer <token>`.

| Méthode  | Route                         | Description                                                                                                                  |
| -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/admin/projects`         | Liste les projets avec leurs compétences.                                                                                    |
| `POST`   | `/api/admin/projects`         | Crée un projet. Corps : `{ title, description, image?, tags?, link?, github?, competences? }`.                               |
| `PATCH`  | `/api/admin/projects/[id]`    | Met à jour partiellement un projet (tous les champs sont optionnels).                                                        |
| `DELETE` | `/api/admin/projects/[id]`    | Supprime un projet et ses compétences liées.                                                                                 |
| `PATCH`  | `/api/admin/projects/reorder` | Réordonne les projets. Corps : `{ ids: string[] }` dans le nouvel ordre.                                                     |
| `POST`   | `/api/admin/projects/upload`  | Upload une image vers Vercel Blob. `multipart/form-data` avec le champ `file` (jpeg/png/webp, 4 Mo max). Retourne `{ url }`. |
| `GET`    | `/api/admin/submissions`      | Liste paginée des messages. Paramètres : `page` (défaut `1`), `limit` (défaut `10`), `search`.                               |
| `DELETE` | `/api/admin/submissions`      | Supprime un ou plusieurs messages. Corps : `{ ids: string[] }`.                                                              |

Codes d'erreur usuels : `401` token absent ou invalide, `403` rôle en lecture seule, `400` données invalides, `500` erreur serveur.

---

## Authentification et rôles

L'authentification repose sur un JWT signé avec `JWT_SECRET` (ou `NEXTAUTH_SECRET` en repli), valide **7 jours**, stocké côté client dans `localStorage` sous la clé `auth_token`.

Deux rôles sont définis dans [lib/roles.ts](lib/roles.ts) :

| Rôle            | Accès                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `admin`         | Accès complet en lecture et écriture.                                                                                               |
| `visitor_admin` | Accès au back-office en **lecture seule** — toute route d'écriture répond `403`, et l'interface affiche un badge « lecture seule ». |

La garde `requireWriteAccess()` ([lib/auth.ts](lib/auth.ts)) protège l'ensemble des routes de modification.

---

## Structure du projet

```
app/
├── page.tsx                 # Page d'accueil (métadonnées + HomeClient)
├── layout.tsx               # Layout racine, SEO, Open Graph
├── sitemap.ts               # /sitemap.xml
├── robots.ts                # /robots.txt
├── manifest.ts              # /manifest.webmanifest
├── components/              # Sections du site public
│   ├── HomeClient.tsx       # Assemble hero, projets, technos, compétences, about, contact
│   ├── HeroBackground.tsx   # Fond animé Three.js
│   ├── Projet.tsx / Competences.tsx / About.tsx / Contact.tsx
│   ├── projects-admin/      # Formulaire et liste triable des projets (admin)
│   └── submissions-data-table/
├── admin/                   # Back-office
│   ├── layout.tsx           # Garde d'authentification
│   ├── admin-auth-context.tsx
│   ├── login/ projects/ competences/
└── api/                     # Route handlers
components/                  # Composants UI réutilisables
hooks/                       # Hooks (scroll snap, viewport, navigation de sections…)
lib/                         # prisma, jwt, auth, roles, site, utils
prisma/                      # schema.prisma, migrations, seed.ts
utils/                       # Référentiel de compétences, projets de secours
```

---

## Déploiement

Le projet est prévu pour **Vercel** :

1. Importer le dépôt sur Vercel.
2. Définir la commande de build sur `pnpm build:vercel` (elle génère le client Prisma et applique les migrations avant le build).
3. Renseigner les variables d'environnement listées plus haut dans les paramètres du projet.
4. Créer un store **Vercel Blob** et récupérer `BLOB_READ_WRITE_TOKEN` pour activer l'upload d'images.

Pour un build local de production :

```bash
pnpm build
pnpm start
```

---

## Licence

Projet personnel — tous droits réservés.
