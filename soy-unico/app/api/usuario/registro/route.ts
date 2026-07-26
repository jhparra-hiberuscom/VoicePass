import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const registroSchema = z.object({
  nombre:   z.string().min(2),
  email:    z.string().email(),
  telefono: z.string().optional(),
  password: z.string().min(8),
});

// POST /api/usuario/registro
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registroSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { nombre, email, telefono, password } = parsed.data;

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { nombre, email, telefono, passwordHash },
    select: { id: true, nombre: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
