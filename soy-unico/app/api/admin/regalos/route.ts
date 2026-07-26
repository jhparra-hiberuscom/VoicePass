import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

function requireAdmin() {
  return getServerSession(authOptions).then((session) => {
    if (!session?.user?.esAdmin) throw new Error('UNAUTHORIZED');
  });
}

const regaloSchema = z.object({
  nombre:   z.string().min(2),
  resumen:  z.string().min(10),
  precio:   z.number().positive(),
  alto:     z.number().positive(),
  ancho:    z.number().positive(),
  largo:    z.number().positive(),
  peso:     z.number().positive(),
  stock:    z.number().int().min(0),
  activo:   z.boolean().default(true),
  keywords: z.array(z.string()),
  fotos:    z.array(z.object({ url: z.string().url(), orden: z.number() })).max(3),
});

// GET /api/admin/regalos
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const regalos = await prisma.regalo.findMany({
    orderBy: { creadoEn: 'desc' },
    include: { fotos: { orderBy: { orden: 'asc' } }, keywords: true },
  });

  return NextResponse.json(regalos);
}

// POST /api/admin/regalos
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = regaloSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { keywords, fotos, ...data } = parsed.data;

  const regalo = await prisma.regalo.create({
    data: {
      ...data,
      keywords: { create: keywords.map((k) => ({ keyword: k })) },
      fotos:    { create: fotos },
    },
    include: { fotos: true, keywords: true },
  });

  return NextResponse.json(regalo, { status: 201 });
}
