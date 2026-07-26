import Image from 'next/image';
import Link from 'next/link';

interface RegaloCardProps {
  id:      string;
  nombre:  string;
  resumen: string;
  precio:  number;
  fotos:   { url: string; orden: number }[];
  score?:  number;
}

export default function RegaloCard({ id, nombre, resumen, precio, fotos, score }: RegaloCardProps) {
  const fotoPortada = fotos.find((f) => f.orden === 0) ?? fotos[0];

  return (
    <Link href={`/regalo/${id}`} className="card group block overflow-hidden">
      {/* Imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {fotoPortada ? (
          <Image
            src={fotoPortada.url}
            alt={nombre}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-4xl">🎁</div>
        )}

        {score !== undefined && score > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-primary-500 px-2 py-1 text-xs font-bold text-white shadow">
            {Math.round(score * 100)}% match
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 font-semibold text-gray-900 group-hover:text-primary-600 transition">
          {nombre}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-500">{resumen}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            ${precio.toLocaleString('es-CO')}
          </span>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 transition group-hover:bg-primary-500 group-hover:text-white">
            Ver regalo →
          </span>
        </div>
      </div>
    </Link>
  );
}
