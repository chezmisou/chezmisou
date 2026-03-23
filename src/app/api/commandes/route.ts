import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const commandes = await prisma.order.findMany({
      where: { type: 'LUNCH_AFTER_CHURCH' },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json(commandes);
  } catch (error) {
    console.error('Error fetching commandes:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.nom_client || !body.choix || !body.quantite) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        guestName: body.nom_client,
        guestPhone: body.telephone || '',
        type: 'LUNCH_AFTER_CHURCH',
        status: 'PENDING',
        deliveryMethod: 'PICKUP',
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        subtotal: body.total || 0,
        total: body.total || 0,
        notes: JSON.stringify({
          choix: body.choix,
          supplements: body.supplements || [],
          quantite: body.quantite,
        }),
      },
    });

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating commande:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
