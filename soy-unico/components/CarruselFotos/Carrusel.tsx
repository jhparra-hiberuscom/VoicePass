'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FotoCarrusel {
  url: string;
  orden: number;
}

interface CarruselProps {
  fotos: FotoCarrusel[];
  nombre: string;
}

export default function Carrusel({ fotos, nombre }: CarruselProps) {
  const [activo, setActivo] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        Sin imagen
      </div>
    );
  }

  const ordenadas = [...fotos].sort((a, b) => a.orden - b.orden);

  return (
    <div className="w-full">
      {/* Imagen principal */}
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={ordenadas[activo].url}
          alt={`${nombre} — foto ${activo + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Flechas */}
        {ordenadas.length > 1 && (
          <>
            <button
              onClick={() => setActivo((prev) => (prev - 1 + ordenadas.length) % ordenadas.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur hover:bg-white transition"
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              onClick={() => setActivo((prev) => (prev + 1) % ordenadas.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur hover:bg-white transition"
              aria-label="Foto siguiente"
            >
              ›
            </button>
          </>
        )}

        {/* Indicador */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {ordenadas.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activo ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Miniaturas */}
      {ordenadas.length > 1 && (
        <div className="flex gap-2">
          {ordenadas.map((foto, i) => (
            <button
              key={i}
              onClick={() => setActivo(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                i === activo ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={foto.url}
                alt={`miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
