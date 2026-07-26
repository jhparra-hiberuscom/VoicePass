/**
 * Utilidades de almacenamiento de imágenes.
 * Por defecto usa Cloudinary; cambia la implementación según tu proveedor.
 */

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Sube una imagen a Cloudinary y devuelve su URL pública.
 * Requiere las variables de entorno:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
export async function uploadImage(
  file: File,
  folder = 'soy-unico/regalos',
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary no está configurado. Revisa las variables de entorno.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  // Firma SHA-1 (node built-in crypto)
  const { createHash } = await import('crypto');
  const signature = createHash('sha1')
    .update(params)
    .digest('hex');

  const formData = new FormData();
  formData.append('file',      file);
  formData.append('api_key',   apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder',    folder);
  formData.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al subir imagen: ${err}`);
  }

  const data = await res.json() as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Elimina una imagen de Cloudinary por su publicId.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.round(Date.now() / 1000);
  const { createHash } = await import('crypto');
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key',   apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body:   formData,
  });
}
