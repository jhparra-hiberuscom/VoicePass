import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) throw new Error('UNAUTHORIZED');
}

const updateSchema = z.object({
  nombre:   z.string().min(2).optional(),
  resumen:  z.string().min(10).optional(),
  precio:   z.number().positive().optional(),
  alto:     z.number().positive().optional(),
  ancho:    z.number().positive().optional(),
  largo:    z.number().positive().optional(),
  peso:     z.number().positive().optional(),
  stock:    z.number().int().min(0).optional(),
  activo:   z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
  fotos:    z.array(z.object({ url: z.string().url(), orden: z.number() })).max(3).optional(),
});

// GET /api/admin/regalos/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const regalo = await prisma.regalo.findUnique({
    where: { id: params.id },
    include: { fotos: { orderBy: { orden: 'asc' } }, keywords: true },
  });

  if (!regalo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(regalo);
}

// PUT /api/admin/regalos/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { keywords, fotos, ...data } = parsed.data;

  const regalo = await prisma.$transaction(async (tx) => {
    if (keywords !== undefined) {
      await tx.keywordRegalo.deleteMany({ where: { regaloId: params.id } });
      await tx.keywordRegalo.createMany({
        data: keywords.map((k) => ({ regaloId: params.id, keyword: k })),
      });
    }
    if (fotos !== undefined) {
      await tx.fotoRegalo.deleteMany({ where: { regaloId: params.id } });
      await tx.fotoRegalo.createMany({
        data: fotos.map((f) => ({ regaloId: params.id, url: f.url, orden: f.orden })),
      });
    }
    return tx.regalo.update({
      where: { id: params.id },
      data,
      include: { fotos: { orderBy: { orden: 'asc' } }, keywords: true },
    });
  });

  return NextResponse.json(regalo);
}

// DELETE /api/admin/regalos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  await prisma.regalo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
