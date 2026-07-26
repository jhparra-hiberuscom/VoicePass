/**
 * Algoritmo de match encuesta ↔ catálogo de regalos.
 *
 * Recibe las keywords elegidas por el usuario a través de la encuesta y
 * devuelve los regalos ordenados por score de coincidencia.
 *
 * Cada pregunta puede tener un peso diferente (configurable en PESOS_PREGUNTA).
 */

import { prisma } from './db';

// Peso de cada pregunta sobre el score total (sumar = 1.0 recomendado)
export const PESOS_PREGUNTA: Record<number, number> = {
  1: 0.20, // ¿Para quién?
  2: 0.20, // ¿Ocasión?
  3: 0.15, // ¿Presupuesto?
  4: 0.30, // ¿Qué le gusta?
  5: 0.15, // ¿Qué edad?
};

export interface RespuestaUsuario {
  preguntaOrden: number;
  opcionId: string;
}

export interface RegaloConScore {
  id: string;
  nombre: string;
  resumen: string;
  precio: number;
  fotos: { url: string; orden: number }[];
  keywords: string[];
  score: number;
}

/**
 * Calcula el score de match entre un conjunto de keywords del usuario y
 * los keywords del regalo.
 *
 * @param userKeywords  - keywords acumuladas de la encuesta
 * @param giftKeywords  - keywords del regalo
 * @param preguntaOrden - orden de la pregunta (para aplicar peso)
 * @returns score parcial
 */
function calcularScoreParcial(
  userKeywords: string[],
  giftKeywords: string[],
  peso: number,
): number {
  if (userKeywords.length === 0) return 0;
  const coincidencias = userKeywords.filter((k) =>
    giftKeywords.map((g) => g.toLowerCase()).includes(k.toLowerCase()),
  );
  return (coincidencias.length / userKeywords.length) * peso;
}

/**
 * Devuelve regalos rankeados según las respuestas de la encuesta.
 *
 * @param respuestas - array de { preguntaOrden, opcionId }
 * @param limite     - máximo de regalos a devolver
 */
export async function matchRegalos(
  respuestas: RespuestaUsuario[],
  limite = 6,
): Promise<RegaloConScore[]> {
  // 1. Obtener keywords de cada opción elegida, agrupadas por pregunta
  const opcionIds = respuestas.map((r) => r.opcionId);

  const opciones = await prisma.opcionPregunta.findMany({
    where: { id: { in: opcionIds } },
    include: { pregunta: { select: { orden: true } } },
  });

  // Map: preguntaOrden → keywords
  const keywordsPorPregunta = new Map<number, string[]>();
  for (const op of opciones) {
    const orden = op.pregunta.orden;
    keywordsPorPregunta.set(orden, [
      ...(keywordsPorPregunta.get(orden) ?? []),
      ...op.keywords,
    ]);
  }

  // 2. Obtener todos los regalos activos con keywords y fotos
  const regalos = await prisma.regalo.findMany({
    where: { activo: true, stock: { gt: 0 } },
    include: {
      keywords: true,
      fotos: { orderBy: { orden: 'asc' } },
    },
  });

  // 3. Aplicar filtro de presupuesto estricto (pregunta 3)
  const preguntaPresupuesto = opciones.find((o) => o.pregunta.orden === 3);
  let regalosFiltrados = regalos;

  if (preguntaPresupuesto) {
    const kw = preguntaPresupuesto.keywords;
    const [min, max] = extraerRangoPresupuesto(kw);
    regalosFiltrados = regalos.filter((r) => {
      const precio = Number(r.precio);
      if (max === Infinity) return precio >= min;
      return precio >= min && precio <= max;
    });
    // Si el filtro deja muy pocos, relajamos
    if (regalosFiltrados.length < 3) regalosFiltrados = regalos;
  }

  // 4. Calcular score para cada regalo
  const scored: RegaloConScore[] = regalosFiltrados.map((regalo) => {
    const giftKeywords = regalo.keywords.map((k) => k.keyword);
    let score = 0;

    for (const [orden, userKws] of keywordsPorPregunta.entries()) {
      const peso = PESOS_PREGUNTA[orden] ?? 0.1;
      score += calcularScoreParcial(userKws, giftKeywords, peso);
    }

    return {
      id:       regalo.id,
      nombre:   regalo.nombre,
      resumen:  regalo.resumen,
      precio:   Number(regalo.precio),
      fotos:    regalo.fotos.map((f) => ({ url: f.url, orden: f.orden })),
      keywords: giftKeywords,
      score,
    };
  });

  // 5. Ordenar por score desc, devolver los mejores
  return scored.sort((a, b) => b.score - a.score).slice(0, limite);
}

/** Extrae rango de precios a partir de keywords de la opción de presupuesto */
function extraerRangoPresupuesto(keywords: string[]): [number, number] {
  if (keywords.includes('económico') || keywords.includes('bajo_presupuesto'))
    return [0, 50000];
  if (keywords.includes('medio_presupuesto')) return [50000, 150000];
  if (keywords.includes('alto_presupuesto')) return [150000, 300000];
  if (keywords.includes('premium') || keywords.includes('lujo'))
    return [300000, Infinity];
  return [0, Infinity];
}
