'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-bold text-primary-500">
          Soy Único<span className="text-accent">.co</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/encuesta" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition">
            Encontrar mi regalo
          </Link>
          <Link href="/catalogo" className="text-sm font-medium text-gray-600 hover:text-primary-500 transition">
            Catálogo
          </Link>
          {session?.user.esAdmin && (
            <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition">
              Admin
            </Link>
          )}
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/cuenta" className="text-sm font-medium text-gray-600 hover:text-primary-500">
                Mi cuenta
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn-ghost py-2 px-4 text-sm">
                Iniciar sesión
              </Link>
              <Link href="/auth/registro" className="btn-primary py-2 px-4 text-sm">
                Registrarse
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/encuesta" onClick={() => setOpen(false)} className="text-sm font-medium">Encontrar mi regalo</Link>
            <Link href="/catalogo" onClick={() => setOpen(false)} className="text-sm font-medium">Catálogo</Link>
            {session?.user.esAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium text-amber-600">Admin</Link>
            )}
            {session ? (
              <>
                <Link href="/cuenta" onClick={() => setOpen(false)} className="text-sm font-medium">Mi cuenta</Link>
                <button onClick={() => { setOpen(false); signOut(); }} className="text-left text-sm font-medium text-red-500">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="text-sm font-medium">Iniciar sesión</Link>
                <Link href="/auth/registro" onClick={() => setOpen(false)} className="btn-primary text-center text-sm">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
