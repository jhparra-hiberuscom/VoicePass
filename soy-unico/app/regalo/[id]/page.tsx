import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import Carrusel from '@/components/CarruselFotos/Carrusel';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

async function getRegalo(id: string) {
  return prisma.regalo.findUnique({
    where: { id, activo: true },
    include: {
      fotos:    { orderBy: { orden: 'asc' } },
      keywords: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const regalo = await getRegalo(params.id);
  if (!regalo) return { title: 'Regalo no encontrado' };
  return {
    title:       regalo.nombre,
    description: regalo.resumen,
  };
}

export default async function RegaloPage({ params }: Props) {
  const regalo = await getRegalo(params.id);
  if (!regalo) notFound();

  const precio = Number(regalo.precio);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-primary-500">Inicio</Link>
        {' / '}
        <Link href="/catalogo" className="hover:text-primary-500">Catálogo</Link>
        {' / '}
        <span className="text-gray-600">{regalo.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Carrusel */}
        <Carrusel fotos={regalo.fotos} nombre={regalo.nombre} />

        {/* Info */}
        <div>
          <h1 className="mb-3 font-display text-3xl font-bold text-gray-900">{regalo.nombre}</h1>

          <p className="mb-4 text-2xl font-bold text-primary-600">
            ${precio.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-400">COP</span>
          </p>

          <p className="mb-6 text-gray-600 leading-relaxed">{regalo.resumen}</p>

          {/* Medidas y peso */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Alto',   value: `${regalo.alto} cm` },
              { label: 'Ancho',  value: `${regalo.ancho} cm` },
              { label: 'Largo',  value: `${regalo.largo} cm` },
              { label: 'Peso',   value: `${regalo.peso} kg` },
              { label: 'Stock',  value: regalo.stock > 0 ? `${regalo.stock} disponibles` : '❌ Sin stock' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Keywords */}
          {regalo.keywords.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {regalo.keywords.map((k) => (
                <span key={k.id} className="badge">{k.keyword}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          {regalo.stock > 0 ? (
            <Link
              href={`/checkout?regaloId=${regalo.id}`}
              className="btn-primary w-full justify-center py-4 text-base"
            >
              🎁 Quiero este regalo
            </Link>
          ) : (
            <div className="rounded-xl bg-gray-100 p-4 text-center text-gray-500">
              Este regalo está agotado temporalmente
            </div>
          )}

          <Link href="/encuesta" className="mt-4 block text-center text-sm text-primary-500 hover:underline">
            ← Volver a buscar otro regalo
          </Link>
        </div>
      </div>
    </div>
  );
}
