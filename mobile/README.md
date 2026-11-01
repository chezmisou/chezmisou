# Chez Misou — app mobile (iPhone & Android)

App [Expo](https://expo.dev) (React Native). Elle utilise les mêmes données que le site : tout passe par les API de chezmisou.com, il n'y a pas de deuxième base.

## Ce que fait l'app

**Côté client**
- Accueil avec le prochain menu du dimanche.
- **LAC** :
  - choix des plats, avec les quantités restantes ;
  - retrait dans une église ou livraison en Île-de-France, avec un prix calculé selon la distance depuis Chelles ;
  - paiement en espèces ou par carte.
- **Épicerie** : catalogue, fiche produit, panier, code promo, paiement par carte (Stripe).
- **Traiteur** : plats et demande de devis.
- **Compte** : connexion ou inscription par email, et suivi de ses commandes.

**Côté admin**, visible uniquement pour les emails de `ADMIN_EMAILS` :
- tableau de bord : commandes à traiter, chiffre du mois, prochain LAC ;
- commandes : recherche, filtres, détail, changement de statut (le client reçoit un email), appel, SMS et itinéraire en un geste ;
- menus LAC : création et modification avec photos des plats, publication, liste de préparation (portions par plat, commandes par église, livraisons de la plus proche à la plus éloignée) ;
- devis traiteur : statut et notes ;
- paramètres : églises, grille de livraison, frais de port, ouverture du traiteur, contact.

Les produits, les codes promo et les plats traiteur se gèrent toujours sur le site.

## Lancer l'app sur ton téléphone

Plutôt que de retélécharger le dossier à chaque fois, clone-le une fois (`git clone https://github.com/chezmisou/chezmisou`) puis récupère les nouveautés avec `git pull` : `node_modules` est conservé, et seul `npm install` est à relancer si les dépendances changent.

Prérequis :
- Node.js 22.13 ou plus récent (ou 24.3+) ;
- l'app **Expo Go** à jour sur ton téléphone. Expo Go ne fait tourner qu'**une seule version d'Expo** à la fois (actuellement le SDK 58), et le projet est réglé dessus.

Vérifie d'abord `node -v` : si c'est en dessous de 22.13, installe la version LTS depuis [nodejs.org](https://nodejs.org) (ou `winget install OpenJS.NodeJS.LTS` sur Windows), puis **ferme et rouvre** le terminal.

```bash
cd mobile
npm install                      # installe Expo SDK 58 et les bonnes versions
npx expo start
```

Après un essai raté, repars propre en supprimant `node_modules` et `package-lock.json` avant `npm install`.

Scanne le QR code affiché avec l'appareil photo (iPhone) ou avec Expo Go (Android).

Quand Expo Go passera à une version plus récente : `npm install expo@^59.0.0` (nouveau numéro), puis `npx expo install --fix`.

### Fichier `.env` (déjà inclus)

Le fichier `mobile/.env` est dans le dépôt : il n'y a rien à copier. Il ne contient que des valeurs publiques (adresse du site, clé publique Supabase). **N'y mets jamais de clé secrète** (`service_role`, `sk_…`) : le dépôt est public.

Si l'URL Supabase n'y est pas, l'app la récupère toute seule auprès du site (`/api/mobile/config`).

### Connexion avec Google

L'app utilise la connexion Google déjà active sur le site (Supabase). Une seule chose à régler, une fois : dans Supabase › **Authentication › URL Configuration › Redirect URLs**, ajoute ces deux adresses, puis enregistre :

- `chezmisou://**` (l'app publiée)
- `exp://**` (l'app dans Expo Go, pendant les tests)

Sans ça, Google renvoie vers le site au lieu de revenir dans l'app.

## Publier sur l'App Store et Google Play

1. Crée un compte sur [expo.dev](https://expo.dev), puis lance `npm install -g eas-cli` et `eas login`.
2. Lance `eas build:configure`, puis `eas build --platform all`. Expo construit l'app dans le cloud, sans Mac.
3. Lance `eas submit --platform ios` et `eas submit --platform android`.

Pour publier, il te faut :
- un compte Apple Developer (99 $/an) ;
- un compte Google Play Console (25 $, une seule fois).

Les identifiants de l'app sont `com.chezmisou.app` (iOS et Android), dans `app.json`.

## Bon à savoir

- **Paiement par carte** : il s'ouvre dans une page sécurisée Stripe, puis l'app vérifie elle-même que la commande est bien créée.
- **Admin** : les API admin acceptent maintenant le jeton de connexion de l'app (`Authorization: Bearer …`), en plus du cookie du site.
- **Mise à jour du site** : le site doit être déployé avec les nouvelles API (`/api/mobile/*`) pour que l'app fonctionne.
