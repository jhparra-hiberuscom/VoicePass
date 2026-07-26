import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { matchRegalos } from '@/lib/match';

// GET /api/match — calcula match con respuestas guardadas en sesión
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      respuestas: { preguntaOrden: number; opcionId: string }[];
      sessionId: string;
    };

    const { respuestas, sessionId } = body;

    if (!respuestas || respuestas.length === 0) {
      return NextResponse.json({ error: 'Se requieren respuestas' }, { status: 400 });
    }

    // Guardar respuestas si hay usuario autenticado
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      // Obtener pregunta id de cada opción
      const opciones = await prisma.opcionPregunta.findMany({
        where: { id: { in: respuestas.map((r) => r.opcionId) } },
        select: { id: true, preguntaId: true },
      });

      for (const op of opciones) {
        await prisma.respuestaEncuesta.create({
          data: {
            userId:    session.user.id,
            sessionId,
            preguntaId: op.preguntaId,
            opcionId:   op.id,
          },
        });
      }
    }

    const regalos = await matchRegalos(respuestas);
    return NextResponse.json({ regalos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
