'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import RegaloCard from './RegaloCard';

interface Regalo {
  id:      string;
  nombre:  string;
  resumen: string;
  precio:  number;
  fotos:   { url: string; orden: number }[];
  score?:  number;
}

interface ApiResponse {
  total:   number;
  page:    number;
  limite:  number;
  regalos: Regalo[];
}

export default function CatalogoGrid() {
  const searchParams = useSearchParams();
  const modo = searchParams.get('modo');
  const cat  = searchParams.get('cat') ?? '';
  const q    = searchParams.get('q')   ?? '';

  const [regalos, setRegalos]   = useState<Regalo[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(q);
  const [esMatch, setEsMatch]   = useState(false);

  const cargar = useCallback(async (p = 1) => {
    setCargando(true);

    // Si venimos del modo match, usar resultados de sessionStorage
    if (modo === 'match' && p === 1) {
      const cached = sessionStorage.getItem('matchRegalos');
      if (cached) {
        const data = JSON.parse(cached) as Regalo[];
        setRegalos(data);
        setTotal(data.length);
        setEsMatch(true);
        setCargando(false);
        return;
      }
    }

    const params = new URLSearchParams({ page: String(p), limit: '12' });
    if (cat)      params.set('cat', cat);
    if (busqueda) params.set('q', busqueda);

    const res  = await fetch(`/api/regalos?${params}`);
    const data = await res.json() as ApiResponse;
    setRegalos((prev) => p === 1 ? data.regalos : [...prev, ...data.regalos]);
    setTotal(data.total);
    setPage(p);
    setCargando(false);
    setEsMatch(false);
  }, [modo, cat, busqueda]);

  useEffect(() => { cargar(1); }, [cargar]);

  function handleBusqueda(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    cargar(1);
  }

  return (
    <div>
      {/* Buscador */}
      <form onSubmit={handleBusqueda} className="mb-6 flex gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar regalos..."
          className="input-field"
        />
        <button type="submit" className="btn-primary px-5">
          Buscar
        </button>
      </form>

      {esMatch && (
        <div className="mb-6 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
          🎯 Mostrando los <strong>{regalos.length} regalos</strong> más recomendados según tu perfil.{' '}
          <button
            onClick={() => { sessionStorage.removeItem('matchRegalos'); cargar(1); }}
            className="underline hover:no-underline"
          >
            Ver todos los regalos
          </button>
        </div>
      )}

      {/* Grid */}
      {cargando && regalos.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : regalos.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <div className="mb-2 text-5xl">🎁</div>
          <p className="text-lg">No encontramos regalos con esos criterios.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">{total} regalo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regalos.map((r) => (
              <RegaloCard key={r.id} {...r} />
            ))}
          </div>

          {/* Cargar más */}
          {!esMatch && regalos.length < total && (
            <div className="mt-10 text-center">
              <button
                onClick={() => cargar(page + 1)}
                disabled={cargando}
                className="btn-outline"
              >
                {cargando ? 'Cargando...' : 'Ver más regalos'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
