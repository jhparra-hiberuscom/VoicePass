import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Dashboard' };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) redirect('/');

  const [totalRegalos, totalPedidos, totalUsuarios, pedidosPendientes] = await Promise.all([
    prisma.regalo.count(),
    prisma.pedido.count(),
    prisma.user.count(),
    prisma.pedido.count({ where: { estado: 'PENDIENTE' } }),
  ]);

  const ultimosPedidos = await prisma.pedido.findMany({
    take:    5,
    orderBy: { creadoEn: 'desc' },
    include: {
      user:   { select: { nombre: true } },
      regalo: { select: { nombre: true } },
    },
  });

  const stats = [
    { label: 'Regalos en catálogo', value: totalRegalos,       icon: '🎁', href: '/admin/regalos' },
    { label: 'Pedidos totales',     value: totalPedidos,        icon: '📦', href: '/admin/pedidos' },
    { label: 'Pendientes',          value: pedidosPendientes,   icon: '⏳', href: '/admin/pedidos?estado=PENDIENTE' },
    { label: 'Usuarios registrados',value: totalUsuarios,       icon: '👤', href: '#' },
  ];

  const estadoColor: Record<string, string> = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    CONFIRMADO: 'bg-blue-100 text-blue-700',
    EN_CAMINO: 'bg-indigo-100 text-indigo-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <span className="badge">Admin</span>
      </div>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-6 transition hover:-translate-y-0.5">
            <div className="mb-2 text-3xl">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/regalos/nuevo" className="btn-primary justify-center py-4 text-base">
          + Agregar nuevo regalo
        </Link>
        <Link href="/admin/encuesta" className="btn-outline justify-center py-4 text-base">
          Gestionar encuesta
        </Link>
        <Link href="/admin/pedidos" className="btn-outline justify-center py-4 text-base">
          Ver todos los pedidos
        </Link>
      </div>

      {/* Últimos pedidos */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Últimos pedidos</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Cliente', 'Regalo', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ultimosPedidos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-700">{p.user.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{p.regalo.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${estadoColor[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(p.creadoEn).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
