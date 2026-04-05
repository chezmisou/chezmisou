# Chez Misou · Manje Lakay

Plateforme e-commerce de produits haïtiens pour la diaspora en France. Épicerie fine, service traiteur et LAC (Lunch After Church).

## Stack

- **Framework** : Next.js 15 (App Router, TypeScript strict)
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **Base de données** : PostgreSQL (Supabase) via Prisma ORM
- **Auth** : Supabase Auth (@supabase/ssr)
- **Emails** : Resend
- **Icônes** : Lucide React
- **Package manager** : pnpm

## Démarrage local

```bash
# 1. Cloner le repo
git clone <repo-url> && cd chezmisou

# 2. Copier et remplir les variables d'environnement
cp .env.example .env.local
# Remplir toutes les valeurs dans .env.local

# 3. Installer les dépendances
pnpm install

# 4. Générer le client Prisma
pnpm db:generate

# 5. Pousser le schéma vers la base de données
pnpm db:push

# 6. Lancer le seed
pnpm db:seed

# 7. Lancer le serveur de développement
pnpm dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production (inclut `prisma generate`) |
| `pnpm start` | Serveur de production |
| `pnpm lint` | Linter ESLint |
| `pnpm db:generate` | Générer le client Prisma |
| `pnpm db:migrate` | Lancer les migrations Prisma |
| `pnpm db:push` | Pousser le schéma sans migration |
| `pnpm db:seed` | Seed de la base de données |
| `pnpm db:studio` | Interface Prisma Studio |

## Variables d'environnement obligatoires (Vercel)

Avant le déploiement, configurer ces variables dans Vercel :

- `DATABASE_URL` — Connection string Supabase (transaction pooler, port 6543)
- `DIRECT_URL` — Connection string Supabase (directe, port 5432)
- `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clé publique Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — Clé service Supabase (⚠️ secret)
- `RESEND_API_KEY` — Clé API Resend
- `RESEND_FROM_EMAIL` — Adresse email d'expédition
- `NEXT_PUBLIC_APP_URL` — URL publique de l'application

## Spécifications

📄 [Document de spécifications Notion](#) *(lien à remplir)*

## Structure du projet

```
src/
  app/
    (public)/       # Pages publiques
    (admin)/        # Pages admin (Lot 3)
    api/            # Routes API
  components/
    ui/             # shadcn/ui
    public/         # Composants publics
    admin/          # Composants admin
  lib/              # Utilitaires et clients
  types/            # Types TypeScript
prisma/
  schema.prisma     # Schéma de base de données
  seed.ts           # Données initiales
```
