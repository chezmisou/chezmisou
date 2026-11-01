import { NextResponse } from "next/server";

/**
 * Configuration publique de l'app mobile : les mêmes valeurs que le site
 * envoie déjà au navigateur (aucun secret). Évite un fichier .env côté app.
 */
export async function GET() {
  return NextResponse.json(
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
