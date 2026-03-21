import { NextRequest, NextResponse } from 'next/server';
import { updateCommandeStatut } from '@/lib/lac-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const commande = updateCommandeStatut(params.id, body.statut);

  if (!commande) {
    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  }

  return NextResponse.json(commande);
}
