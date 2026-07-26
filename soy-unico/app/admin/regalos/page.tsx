import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Inventario de regalos' };

export default async function AdminRegalosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) redirect('/');

  const regalos = await prisma.regalo.findMany({
    orderBy: { creadoEn: 'desc' },
    include: {
      fotos:    { orderBy: { orden: 'asc' }, take: 1 },
      keywords: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-gray-900">Inventario de regalos</h1>
        <Link href="/admin/regalos/nuevo" className="btn-primary">+ Agregar regalo</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['', 'Nombre', 'Precio', 'Stock', 'Estado', 'Keywords', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {regalos.map((r) => {
              const foto = r.fotos[0];
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {foto ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        <Image src={foto.url} alt={r.nombre} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl">🎁</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">${Number(r.precio).toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3">
                    <span className={r.stock <= 5 ? 'font-semibold text-red-600' : 'text-gray-700'}>
                      {r.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${r.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.keywords.slice(0, 3).map((k) => (
                        <span key={k.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{k.keyword}</span>
                      ))}
                      {r.keywords.length > 3 && <span className="text-xs text-gray-400">+{r.keywords.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/regalos/${r.id}`} className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100 transition">
                        Editar
                      </Link>
                      <Link href={`/regalo/${r.id}`} target="_blank" className="rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition">
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
