import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface MenuData {
  menu: Record<string, { nom: string; description: string; prix: number }>;
  supplements: Record<string, { nom: string; prix: number }>;
  devise: string;
}

/**
 * GET /api/menu
 * Lit le menu LAC depuis la table lac_menu (Prisma)
 */
export async function GET() {
  try {
    const items = await prisma.lacMenu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const menu: Record<string, { nom: string; description: string; prix: number }> = {};
    const supplements: Record<string, { nom: string; prix: number }> = {};
    let devise = 'HTG';

    for (const item of items) {
      devise = item.devise;
      if (item.type === 'menu') {
        menu[item.key] = {
          nom: item.nom,
          description: item.description ?? '',
          prix: Number(item.prix),
        };
      } else if (item.type === 'supplement') {
        // Retirer le préfixe "supplement_" pour la clé côté client
        const clientKey = item.key.replace('supplement_', '');
        supplements[clientKey] = {
          nom: item.nom,
          prix: Number(item.prix),
        };
      }
    }

    const data: MenuData = { menu, supplements, devise };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lecture menu LAC:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture du menu' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/menu
 * Met à jour le menu LAC dans la table lac_menu
 * Requiert le header x-admin-password
 */
export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body: MenuData = await request.json();

    // Mettre à jour les items menu
    for (const [key, item] of Object.entries(body.menu)) {
      await prisma.lacMenu.upsert({
        where: { key },
        update: {
          nom: item.nom,
          description: item.description,
          prix: item.prix,
          devise: body.devise,
        },
        create: {
          key,
          type: 'menu',
          nom: item.nom,
          description: item.description,
          prix: item.prix,
          devise: body.devise,
          sortOrder: Object.keys(body.menu).indexOf(key) + 1,
        },
      });
    }

    // Mettre à jour les suppléments
    for (const [key, item] of Object.entries(body.supplements)) {
      const dbKey = `supplement_${key}`;
      await prisma.lacMenu.upsert({
        where: { key: dbKey },
        update: {
          nom: item.nom,
          prix: item.prix,
          devise: body.devise,
        },
        create: {
          key: dbKey,
          type: 'supplement',
          nom: item.nom,
          prix: item.prix,
          devise: body.devise,
          sortOrder: Object.keys(body.supplements).indexOf(key) + 1,
        },
      });
    }

    // Relire les données mises à jour
    const items = await prisma.lacMenu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const menu: Record<string, { nom: string; description: string; prix: number }> = {};
    const supplements: Record<string, { nom: string; prix: number }> = {};

    for (const dbItem of items) {
      if (dbItem.type === 'menu') {
        menu[dbItem.key] = {
          nom: dbItem.nom,
          description: dbItem.description ?? '',
          prix: Number(dbItem.prix),
        };
      } else if (dbItem.type === 'supplement') {
        const clientKey = dbItem.key.replace('supplement_', '');
        supplements[clientKey] = {
          nom: dbItem.nom,
          prix: Number(dbItem.prix),
        };
      }
    }

    return NextResponse.json({ menu, supplements, devise: body.devise });
  } catch (error) {
    console.error('Erreur mise à jour menu LAC:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du menu' },
      { status: 500 }
    );
  }
}
