'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Opcion {
  id?:      string;
  texto:    string;
  keywords: string[];
}

interface Pregunta {
  id?:      string;
  texto:    string;
  orden:    number;
  activa:   boolean;
  opciones: Opcion[];
}

export default function AdminEncuestaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [preguntas, setPreguntas]     = useState<Pregunta[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [editando, setEditando]       = useState<number | null>(null);
  const [guardando, setGuardando]     = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (status === 'authenticated' && !session?.user?.esAdmin) router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/admin/encuesta')
      .then((r) => r.json())
      .then((data: Pregunta[]) => { setPreguntas(data); setCargando(false); });
  }, []);

  function updatePregunta(idx: number, changes: Partial<Pregunta>) {
    setPreguntas((prev) => prev.map((p, i) => i === idx ? { ...p, ...changes } : p));
  }

  function updateOpcion(pIdx: number, oIdx: number, changes: Partial<Opcion>) {
    setPreguntas((prev) =>
      prev.map((p, i) =>
        i === pIdx
          ? { ...p, opciones: p.opciones.map((o, j) => j === oIdx ? { ...o, ...changes } : o) }
          : p,
      ),
    );
  }

  function addOpcion(pIdx: number) {
    setPreguntas((prev) =>
      prev.map((p, i) => i === pIdx ? { ...p, opciones: [...p.opciones, { texto: '', keywords: [] }] } : p),
    );
  }

  function removeOpcion(pIdx: number, oIdx: number) {
    setPreguntas((prev) =>
      prev.map((p, i) => i === pIdx ? { ...p, opciones: p.opciones.filter((_, j) => j !== oIdx) } : p),
    );
  }

  function addPregunta() {
    setPreguntas((prev) => [
      ...prev,
      { texto: '', orden: prev.length + 1, activa: true, opciones: [] },
    ]);
    setEditando(preguntas.length);
  }

  async function guardarPregunta(idx: number) {
    const p = preguntas[idx];
    setGuardando(true);

    const res = p.id
      ? await fetch(`/api/admin/encuesta/${p.id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ texto: p.texto, orden: p.orden, activa: p.activa, opciones: p.opciones }),
        })
      : await fetch('/api/admin/encuesta', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ texto: p.texto, orden: p.orden, activa: p.activa, opciones: p.opciones }),
        });

    if (res.ok) {
      const data = await res.json() as Pregunta;
      setPreguntas((prev) => prev.map((pp, i) => i === idx ? data : pp));
      setEditando(null);
    }
    setGuardando(false);
  }

  async function eliminarPregunta(idx: number) {
    const p = preguntas[idx];
    if (!p.id) { setPreguntas((prev) => prev.filter((_, i) => i !== idx)); return; }
    if (!confirm('¿Eliminar esta pregunta?')) return;

    await fetch(`/api/admin/encuesta/${p.id}`, { method: 'DELETE' });
    setPreguntas((prev) => prev.filter((_, i) => i !== idx));
  }

  if (cargando) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-gray-900">Gestionar encuesta</h1>
        <button onClick={addPregunta} className="btn-primary">+ Agregar pregunta</button>
      </div>

      <div className="space-y-4">
        {preguntas.map((p, idx) => (
          <div key={p.id ?? idx} className="card p-6">
            {editando === idx ? (
              /* ── Modo edición ────────────────────────────────────── */
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    value={p.texto}
                    onChange={(e) => updatePregunta(idx, { texto: e.target.value })}
                    placeholder="Texto de la pregunta"
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    value={p.orden}
                    onChange={(e) => updatePregunta(idx, { orden: Number(e.target.value) })}
                    className="input-field w-20"
                    title="Orden"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={p.activa}
                      onChange={(e) => updatePregunta(idx, { activa: e.target.checked })}
                      className="rounded"
                    />
                    Activa
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Opciones</p>
                  {p.opciones.map((o, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <input
                        value={o.texto}
                        onChange={(e) => updateOpcion(idx, oIdx, { texto: e.target.value })}
                        placeholder="Texto de la opción"
                        className="input-field flex-1"
                      />
                      <input
                        value={o.keywords.join(', ')}
                        onChange={(e) => updateOpcion(idx, oIdx, { keywords: e.target.value.split(',').map((k) => k.trim()) })}
                        placeholder="keywords separadas por coma"
                        className="input-field flex-1"
                      />
                      <button onClick={() => removeOpcion(idx, oIdx)} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addOpcion(idx)} className="text-sm text-primary-500 hover:underline">+ Agregar opción</button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => guardarPregunta(idx)} disabled={guardando} className="btn-primary py-2 text-sm disabled:opacity-50">
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(null)} className="btn-ghost py-2 text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              /* ── Modo vista ──────────────────────────────────────── */
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-600">#{p.orden}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{p.texto}</h3>
                  <ul className="mt-2 space-y-1">
                    {p.opciones.map((o, oIdx) => (
                      <li key={oIdx} className="text-sm text-gray-500">
                        • {o.texto}{' '}
                        {o.keywords.length > 0 && (
                          <span className="text-xs text-gray-400">({o.keywords.join(', ')})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditando(idx)} className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100">Editar</button>
                  <button onClick={() => eliminarPregunta(idx)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
