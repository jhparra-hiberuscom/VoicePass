import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-display text-xl font-bold text-primary-500">
              Soy Único<span className="text-accent">.co</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Regalos únicos, envíos a todo Colombia.
            </p>
          </div>

          {/* Navegar */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Navegar
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/encuesta" className="hover:text-primary-500 transition">Encontrar mi regalo</Link></li>
              <li><Link href="/catalogo" className="hover:text-primary-500 transition">Catálogo completo</Link></li>
              <li><Link href="/cuenta" className="hover:text-primary-500 transition">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Ayuda
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="mailto:hola@soyunico.co" className="hover:text-primary-500 transition">hola@soyunico.co</a></li>
              <li><span>WhatsApp: +57 300 000 0000</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-500 transition">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">Términos y condiciones</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Soy Único.co — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
