'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Pedido {
  id:              string;
  creadoEn:        string;
  estado:          string;
  fechaProgramada: string;
  franja:          string;
  precioUnitario:  number;
  cantidad:        number;
  regalo: {
    nombre: string;
    fotos:  { url: string; orden: number }[];
  };
  direccion: {
    calle:        string;
    ciudad:       string;
    departamento: string;
  };
}

const estadoColor: Record<string, string> = {
  PENDIENTE:       'bg-yellow-100 text-yellow-700',
  CONFIRMADO:      'bg-blue-100 text-blue-700',
  EN_PREPARACION:  'bg-orange-100 text-orange-700',
  EN_CAMINO:       'bg-indigo-100 text-indigo-700',
  ENTREGADO:       'bg-green-100 text-green-700',
  CANCELADO:       'bg-red-100 text-red-700',
};

const estadoLabel: Record<string, string> = {
  PENDIENTE:      'Pendiente',
  CONFIRMADO:     'Confirmado',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO:      'En camino',
  ENTREGADO:      'Entregado',
  CANCELADO:      'Cancelado',
};

export default function CuentaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pedidos, setPedidos]   = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login?callbackUrl=/cuenta');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/pedidos')
      .then((r) => r.json())
      .then((data: Pedido[]) => { setPedidos(data); setCargando(false); });
  }, [status]);

  if (status === 'loading' || cargando) {
    return <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl font-bold text-gray-900">Mi cuenta</h1>
      <p className="mb-8 text-gray-500">Hola, <strong>{session?.user?.name}</strong> 👋</p>

      <h2 className="mb-4 text-xl font-semibold text-gray-800">Mis pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <div className="mb-3 text-5xl">📦</div>
          <p className="mb-4">Aún no tienes pedidos.</p>
          <Link href="/encuesta" className="btn-primary">Encontrar mi primer regalo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => {
            const foto = p.regalo.fotos.find((f) => f.orden === 0) ?? p.regalo.fotos[0];
            const total = Number(p.precioUnitario) * p.cantidad;
            return (
              <div key={p.id} className="card flex gap-4 p-4">
                {foto && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image src={foto.url} alt={p.regalo.nombre} fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{p.regalo.nombre}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${estadoColor[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {estadoLabel[p.estado] ?? p.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    📍 {p.direccion.calle}, {p.direccion.ciudad}, {p.direccion.departamento}
                  </p>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(p.fechaProgramada).toLocaleDateString('es-CO', { dateStyle: 'long' })} — {p.franja}
                  </p>
                  <p className="mt-1 font-semibold text-primary-600">
                    ${total.toLocaleString('es-CO')} COP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
