import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAllSettings, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Tous les paramètres (valeurs par défaut incluses). L'enregistrement passe par POST /api/admin/settings. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const saved = await getAllSettings();
  const settings: Record<string, string> = {};
  for (const s of Object.values(SETTING_KEYS)) {
    settings[s.key] = saved[s.key] ?? String(s.default);
  }
  return NextResponse.json({ settings });
}
