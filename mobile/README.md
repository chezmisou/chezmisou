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

### Connexion avec Apple (iPhone)

L'App Store impose « Se connecter avec Apple » dès qu'une app propose Google. Dans Supabase › **Authentication › Sign In / Providers › Apple** : active Apple et mets dans **Client IDs** `com.chezmisou.app,host.exp.Exponent` (le second sert aux tests dans Expo Go). Pas besoin de clé secrète pour l'app.

## Publier sur l'App Store et Google Play

Comptes nécessaires : Apple Developer (99 $/an) et Google Play Console (25 $ une fois), plus un compte gratuit sur [expo.dev](https://expo.dev).

```bash
cd mobile
npm install -g eas-cli
eas login
eas init                                   # relie le projet à ton compte Expo (une fois)
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android --latest
eas submit --platform ios --latest
```

- Expo construit l'app dans le cloud (pas besoin de Mac) et gère les certificats Apple.
- Les numéros de version de build augmentent tout seuls (`eas.json`).
- Pour tester sur Android sans passer par le store : `eas build --platform android --profile preview` donne un fichier `.apk` à installer.

Textes des fiches, questionnaires de confidentialité et notes pour Apple : voir [`store/FICHES.md`](store/FICHES.md).

Déjà en place pour la validation :
- suppression du compte dans l'app (Compte › Supprimer mon compte) et sur https://chezmisou.com/suppression-compte ;
- connexion avec Apple sur iPhone ;
- déclaration de chiffrement (HTTPS seulement) ;
- aucune permission caméra ou micro, accès aux photos seulement pour l'admin.

## Bon à savoir

- **Paiement par carte** : il s'ouvre dans une page sécurisée Stripe, puis l'app vérifie elle-même que la commande est bien créée.
- **Admin** : les API admin acceptent maintenant le jeton de connexion de l'app (`Authorization: Bearer …`), en plus du cookie du site.
- **Mise à jour du site** : le site doit être déployé avec les nouvelles API (`/api/mobile/*`) pour que l'app fonctionne.
