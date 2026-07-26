'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import FormularioDireccion from '@/components/FormularioDireccion/FormularioDireccion';

interface Regalo {
  id:     string;
  nombre: string;
  precio: number;
  fotos:  { url: string; orden: number }[];
}

type Paso = 'regalo' | 'direccion' | 'fecha' | 'confirmacion';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session, status } = useSession();

  const regaloId = searchParams.get('regaloId');

  const [paso, setPaso]         = useState<Paso>('regalo');
  const [regalo, setRegalo]     = useState<Regalo | null>(null);
  const [direccion, setDireccion] = useState<Record<string, string> | null>(null);
  const [fecha, setFecha]       = useState('');
  const [franja, setFranja]     = useState<'mañana' | 'tarde' | 'noche'>('mañana');
  const [notas, setNotas]       = useState('');
  const [pedidoId, setPedidoId] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=/checkout?regaloId=${regaloId}`);
    }
  }, [status, router, regaloId]);

  // Cargar info del regalo
  useEffect(() => {
    if (!regaloId) return;
    fetch(`/api/regalos/${regaloId}`)
      .then((r) => r.json())
      .then(setRegalo);
  }, [regaloId]);

  async function confirmarPedido() {
    if (!regalo || !direccion) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/pedidos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        regaloId:       regalo.id,
        nuevaDireccion: direccion,
        fechaProgramada: new Date(fecha).toISOString(),
        franja,
        notas,
        cantidad: 1,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Error al crear el pedido');
    } else {
      setPedidoId(data.id);
      setPaso('confirmacion');
    }
    setLoading(false);
  }

  if (status === 'loading' || !regalo) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const fotoPortada = regalo.fotos.find((f) => f.orden === 0) ?? regalo.fotos[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-gray-900">
        {paso === 'confirmacion' ? '¡Pedido confirmado! 🎉' : 'Finalizar compra'}
      </h1>

      {/* Resumen del regalo (siempre visible) */}
      {paso !== 'confirmacion' && (
        <div className="card mb-8 flex gap-4 p-4">
          {fotoPortada && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
              <Image src={fotoPortada.url} alt={regalo.nombre} fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{regalo.nombre}</p>
            <p className="text-lg font-bold text-primary-600">
              ${Number(regalo.precio).toLocaleString('es-CO')} COP
            </p>
          </div>
        </div>
      )}

      {/* Paso: dirección */}
      {paso === 'regalo' && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Dirección de envío</h2>
          <FormularioDireccion
            onSubmit={(data) => {
              setDireccion(data as Record<string, string>);
              setPaso('fecha');
            }}
          />
        </div>
      )}

      {/* Paso: fecha */}
      {paso === 'fecha' && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Programa tu entrega</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de entrega</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Franja horaria</label>
            <div className="grid grid-cols-3 gap-3">
              {(['mañana', 'tarde', 'noche'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFranja(f)}
                  className={`rounded-xl border-2 py-3 text-sm font-medium capitalize transition ${
                    franja === f ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {f === 'mañana' ? '🌅 Mañana' : f === 'tarde' ? '☀️ Tarde' : '🌙 Noche'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">Notas adicionales (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Mensaje para incluir con el regalo, instrucciones especiales..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setPaso('regalo')} className="btn-ghost flex-1">← Volver</button>
            <button
              onClick={confirmarPedido}
              disabled={!fecha || loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar pedido →'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmación */}
      {paso === 'confirmacion' && (
        <div className="card p-8 text-center">
          <div className="mb-4 text-6xl">🎁</div>
          <h2 className="mb-2 font-display text-2xl font-bold text-gray-900">
            ¡Tu pedido está en camino!
          </h2>
          <p className="mb-2 text-gray-500">
            Número de pedido: <span className="font-mono font-semibold text-gray-800">{pedidoId.slice(-8).toUpperCase()}</span>
          </p>
          <p className="mb-6 text-gray-500">
            Te enviaremos una confirmación a tu email con todos los detalles.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/cuenta" className="btn-primary">Ver mis pedidos</Link>
            <Link href="/catalogo" className="btn-outline">Seguir explorando</Link>
          </div>
        </div>
      )}
    </div>
  );
}
