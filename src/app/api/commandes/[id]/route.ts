import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: body.statut === 'servie' ? 'DELIVERED' : 'PENDING' },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating commande:', error);
    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  }
}
