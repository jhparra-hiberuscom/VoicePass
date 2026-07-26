import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import FormularioRegalo from '@/components/admin/FormularioRegalo';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Editar regalo' };

export default async function EditarRegaloPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) redirect('/');

  const regalo = await prisma.regalo.findUnique({
    where: { id: params.id },
    include: {
      fotos:    { orderBy: { orden: 'asc' } },
      keywords: true,
    },
  });

  if (!regalo) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FormularioRegalo
        titulo={`Editar: ${regalo.nombre}`}
        regaloId={regalo.id}
        initialData={{
          nombre:   regalo.nombre,
          resumen:  regalo.resumen,
          precio:   String(regalo.precio),
          alto:     String(regalo.alto),
          ancho:    String(regalo.ancho),
          largo:    String(regalo.largo),
          peso:     String(regalo.peso),
          stock:    String(regalo.stock),
          activo:   regalo.activo,
          keywords: regalo.keywords.map((k) => k.keyword).join(', '),
          fotos:    regalo.fotos.map((f) => ({ url: f.url, orden: f.orden, subida: true })),
        }}
      />
    </div>
  );
}
