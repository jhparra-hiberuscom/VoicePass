import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) throw new Error('UNAUTHORIZED');
}

const preguntaSchema = z.object({
  texto:  z.string().min(5),
  orden:  z.number().int().min(1),
  activa: z.boolean().default(true),
  opciones: z.array(z.object({
    id:       z.string().optional(),
    texto:    z.string().min(1),
    keywords: z.array(z.string()),
  })),
});

// GET /api/admin/encuesta — todas las preguntas (activas e inactivas)
export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const preguntas = await prisma.preguntaEncuesta.findMany({
    orderBy: { orden: 'asc' },
    include: { opciones: true },
  });

  return NextResponse.json(preguntas);
}

// POST /api/admin/encuesta — crear nueva pregunta
export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = preguntaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { opciones, ...data } = parsed.data;

  const pregunta = await prisma.preguntaEncuesta.create({
    data: {
      ...data,
      opciones: { create: opciones.map((o) => ({ texto: o.texto, keywords: o.keywords })) },
    },
    include: { opciones: true },
  });

  return NextResponse.json(pregunta, { status: 201 });
}
