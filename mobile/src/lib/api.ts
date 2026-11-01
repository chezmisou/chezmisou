import { getAccessToken } from "./supabase";
import { API_URL } from "./config";

export { API_URL };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Appelle une API du site. Le jeton de session est joint automatiquement,
 * ce qui ouvre les API admin et « mes commandes » à l'utilisateur connecté.
 */
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Pas de connexion. Vérifiez votre réseau et réessayez.", 0);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error || "Une erreur est survenue. Réessayez.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

/** Transforme une URL relative renvoyée par le site en URL complète. */
export function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

/** Envoie une photo (admin) et renvoie son URL publique. */
export async function uploadImage(path: string, uri: string, mimeType?: string | null): Promise<string> {
  const token = await getAccessToken();
  const name = uri.split("/").pop() || "photo.jpg";
  const form = new FormData();
  form.append("file", { uri, name, type: mimeType || "image/jpeg" } as unknown as Blob);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !json?.url) throw new ApiError(json?.error || "Erreur lors de l'envoi de la photo", res.status);
  return json.url;
}
