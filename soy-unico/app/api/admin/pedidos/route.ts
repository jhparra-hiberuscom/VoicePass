import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) throw new Error('UNAUTHORIZED');
}

// GET /api/admin/pedidos
export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');
  const page   = Math.max(1, Number(searchParams.get('page')  ?? '1'));
  const limite = Math.min(100, Number(searchParams.get('limit') ?? '20'));

  const where: Record<string, unknown> = {};
  if (estado) where['estado'] = estado;

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({
      where,
      skip:    (page - 1) * limite,
      take:    limite,
      orderBy: { creadoEn: 'desc' },
      include: {
        user:     { select: { nombre: true, email: true, telefono: true } },
        regalo:   { select: { nombre: true } },
        direccion: true,
      },
    }),
  ]);

  return NextResponse.json({ total, page, limite, pedidos });
}

// PATCH /api/admin/pedidos — actualizar estado de un pedido
export async function PATCH(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id, estado, numeroSeguimiento } = await req.json() as {
    id: string;
    estado: string;
    numeroSeguimiento?: string;
  };

  if (!id || !estado) {
    return NextResponse.json({ error: 'id y estado son requeridos' }, { status: 400 });
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data:  { estado: estado as never, numeroSeguimiento },
  });

  return NextResponse.json(pedido);
}
