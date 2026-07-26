import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/encuesta — devuelve las preguntas activas con sus opciones
export async function GET() {
  const preguntas = await prisma.preguntaEncuesta.findMany({
    where:   { activa: true },
    orderBy: { orden: 'asc' },
    include: { opciones: true },
  });

  return NextResponse.json(preguntas);
}
