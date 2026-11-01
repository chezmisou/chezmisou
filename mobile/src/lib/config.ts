import Constants from "expo-constants";

/**
 * Adresse du site Chez Misou : toutes les données de l'app passent par ses API.
 * Réglée dans app.json (expo.extra.apiUrl) ; EXPO_PUBLIC_API_URL dans un .env
 * permet de pointer ponctuellement vers un aperçu Vercel.
 */
const fromAppJson = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fromAppJson || "https://chezmisou.com").replace(
  /\/$/,
  ""
);
