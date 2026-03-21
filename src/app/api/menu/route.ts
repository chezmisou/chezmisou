import { NextRequest, NextResponse } from 'next/server';
import { getMenu, updateMenu } from '@/lib/lac-data';

export async function GET() {
  const menu = getMenu();
  return NextResponse.json(menu);
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('x-admin-password');
  if (authHeader !== (process.env.ADMIN_PASSWORD || 'churchlunch2024')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const updated = updateMenu(body);
  return NextResponse.json(updated);
}
