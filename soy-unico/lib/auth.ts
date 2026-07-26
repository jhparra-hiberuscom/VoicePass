import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/registro',
  },
  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Credenciales (email + password) ──────────────────────────────────
    CredentialsProvider({
      name: 'Correo y contraseña',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id:      user.id,
          name:    user.nombre,
          email:   user.email,
          esAdmin: user.esAdmin,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id;
        token.esAdmin = (user as { esAdmin?: boolean }).esAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id      = token.id as string;
        session.user.esAdmin = token.esAdmin as boolean;
      }
      return session;
    },
  },
};

// ── Tipos extendidos de NextAuth ──────────────────────────────────────────────
declare module 'next-auth' {
  interface User { esAdmin?: boolean }
  interface Session {
    user: { id: string; esAdmin: boolean; name?: string | null; email?: string | null; image?: string | null }
  }
}
declare module 'next-auth/jwt' {
  interface JWT { id: string; esAdmin: boolean }
}
