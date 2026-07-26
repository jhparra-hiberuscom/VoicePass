import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'Soy Único.co — Regalos que cuentan',
    template: '%s | Soy Único.co',
  },
  description:
    'Encuentra el regalo perfecto con nuestra encuesta de perfilamiento personalizado. Envíos a todo Colombia.',
  keywords: ['regalos', 'gifts', 'Colombia', 'regalos únicos', 'envío a domicilio'],
  openGraph: {
    title: 'Soy Único.co — Regalos que cuentan',
    description: 'Encuentra el regalo perfecto con nuestra encuesta personalizada.',
    type: 'website',
    locale: 'es_CO',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
