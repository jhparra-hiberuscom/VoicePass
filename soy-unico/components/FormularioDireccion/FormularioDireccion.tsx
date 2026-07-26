'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  calle:        z.string().min(5, 'Escribe la dirección completa'),
  ciudad:       z.string().min(2, 'Ciudad requerida'),
  departamento: z.string().min(2, 'Departamento requerido'),
  codPostal:    z.string().optional(),
  referencia:   z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormValues) => void;
  loading?: boolean;
  defaultValues?: Partial<FormValues>;
}

export default function FormularioDireccion({ onSubmit, loading, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Dirección <span className="text-red-500">*</span>
        </label>
        <input
          {...register('calle')}
          placeholder="Ej: Cra 15 #93-24 Apto 302"
          className="input-field"
        />
        {errors.calle && <p className="mt-1 text-xs text-red-500">{errors.calle.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            {...register('ciudad')}
            placeholder="Bogotá"
            className="input-field"
          />
          {errors.ciudad && <p className="mt-1 text-xs text-red-500">{errors.ciudad.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Departamento <span className="text-red-500">*</span>
          </label>
          <input
            {...register('departamento')}
            placeholder="Cundinamarca"
            className="input-field"
          />
          {errors.departamento && <p className="mt-1 text-xs text-red-500">{errors.departamento.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Código postal <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          {...register('codPostal')}
          placeholder="110111"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Referencia / indicaciones <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          {...register('referencia')}
          placeholder="Portería A, edificio azul..."
          className="input-field"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Confirmar dirección →'}
      </button>
    </form>
  );
}
