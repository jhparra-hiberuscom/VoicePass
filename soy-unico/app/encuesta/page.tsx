import type { Metadata } from 'next';
import EncuestaWizard from '@/components/Encuesta/EncuestaWizard';

export const metadata: Metadata = {
  title: 'Encuentra tu regalo perfecto',
  description: 'Responde 5 preguntas y te recomendamos los regalos ideales.',
};

export default function EncuestaPage() {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white py-8">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="badge mb-3 inline-block">✨ Encuesta de perfilamiento</span>
        <h1 className="mb-2 font-display text-3xl font-bold text-gray-900">
          Encuentra el regalo perfecto
        </h1>
        <p className="mb-8 text-gray-500">
          5 preguntas rápidas. Resultados personalizados al instante.
        </p>
      </div>
      <EncuestaWizard />
    </div>
  );
}
