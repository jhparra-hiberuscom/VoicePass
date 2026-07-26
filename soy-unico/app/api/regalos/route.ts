import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/regalos — lista regalos activos (con filtros opcionales)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat    = searchParams.get('cat');
  const q      = searchParams.get('q');
  const page   = Math.max(1, Number(searchParams.get('page')  ?? '1'));
  const limite = Math.min(50, Number(searchParams.get('limit') ?? '12'));
  const skip   = (page - 1) * limite;

  const where: Record<string, unknown> = { activo: true, stock: { gt: 0 } };

  if (cat) {
    where['keywords'] = { some: { keyword: { contains: cat, mode: 'insensitive' } } };
  }
  if (q) {
    where['OR'] = [
      { nombre:  { contains: q, mode: 'insensitive' } },
      { resumen: { contains: q, mode: 'insensitive' } },
      { keywords: { some: { keyword: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  const [total, regalos] = await Promise.all([
    prisma.regalo.count({ where }),
    prisma.regalo.findMany({
      where,
      skip,
      take: limite,
      orderBy: { creadoEn: 'desc' },
      include: {
        fotos:    { orderBy: { orden: 'asc' } },
        keywords: true,
      },
    }),
  ]);

  return NextResponse.json({ total, page, limite, regalos });
}
