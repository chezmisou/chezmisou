import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
