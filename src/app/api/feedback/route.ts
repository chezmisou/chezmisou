import { NextRequest, NextResponse } from "next/server";
import { resend, RESEND_FROM } from "@/lib/resend";

export const dynamic = "force-dynamic";

const MOODS: Record<string, string> = { bien: "😀 Content", bof: "😐 Mitigé", pas_bien: "🙁 Pas content" };

// Anti-abus simple : 5 retours max par adresse IP toutes les 10 minutes (par instance)
const hits = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * « Un retour ? » : avis libre envoyé par le site ou l'app, sans compte.
 * Le retour est envoyé par email aux administrateurs (ADMIN_EMAILS).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  // Champ piège invisible : rempli uniquement par les robots
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const mood = typeof body.mood === "string" && MOODS[body.mood] ? body.mood : null;
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : "";
  const source = body.source === "app" ? "app" : "site";
  const device = typeof body.device === "string" ? body.device.slice(0, 100) : "";

  if (message.length < 3) {
    return NextResponse.json({ error: "Écrivez quelques mots avant d'envoyer." }, { status: 400 });
  }
  if (message.length > 3000) {
    return NextResponse.json({ error: "Message trop long (3000 caractères max)." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "L'email n'est pas valide." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Merci ! Vous avez déjà envoyé plusieurs retours, réessayez un peu plus tard." }, { status: 429 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) {
    console.error("[feedback] ADMIN_EMAILS non configuré. Retour :", { message, email, mood, page, source });
    return NextResponse.json({ ok: true });
  }

  const rows = [
    ["Ressenti", mood ? MOODS[mood] : "—"],
    ["Depuis", source === "app" ? `Application${device ? ` (${device})` : ""}` : "Site web"],
    ["Page", page || "—"],
    ["Email", email || "Non renseigné (anonyme)"],
  ];

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: adminEmails,
      ...(email ? { replyTo: email } : {}),
      subject: `💬 Nouveau retour ${source === "app" ? "(app)" : "(site)"}${mood ? ` ${MOODS[mood].split(" ")[0]}` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;color:#3B2314">
          <h2 style="font-family:Georgia,serif;margin:0 0 12px">Un retour sur Chez Misou</h2>
          <p style="white-space:pre-wrap;background:#FFF8EE;border-radius:12px;padding:16px;font-size:15px;line-height:1.5">${escapeHtml(message)}</p>
          <table style="font-size:13px;color:#4A3728;margin-top:12px">
            ${rows.map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#9B8B7A">${k}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
          </table>
          ${email ? '<p style="font-size:13px;color:#9B8B7A">Répondez directement à cet email pour lui écrire.</p>' : ""}
        </div>`,
    });
  } catch (err) {
    console.error("[feedback] Envoi impossible:", err);
    return NextResponse.json({ error: "Envoi impossible pour le moment. Réessayez dans un instant." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
