import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import { API_URL } from "./config";

/**
 * Stockage de la session dans le trousseau du téléphone.
 * SecureStore limite chaque valeur à ~2 Ko : la session est découpée en morceaux.
 */
const CHUNK = 1800;

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}__n`);
    if (!count) return SecureStore.getItemAsync(key);
    const parts: string[] = [];
    for (let i = 0; i < Number(count); i++) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    await this.removeItem(key);
    const n = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
    await SecureStore.setItemAsync(`${key}__n`, String(n));
  },
  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(`${key}__n`);
    if (count) {
      for (let i = 0; i < Number(count); i++) {
        await SecureStore.deleteItemAsync(`${key}__${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}__n`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

let clientPromise: Promise<SupabaseClient> | null = null;

async function loadConfig(): Promise<{ url: string; anonKey: string }> {
  // Un .env reste possible, mais n'est plus nécessaire : le site fournit la config.
  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };

  const cacheKey = "chezmisou.supabase-config";
  try {
    const res = await fetch(`${API_URL}/api/mobile/config`);
    const json = (await res.json()) as { supabaseUrl?: string; supabaseAnonKey?: string };
    if (json.supabaseUrl && json.supabaseAnonKey) {
      await SecureStore.setItemAsync(cacheKey, JSON.stringify(json)).catch(() => {});
      return { url: json.supabaseUrl, anonKey: json.supabaseAnonKey };
    }
  } catch {
    // hors connexion : on reprend la dernière config connue
  }
  const cached = await SecureStore.getItemAsync(cacheKey).catch(() => null);
  if (cached) {
    const json = JSON.parse(cached) as { supabaseUrl: string; supabaseAnonKey: string };
    return { url: json.supabaseUrl, anonKey: json.supabaseAnonKey };
  }
  throw new Error("Connexion au site impossible. Vérifiez votre réseau et réessayez.");
}

/** Client Supabase (connexion), créé une seule fois avec la config du site. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = loadConfig()
      .then(({ url, anonKey }) => {
        const client = createClient(url, anonKey, {
          auth: {
            storage: secureStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        });
        // Rafraîchit le jeton seulement quand l'app est au premier plan
        AppState.addEventListener("change", (state) => {
          if (state === "active") client.auth.startAutoRefresh();
          else client.auth.stopAutoRefresh();
        });
        return client;
      })
      .catch((err) => {
        clientPromise = null; // on réessaiera au prochain appel
        throw err;
      });
  }
  return clientPromise;
}

/** Jeton de session courant, ou null (non connecté / config indisponible). */
export async function getAccessToken(): Promise<string | null> {
  try {
    const client = await getSupabase();
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}
