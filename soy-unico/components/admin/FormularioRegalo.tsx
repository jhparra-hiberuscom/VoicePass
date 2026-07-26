'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FotoPreview {
  url:     string;
  orden:   number;
  file?:   File;
  subida?: boolean;
}

interface FormData {
  nombre:   string;
  resumen:  string;
  precio:   string;
  alto:     string;
  ancho:    string;
  largo:    string;
  peso:     string;
  stock:    string;
  activo:   boolean;
  keywords: string; // CSV
}

interface Props {
  initialData?: Partial<FormData & { fotos: FotoPreview[] }>;
  regaloId?: string;
  titulo: string;
}

export default function FormularioRegalo({ initialData, regaloId, titulo }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    nombre:   initialData?.nombre   ?? '',
    resumen:  initialData?.resumen  ?? '',
    precio:   String(initialData?.precio ?? ''),
    alto:     String(initialData?.alto   ?? ''),
    ancho:    String(initialData?.ancho  ?? ''),
    largo:    String(initialData?.largo  ?? ''),
    peso:     String(initialData?.peso   ?? ''),
    stock:    String(initialData?.stock  ?? '0'),
    activo:   initialData?.activo   ?? true,
    keywords: initialData?.keywords ?? '',
  });

  const [fotos, setFotos]     = useState<FotoPreview[]>(initialData?.fotos ?? []);
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError]     = useState('');

  function onChange(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || fotos.length >= 3) return;

    setUploadingFoto(true);
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json() as { url: string };
    if (res.ok && data.url) {
      setFotos((prev) => [...prev, { url: data.url, orden: prev.length, subida: true }]);
    }
    setUploadingFoto(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function moverFoto(idx: number, dir: -1 | 1) {
    setFotos((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr.map((f, i) => ({ ...f, orden: i }));
    });
  }

  function eliminarFoto(idx: number) {
    setFotos((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, orden: i })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      nombre:   form.nombre,
      resumen:  form.resumen,
      precio:   Number(form.precio),
      alto:     Number(form.alto),
      ancho:    Number(form.ancho),
      largo:    Number(form.largo),
      peso:     Number(form.peso),
      stock:    Number(form.stock),
      activo:   form.activo,
      keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      fotos:    fotos.map((f) => ({ url: f.url, orden: f.orden })),
    };

    const url    = regaloId ? `/api/admin/regalos/${regaloId}` : '/api/admin/regalos';
    const method = regaloId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === 'string' ? d.error : 'Error al guardar el regalo');
    } else {
      router.push('/admin/regalos');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">{titulo}</h1>

      {/* Fotos */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Fotos (máx. 3)</h2>
        <div className="mb-4 flex flex-wrap gap-4">
          {fotos.map((foto, idx) => (
            <div key={idx} className="relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-xl border-2 border-gray-200">
                <Image src={foto.url} alt={`Foto ${idx + 1}`} fill className="object-cover" sizes="128px" />
              </div>
              <div className="absolute -right-2 -top-2 flex gap-1">
                <button type="button" onClick={() => moverFoto(idx, -1)} className="rounded-full bg-white p-1 text-xs shadow">‹</button>
                <button type="button" onClick={() => moverFoto(idx, 1)}  className="rounded-full bg-white p-1 text-xs shadow">›</button>
                <button type="button" onClick={() => eliminarFoto(idx)}  className="rounded-full bg-red-100 p-1 text-xs text-red-600 shadow">✕</button>
              </div>
              {idx === 0 && <span className="absolute bottom-1 left-1 rounded bg-primary-500 px-1.5 py-0.5 text-xs text-white">Portada</span>}
            </div>
          ))}

          {fotos.length < 3 && (
            <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-primary-400 hover:text-primary-500">
              {uploadingFoto ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              ) : (
                <>
                  <span className="text-3xl">+</span>
                  <span className="text-xs">Agregar foto</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Datos básicos */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Información del regalo</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
            <input value={form.nombre} onChange={(e) => onChange('nombre', e.target.value)} required className="input-field" placeholder="Nombre del regalo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Resumen / descripción *</label>
            <textarea value={form.resumen} onChange={(e) => onChange('resumen', e.target.value)} required rows={4} className="input-field resize-none" placeholder="Describe el regalo..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Palabras clave (separadas por coma) *
            </label>
            <input value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} required className="input-field" placeholder="bienestar, spa, romántico, adulto" />
            <p className="mt-1 text-xs text-gray-400">Estas keywords se usarán para el algoritmo de recomendación de la encuesta.</p>
          </div>
        </div>
      </div>

      {/* Precio y stock */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Precio y stock</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Precio (COP) *</label>
            <input type="number" value={form.precio} onChange={(e) => onChange('precio', e.target.value)} required min="0" step="1000" className="input-field" placeholder="89900" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Stock disponible *</label>
            <input type="number" value={form.stock} onChange={(e) => onChange('stock', e.target.value)} required min="0" step="1" className="input-field" placeholder="10" />
          </div>
        </div>
      </div>

      {/* Medidas */}
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Medidas y peso</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Alto (cm)',  field: 'alto' },
            { label: 'Ancho (cm)', field: 'ancho' },
            { label: 'Largo (cm)', field: 'largo' },
            { label: 'Peso (kg)',  field: 'peso' },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label} *</label>
              <input
                type="number"
                value={form[field as keyof FormData] as string}
                onChange={(e) => onChange(field as keyof FormData, e.target.value)}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Estado */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="activo"
          checked={form.activo}
          onChange={(e) => onChange('activo', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-700">
          Publicar en el catálogo (visible para los clientes)
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push('/admin/regalos')} className="btn-ghost">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Guardando...' : regaloId ? 'Guardar cambios' : 'Crear regalo'}
        </button>
      </div>
    </form>
  );
}
