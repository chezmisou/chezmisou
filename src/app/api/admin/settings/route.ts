import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { upsertSetting, isValidSettingKey } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  const entries = Object.entries(body) as [string, string][];

  for (const [key] of entries) {
    if (!isValidSettingKey(key)) {
      return NextResponse.json(
        { error: `Clé inconnue : ${key}` },
        { status: 400 }
      );
    }
  }

  for (const [key, value] of entries) {
    await upsertSetting(key, String(value));
  }

  return NextResponse.json({ ok: true });
}
