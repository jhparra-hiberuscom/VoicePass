import Link from 'next/link';

export default function HomePage() {
  const pasos = [
    { num: '01', titulo: 'Responde la encuesta', desc: '5 preguntas rápidas para conocer a quien recibirá el regalo.' },
    { num: '02', titulo: 'Elige tu favorito',    desc: 'Te mostramos los mejores regalos según tu perfil, con fotos y detalles.' },
    { num: '03', titulo: 'Lo enviamos por ti',   desc: 'Registra la dirección, escoge la fecha y nosotros nos encargamos del resto.' },
  ];

  const categorias = [
    { icon: '🧖', label: 'Bienestar',   href: '/catalogo?cat=bienestar' },
    { icon: '🍴', label: 'Gastronomía', href: '/catalogo?cat=gastronomía' },
    { icon: '📱', label: 'Tecnología',  href: '/catalogo?cat=tecnología' },
    { icon: '🎨', label: 'Arte',        href: '/catalogo?cat=arte' },
    { icon: '👗', label: 'Moda',        href: '/catalogo?cat=moda' },
    { icon: '🏕️', label: 'Aventura',   href: '/catalogo?cat=naturaleza' },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent/10 py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="badge mb-4 inline-block">🎁 Regalos únicos para personas únicas</span>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
            El regalo perfecto<br />
            <span className="text-primary-500">existe. Te ayudamos</span><br />
            a encontrarlo.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600">
            Responde 5 preguntas y descubre regalos seleccionados especialmente
            para quien más quieres. Envíos programados a toda Colombia.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/encuesta" className="btn-primary px-8 py-4 text-base">
              Encontrar mi regalo ✨
            </Link>
            <Link href="/catalogo" className="btn-outline px-8 py-4 text-base">
              Ver catálogo completo
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary-100 opacity-30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-gray-900">
            ¿Cómo funciona?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.num} className="card p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
                  {p.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{p.titulo}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-gray-900">
            Explora por categoría
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categorias.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="card flex flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-1"
              >
                <span className="text-4xl">{c.icon}</span>
                <span className="text-sm font-medium text-gray-700">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="bg-primary-500 py-20 text-center text-white">
        <h2 className="mb-4 font-display text-3xl font-bold">
          ¿Listo para sorprender a alguien especial?
        </h2>
        <p className="mb-8 text-primary-100">
          Miles de personas ya encontraron el regalo perfecto con nuestra encuesta.
        </p>
        <Link href="/encuesta" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-md transition hover:bg-primary-50">
          Empezar encuesta ahora →
        </Link>
      </section>
    </>
  );
}
