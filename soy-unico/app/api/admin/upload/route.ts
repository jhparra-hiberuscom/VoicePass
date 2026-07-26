import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

// POST /api/admin/upload — sube una imagen al proveedor configurado
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Solo se aceptan imágenes' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'La imagen no puede superar 5 MB' }, { status: 400 });
  }

  const result = await uploadImage(file, 'soy-unico/regalos');
  return NextResponse.json(result);
}
