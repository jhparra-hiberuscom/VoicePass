import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const pedidoSchema = z.object({
  regaloId:        z.string(),
  direccionId:     z.string().optional(),
  nuevaDireccion:  z.object({
    calle:        z.string().min(5),
    ciudad:       z.string().min(2),
    departamento: z.string().min(2),
    codPostal:    z.string().optional(),
    referencia:   z.string().optional(),
  }).optional(),
  fechaProgramada: z.string(), // ISO string
  franja:          z.enum(['mañana', 'tarde', 'noche']),
  cantidad:        z.number().int().min(1).default(1),
  notas:           z.string().optional(),
});

// POST /api/pedidos — crear un pedido
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = pedidoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { regaloId, direccionId, nuevaDireccion, fechaProgramada, franja, cantidad, notas } =
    parsed.data;

  // Verificar stock
  const regalo = await prisma.regalo.findUnique({ where: { id: regaloId } });
  if (!regalo || !regalo.activo) {
    return NextResponse.json({ error: 'Regalo no disponible' }, { status: 400 });
  }
  if (regalo.stock < cantidad) {
    return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });
  }

  // Dirección: usar existente o crear nueva
  let dirId = direccionId;
  if (!dirId && nuevaDireccion) {
    const dir = await prisma.direccion.create({
      data: { userId: session.user.id, ...nuevaDireccion },
    });
    dirId = dir.id;
  }
  if (!dirId) {
    return NextResponse.json({ error: 'Se requiere una dirección de envío' }, { status: 400 });
  }

  // Crear pedido y descontar stock en transacción (con validación atómica de stock)
  let pedido;
  try {
    pedido = await prisma.$transaction(async (tx) => {
      const regaloActual = await tx.regalo.findUnique({
        where:  { id: regaloId },
        select: { stock: true },
      });
      if (!regaloActual || regaloActual.stock < cantidad) {
        throw new Error('STOCK_INSUFICIENTE');
      }

      await tx.regalo.update({
        where: { id: regaloId },
        data:  { stock: { decrement: cantidad } },
      });

      return tx.pedido.create({
        data: {
          userId:          session.user.id,
          regaloId,
          direccionId:     dirId!,
          cantidad,
          precioUnitario:  regalo.precio,
          fechaProgramada: new Date(fechaProgramada),
          franja,
          notas,
        },
        include: {
          regalo:    { select: { nombre: true } },
          direccion: true,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'STOCK_INSUFICIENTE') {
      return NextResponse.json({ error: 'Stock insuficiente para completar el pedido' }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json(pedido, { status: 201 });
}

// GET /api/pedidos — pedidos del usuario autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const pedidos = await prisma.pedido.findMany({
    where:   { userId: session.user.id },
    orderBy: { creadoEn: 'desc' },
    include: {
      regalo:    { include: { fotos: { orderBy: { orden: 'asc' }, take: 1 } } },
      direccion: true,
    },
  });

  return NextResponse.json(pedidos);
}
