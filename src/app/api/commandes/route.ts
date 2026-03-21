import { NextRequest, NextResponse } from 'next/server';
import { getAllCommandes, createCommande } from '@/lib/lac-data';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const commandes = getAllCommandes();
  return NextResponse.json(commandes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.nom_client || !body.choix || !body.quantite) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const commande = createCommande({
    nom_client: body.nom_client,
    telephone: body.telephone || '',
    choix: body.choix,
    supplements: body.supplements || [],
    quantite: body.quantite,
    total: body.total || 0,
  });

  return NextResponse.json(commande, { status: 201 });
}
