/**
 * Seed: carga preguntas de encuesta y regalos de ejemplo.
 * Ejecutar: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Preguntas de encuesta ──────────────────────────────────────────────────

  const preguntas = [
    {
      texto: '¿Para quién es el regalo?',
      orden: 1,
      opciones: [
        { texto: 'Pareja',   keywords: ['romántico', 'amor', 'pareja'] },
        { texto: 'Amigo/a',  keywords: ['amigo', 'amistad', 'casual'] },
        { texto: 'Familiar', keywords: ['familia', 'familiar', 'hogar'] },
        { texto: 'Colega',   keywords: ['trabajo', 'profesional', 'oficina'] },
        { texto: 'Para mí',  keywords: ['personal', 'autoregalo'] },
      ],
    },
    {
      texto: '¿Cuál es la ocasión?',
      orden: 2,
      opciones: [
        { texto: 'Cumpleaños',          keywords: ['cumpleaños', 'celebración'] },
        { texto: 'Aniversario',         keywords: ['aniversario', 'romántico', 'amor'] },
        { texto: 'Navidad / Año Nuevo', keywords: ['navidad', 'año nuevo', 'diciembre'] },
        { texto: 'Sin ocasión especial',keywords: ['casual', 'sorpresa'] },
        { texto: 'Otro',                keywords: ['especial', 'celebración'] },
      ],
    },
    {
      texto: '¿Cuál es tu rango de presupuesto?',
      orden: 3,
      opciones: [
        { texto: 'Menos de $50.000',          keywords: ['económico', 'bajo_presupuesto'] },
        { texto: '$50.000 – $150.000',         keywords: ['medio_presupuesto'] },
        { texto: '$150.000 – $300.000',        keywords: ['alto_presupuesto'] },
        { texto: 'Más de $300.000',            keywords: ['premium', 'lujo'] },
      ],
    },
    {
      texto: '¿Qué le gusta a quien recibe el regalo?',
      orden: 4,
      opciones: [
        { texto: 'Tecnología', keywords: ['tecnología', 'gadget', 'digital'] },
        { texto: 'Bienestar',  keywords: ['bienestar', 'salud', 'relax', 'spa'] },
        { texto: 'Gastronomía',keywords: ['gastronomía', 'cocina', 'gourmet', 'comida'] },
        { texto: 'Arte',       keywords: ['arte', 'creativo', 'cultura', 'diseño'] },
        { texto: 'Moda',       keywords: ['moda', 'ropa', 'accesorios', 'estilo'] },
        { texto: 'Naturaleza', keywords: ['naturaleza', 'exterior', 'aventura', 'viaje'] },
      ],
    },
    {
      texto: '¿Qué edad aproximada tiene quien recibe el regalo?',
      orden: 5,
      opciones: [
        { texto: 'Niño (0–12 años)',      keywords: ['niño', 'infantil', 'juguete'] },
        { texto: 'Joven (13–25 años)',    keywords: ['joven', 'juvenil', 'moderno'] },
        { texto: 'Adulto (26–59 años)',   keywords: ['adulto', 'profesional'] },
        { texto: 'Adulto mayor (60+)',    keywords: ['adulto_mayor', 'clásico', 'elegante'] },
      ],
    },
  ];

  for (const p of preguntas) {
    await prisma.preguntaEncuesta.upsert({
      where: { id: `seed-pregunta-${p.orden}` },
      update: {},
      create: {
        id:     `seed-pregunta-${p.orden}`,
        texto:  p.texto,
        orden:  p.orden,
        activa: true,
        opciones: {
          create: p.opciones.map((o, i) => ({
            id:       `seed-opcion-${p.orden}-${i + 1}`,
            texto:    o.texto,
            keywords: o.keywords,
          })),
        },
      },
    });
  }

  console.log('✅ Preguntas de encuesta creadas');

  // ── Regalos de ejemplo ─────────────────────────────────────────────────────

  const regalos = [
    {
      id:      'regalo-001',
      nombre:  'Kit Spa en Casa',
      resumen: 'Experiencia de relajación completa con sales de baño, aceites esenciales, mascarilla y vela aromática. Ideal para regalar bienestar.',
      precio:  89900,
      alto:    20, ancho: 15, largo: 25, peso: 0.8,
      stock:   30,
      keywords: ['bienestar', 'spa', 'relax', 'salud', 'romántico', 'amor', 'pareja', 'adulto'],
      fotos: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      ],
    },
    {
      id:      'regalo-002',
      nombre:  'Experiencia Gourmet — Tabla de Quesos Artesanales',
      resumen: 'Selección premium de quesos artesanales colombianos, mermeladas y galletas gourmet. Presentación elegante en tabla de madera.',
      precio:  145000,
      alto:    10, ancho: 40, largo: 30, peso: 1.5,
      stock:   20,
      keywords: ['gastronomía', 'gourmet', 'comida', 'premium', 'adulto', 'aniversario', 'celebración'],
      fotos: [
        'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800',
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
        'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=800',
      ],
    },
    {
      id:      'regalo-003',
      nombre:  'Auriculares Inalámbricos Premium',
      resumen: 'Auriculares Bluetooth con cancelación de ruido activa, 30h de batería y sonido de alta fidelidad. Para el amante de la tecnología.',
      precio:  289000,
      alto:    20, ancho: 18, largo: 8, peso: 0.35,
      stock:   15,
      keywords: ['tecnología', 'gadget', 'digital', 'joven', 'adulto', 'moderno', 'cumpleaños'],
      fotos: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
      ],
    },
    {
      id:      'regalo-004',
      nombre:  'Set de Pintura Artística',
      resumen: 'Kit completo con acrílicos, lienzos, pinceles y paleta. Perfecto para principiantes y artistas. Incluye guía de técnicas básicas.',
      precio:  75000,
      alto:    35, ancho: 25, largo: 10, peso: 1.2,
      stock:   25,
      keywords: ['arte', 'creativo', 'cultura', 'diseño', 'joven', 'adulto', 'casual'],
      fotos: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
        'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800',
      ],
    },
    {
      id:      'regalo-005',
      nombre:  'Mochila Outdoor Adventure',
      resumen: 'Mochila 40L impermeable para senderismo y aventura. Con sistema de hidratación, múltiples compartimentos y faja lumbar ergonómica.',
      precio:  220000,
      alto:    55, ancho: 35, largo: 25, peso: 1.1,
      stock:   12,
      keywords: ['naturaleza', 'exterior', 'aventura', 'viaje', 'joven', 'adulto', 'casual'],
      fotos: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      ],
    },
    {
      id:      'regalo-006',
      nombre:  'Pañuelo de Seda Artesanal',
      resumen: 'Pañuelo 100% seda pintado a mano por artesanos colombianos. Diseños únicos inspirados en la fauna y flora del país. Viene en caja regalo.',
      precio:  95000,
      alto:    5,  ancho: 20, largo: 20, peso: 0.15,
      stock:   40,
      keywords: ['moda', 'accesorios', 'estilo', 'arte', 'adulto', 'adulto_mayor', 'elegante', 'aniversario'],
      fotos: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=800',
        'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800',
      ],
    },
    {
      id:      'regalo-007',
      nombre:  'Kit LEGO Arquitectura',
      resumen: 'Set LEGO colección Arquitectura — Skyline de ciudades del mundo. 500+ piezas. Para niños de 12+ y adultos coleccionistas.',
      precio:  185000,
      alto:    30, ancho: 20, largo: 8, peso: 0.9,
      stock:   18,
      keywords: ['tecnología', 'arte', 'creativo', 'niño', 'joven', 'cumpleaños', 'navidad'],
      fotos: [
        'https://images.unsplash.com/photo-1587654780291-39c9098d715b?w=800',
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      ],
    },
    {
      id:      'regalo-008',
      nombre:  'Canasta Gourmet Premium',
      resumen: 'Canasta premium con selección de café colombiano especial, chocolates artesanales, mermeladas y snacks gourmet. Presentación de lujo.',
      precio:  320000,
      alto:    30, ancho: 35, largo: 25, peso: 2.0,
      stock:   10,
      keywords: ['gastronomía', 'gourmet', 'premium', 'lujo', 'adulto', 'adulto_mayor', 'aniversario', 'navidad'],
      fotos: [
        'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
      ],
    },
  ];

  for (const r of regalos) {
    await prisma.regalo.upsert({
      where:  { id: r.id },
      update: {},
      create: {
        id:      r.id,
        nombre:  r.nombre,
        resumen: r.resumen,
        precio:  r.precio,
        alto:    r.alto,
        ancho:   r.ancho,
        largo:   r.largo,
        peso:    r.peso,
        stock:   r.stock,
        activo:  true,
        fotos: {
          create: r.fotos.map((url, i) => ({ url, orden: i })),
        },
        keywords: {
          create: r.keywords.map((k) => ({ keyword: k })),
        },
      },
    });
  }

  console.log('✅ Regalos de ejemplo creados');
  console.log('🎉 Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
