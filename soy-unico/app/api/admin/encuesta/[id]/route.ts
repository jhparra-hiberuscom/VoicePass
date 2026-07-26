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
  texto:  z.string().min(5).optional(),
  orden:  z.number().int().min(1).optional(),
  activa: z.boolean().optional(),
  opciones: z.array(z.object({
    id:       z.string().optional(),
    texto:    z.string().min(1),
    keywords: z.array(z.string()),
  })).optional(),
});

// PUT /api/admin/encuesta/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { opciones, ...data } = parsed.data;

  const pregunta = await prisma.$transaction(async (tx) => {
    if (opciones !== undefined) {
      await tx.opcionPregunta.deleteMany({ where: { preguntaId: params.id } });
      await tx.opcionPregunta.createMany({
        data: opciones.map((o) => ({
          preguntaId: params.id,
          texto:      o.texto,
          keywords:   o.keywords,
        })),
      });
    }
    return tx.preguntaEncuesta.update({
      where: { id: params.id },
      data,
      include: { opciones: true },
    });
  });

  return NextResponse.json(pregunta);
}

// DELETE /api/admin/encuesta/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  await prisma.preguntaEncuesta.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
