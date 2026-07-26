import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import AdminPedidosClient from './AdminPedidosClient';

export const metadata: Metadata = { title: 'Admin — Pedidos' };

export default async function AdminPedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) redirect('/');

  const pedidos = await prisma.pedido.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 50,
    include: {
      user:     { select: { nombre: true, email: true, telefono: true } },
      regalo:   { select: { nombre: true } },
      direccion: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-gray-900">Gestión de pedidos</h1>
      <AdminPedidosClient pedidos={pedidos} />
    </div>
  );
}
