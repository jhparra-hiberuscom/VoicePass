'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'crypto'; // We'll use Math.random instead

interface Opcion {
  id: string;
  texto: string;
  keywords: string[];
}

interface Pregunta {
  id: string;
  texto: string;
  orden: number;
  opciones: Opcion[];
}

export default function EncuestaWizard() {
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({}); // preguntaId → opcionId
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [sessionId] = useState(() => `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    fetch('/api/encuesta')
      .then((r) => r.json())
      .then((data: Pregunta[]) => {
        setPreguntas(data);
        setCargando(false);
      });
  }, []);

  const preguntaActual = preguntas[paso];
  const totalPasos     = preguntas.length;
  const progreso       = totalPasos > 0 ? ((paso) / totalPasos) * 100 : 0;
  const opcionElegida  = preguntaActual ? respuestas[preguntaActual.id] : undefined;

  function elegirOpcion(opcionId: string) {
    if (!preguntaActual) return;
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: opcionId }));
  }

  async function siguiente() {
    if (paso < totalPasos - 1) {
      setPaso(paso + 1);
    } else {
      // Última pregunta — enviar al algoritmo de match
      setEnviando(true);
      const payload = preguntas.map((p) => ({
        preguntaOrden: p.orden,
        opcionId:      respuestas[p.id],
      }));

      const res = await fetch('/api/match', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ respuestas: payload, sessionId }),
      });

      const data = await res.json();
      // Guardar resultados en sessionStorage y redirigir al catálogo
      sessionStorage.setItem('matchRegalos', JSON.stringify(data.regalos ?? []));
      router.push('/catalogo?modo=match');
    }
  }

  function anterior() {
    if (paso > 0) setPaso(paso - 1);
  }

  if (cargando) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!preguntaActual) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>Pregunta {paso + 1} de {totalPasos}</span>
          <span>{Math.round(progreso)}% completado</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div className="card p-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-gray-900">
          {preguntaActual.texto}
        </h2>

        {/* Opciones */}
        <div className="grid gap-3">
          {preguntaActual.opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => elegirOpcion(op.id)}
              className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition ${
                opcionElegida === op.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {op.texto}
            </button>
          ))}
        </div>

        {/* Navegación */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={anterior}
            disabled={paso === 0}
            className="btn-ghost disabled:opacity-40"
          >
            ← Anterior
          </button>
          <button
            onClick={siguiente}
            disabled={!opcionElegida || enviando}
            className="btn-primary disabled:opacity-50"
          >
            {enviando
              ? 'Calculando...'
              : paso === totalPasos - 1
              ? 'Ver mis regalos ✨'
              : 'Siguiente →'}
          </button>
        </div>
      </div>

      {/* Indicadores de paso */}
      <div className="mt-6 flex justify-center gap-2">
        {preguntas.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === paso
                ? 'w-8 bg-primary-500'
                : i < paso
                ? 'w-2 bg-primary-300'
                : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
