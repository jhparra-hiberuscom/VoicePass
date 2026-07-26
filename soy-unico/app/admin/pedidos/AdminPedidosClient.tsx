'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

interface Pedido {
  id:               string;
  estado:           EstadoPedido;
  creadoEn:         string | Date;
  fechaProgramada:  string | Date;
  franja:           string;
  cantidad:         number;
  precioUnitario:   number;
  numeroSeguimiento?: string | null;
  user: { nombre: string; email: string; telefono?: string | null };
  regalo: { nombre: string };
  direccion: { calle: string; ciudad: string; departamento: string };
}

const ESTADOS: EstadoPedido[] = [
  'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO',
];

const estadoColor: Record<EstadoPedido, string> = {
  PENDIENTE:      'bg-yellow-100 text-yellow-700',
  CONFIRMADO:     'bg-blue-100 text-blue-700',
  EN_PREPARACION: 'bg-orange-100 text-orange-700',
  EN_CAMINO:      'bg-indigo-100 text-indigo-700',
  ENTREGADO:      'bg-green-100 text-green-700',
  CANCELADO:      'bg-red-100 text-red-700',
};

export default function AdminPedidosClient({ pedidos: initialPedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [pedidos, setPedidos]   = useState<Pedido[]>(initialPedidos);
  const [filtro, setFiltro]     = useState<EstadoPedido | 'TODOS'>('TODOS');
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido>('CONFIRMADO');
  const [seguimiento, setSeguimiento] = useState('');
  const [saving, setSaving]     = useState(false);

  const visibles = filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.estado === filtro);

  async function actualizarEstado(id: string) {
    setSaving(true);
    const res = await fetch('/api/admin/pedidos', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, estado: nuevoEstado, numeroSeguimiento: seguimiento }),
    });
    if (res.ok) {
      setPedidos((prev) =>
        prev.map((p) => p.id === id ? { ...p, estado: nuevoEstado, numeroSeguimiento: seguimiento } : p),
      );
      setEditando(null);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <>
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['TODOS', ...ESTADOS] as const).map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtro === e ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e.replace('_', ' ')} ({e === 'TODOS' ? pedidos.length : pedidos.filter((p) => p.estado === e).length})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Cliente', 'Regalo', 'Dirección', 'Entrega', 'Total', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibles.map((p) => (
              <>
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.user.nombre}</p>
                    <p className="text-xs text-gray-400">{p.user.email}</p>
                    {p.user.telefono && <p className="text-xs text-gray-400">{p.user.telefono}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.regalo.nombre}</td>
                  <td className="max-w-[180px] px-4 py-3 text-xs text-gray-500">
                    {p.direccion.calle}<br/>{p.direccion.ciudad}, {p.direccion.departamento}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(p.fechaProgramada).toLocaleDateString('es-CO')}<br/>
                    <span className="capitalize">{p.franja}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary-600">
                    ${(Number(p.precioUnitario) * p.cantidad).toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${estadoColor[p.estado]}`}>
                      {p.estado.replace('_', ' ')}
                    </span>
                    {p.numeroSeguimiento && (
                      <p className="mt-1 text-xs text-gray-400">#{p.numeroSeguimiento}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditando(p.id); setNuevoEstado(p.estado); setSeguimiento(p.numeroSeguimiento ?? ''); }}
                      className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100 transition"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>

                {/* Inline editor */}
                {editando === p.id && (
                  <tr key={`edit-${p.id}`} className="bg-primary-50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="flex flex-wrap items-end gap-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Nuevo estado</label>
                          <select
                            value={nuevoEstado}
                            onChange={(e) => setNuevoEstado(e.target.value as EstadoPedido)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          >
                            {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Número de seguimiento</label>
                          <input
                            value={seguimiento}
                            onChange={(e) => setSeguimiento(e.target.value)}
                            placeholder="TRA-12345"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                        <button onClick={() => actualizarEstado(p.id)} disabled={saving} className="btn-primary py-2 text-sm disabled:opacity-50">
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditando(null)} className="btn-ghost py-2 text-sm">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {visibles.length === 0 && (
          <div className="py-10 text-center text-gray-400">No hay pedidos con este estado</div>
        )}
      </div>
    </>
  );
}
