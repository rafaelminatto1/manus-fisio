'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createPatient } from '@/lib/api';

const patientFormSchema = z.object({
  full_name: z.string().min(3, 'O nome completo é obrigatório.'),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de nascimento inválida.',
  }),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido.').optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
  });

  const mutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente criado com sucesso.');
      router.push('/patients');
    },
    onError: (error) => {
      toast.error('Não foi possível criar o paciente. ' + error.message);
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Novo Paciente</h1>
        <p className="text-muted-foreground">Preencha os dados para cadastrar um novo paciente.</p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
          {errors.birth_date && <p className="text-red-500 text-sm">{errors.birth_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (Opcional)</Label>
          <Input id="cpf" {...register('cpf')} />
          {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (Opcional)</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Opcional)</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : 'Salvar Paciente'}
        </Button>
      </form>
    </div>
  );
}