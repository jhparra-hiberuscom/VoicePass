import type { Metadata } from 'next';
import { Suspense } from 'react';
import CatalogoGrid from '@/components/CatalogoRegalos/CatalogoGrid';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Catálogo de regalos',
  description: 'Explora todos nuestros regalos únicos. Envíos a toda Colombia.',
};

export default function CatalogoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Catálogo de regalos</h1>
          <p className="mt-1 text-gray-500">Cada regalo, una historia única.</p>
        </div>
        <Link href="/encuesta" className="btn-primary self-start sm:self-auto">
          ✨ Encontrar mi regalo
        </Link>
      </div>

      <Suspense fallback={<div className="py-20 text-center text-gray-400">Cargando...</div>}>
        <CatalogoGrid />
      </Suspense>
    </div>
  );
}
