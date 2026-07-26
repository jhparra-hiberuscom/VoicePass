import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/regalos/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const regalo = await prisma.regalo.findUnique({
    where: { id: params.id },
    include: {
      fotos:    { orderBy: { orden: 'asc' } },
      keywords: true,
    },
  });

  if (!regalo || !regalo.activo) {
    return NextResponse.json({ error: 'Regalo no encontrado' }, { status: 404 });
  }

  return NextResponse.json(regalo);
}
