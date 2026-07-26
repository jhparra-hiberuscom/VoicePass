# Soy Único.co — Portal de Regalos Personalizados

Portal de comercio electrónico de regalos únicos con encuesta de perfilamiento inteligente.
Envíos programados a toda Colombia.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth.js (email/contraseña + Google OAuth) |
| Almacenamiento de fotos | Cloudinary |
| Lenguaje | TypeScript |

---

## Inicio rápido

### 1. Instalar dependencias

```bash
cd soy-unico
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

Variables requeridas:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL |
| `NEXTAUTH_SECRET` | Secreto aleatorio (usa `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL pública del sitio (p.ej. `http://localhost:3000`) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `GOOGLE_CLIENT_ID` | (Opcional) Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (Opcional) Client Secret de Google OAuth |

### 3. Preparar base de datos

```bash
# Crear y migrar la base de datos
npm run db:migrate

# Cargar datos iniciales (preguntas de encuesta + regalos de ejemplo)
npm run db:seed
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
soy-unico/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── encuesta/page.tsx           ← Wizard de encuesta
│   ├── catalogo/page.tsx           ← Catálogo de regalos
│   ├── regalo/[id]/page.tsx        ← Detalle con carrusel
│   ├── checkout/page.tsx           ← Proceso de compra
│   ├── cuenta/page.tsx             ← Mis pedidos
│   ├── auth/login/page.tsx         ← Login
│   ├── auth/registro/page.tsx      ← Registro
│   └── admin/
│       ├── page.tsx                ← Dashboard admin
│       ├── regalos/                ← CRUD de inventario
│       ├── encuesta/               ← Gestión paramétrica de la encuesta
│       └── pedidos/                ← Gestión de pedidos
├── components/
│   ├── Encuesta/EncuestaWizard.tsx
│   ├── CatalogoRegalos/
│   ├── CarruselFotos/Carrusel.tsx
│   ├── FormularioDireccion/
│   └── admin/FormularioRegalo.tsx
├── lib/
│   ├── db.ts          ← Cliente Prisma singleton
│   ├── match.ts       ← Algoritmo encuesta ↔ keywords
│   ├── storage.ts     ← Upload a Cloudinary
│   └── auth.ts        ← Configuración NextAuth
├── prisma/
│   ├── schema.prisma  ← Modelo de datos
│   └── seed.ts        ← Datos iniciales
└── .env.example
```

---

## Flujo del usuario

```
Landing → Encuesta (5 preguntas) → Resultados match
       → Detalle regalo (carrusel de 3 fotos)
       → Login/Registro → Checkout (dirección + fecha)
       → Confirmación → Ver mis pedidos
```

## Panel de administración

Accede a `/admin` con un usuario marcado como `esAdmin = true`.

**Funcionalidades:**
- 📦 **Inventario** — CRUD de regalos: nombre, resumen, keywords, precio, medidas, peso, stock, 3 fotos con carrusel
- ❓ **Encuesta** — Agregar/editar/desactivar preguntas y opciones con keywords desde la UI
- 📋 **Pedidos** — Ver todos los pedidos, actualizar estado y número de seguimiento

---

## Hacer admin a un usuario

```sql
UPDATE "User" SET "esAdmin" = true WHERE email = 'tu@email.com';
```

O con Prisma Studio:
```bash
npm run db:studio
```

---

## Algoritmo de match

El archivo `lib/match.ts` contiene el algoritmo de recomendación:

1. Cada opción de respuesta tiene **keywords** (ej: `["romántico", "amor", "pareja"]`)
2. Cada regalo tiene **keywords** (ej: `["bienestar", "spa", "relax", "romántico"]`)
3. Se aplican **pesos por pregunta** (configurable en `PESOS_PREGUNTA`)
4. Los regalos se ordenan por **score de coincidencia** y se aplica filtro de presupuesto

Para cambiar los pesos:
```ts
// lib/match.ts
export const PESOS_PREGUNTA: Record<number, number> = {
  1: 0.20, // ¿Para quién?
  2: 0.20, // ¿Ocasión?
  3: 0.15, // ¿Presupuesto?
  4: 0.30, // ¿Qué le gusta? (mayor peso)
  5: 0.15, // ¿Qué edad?
};
```
