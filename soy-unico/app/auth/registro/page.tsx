'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/usuario/registro', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nombre: form.nombre, email: form.email, telefono: form.telefono, password: form.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al registrarse');
      setLoading(false);
      return;
    }

    // Auto-login tras registro
    await signIn('credentials', { email: form.email, password: form.password, callbackUrl: '/cuenta', redirect: false });
    router.push('/cuenta');
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 font-display text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary-500 hover:underline">Inicia sesión</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nombre completo', field: 'nombre',   type: 'text',     placeholder: 'Tu nombre' },
            { label: 'Email',           field: 'email',    type: 'email',    placeholder: 'tu@email.com' },
            { label: 'Teléfono',        field: 'telefono', type: 'tel',      placeholder: '+57 300 000 0000', required: false },
            { label: 'Contraseña',      field: 'password', type: 'password', placeholder: 'Mínimo 8 caracteres' },
            { label: 'Confirmar contraseña', field: 'confirm', type: 'password', placeholder: '••••••••' },
          ].map(({ label, field, type, placeholder, required = true }) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {!required && <span className="text-gray-400">(opcional)</span>}
              </label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={(e) => onChange(field, e.target.value)}
                required={required}
                placeholder={placeholder}
                className="input-field"
              />
            </div>
          ))}

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratuita'}
          </button>
        </form>
      </div>
    </div>
  );
}
