import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FormularioRegalo from '@/components/admin/FormularioRegalo';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Nuevo regalo' };

export default async function NuevoRegaloPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) redirect('/');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FormularioRegalo titulo="Agregar nuevo regalo" />
    </div>
  );
}
