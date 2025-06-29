'use client';

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'

const patientFormSchema = z.object({
  full_name: z.string().min(3, {
    message: 'O nome completo deve ter pelo menos 3 caracteres.',
  }),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Por favor, insira uma data de nascimento válida.',
  }),
  gender: z.string({
    required_error: 'Por favor, selecione o gênero.',
  }),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }).optional(),
  address: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

export default function NewPatientPage() {
    const router = useRouter()
    const { toast } = useToast()
    
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
        full_name: '',
        birth_date: '',
        gender: undefined,
        cpf: '',
        phone: '',
        email: '',
        address: ''
    },
  })

  async function onSubmit(data: PatientFormValues) {
    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error('Falha ao criar o paciente. Tente novamente.')
        }

        toast({
            title: "Sucesso!",
            description: "Novo paciente adicionado com sucesso.",
        })
        
        router.push('/patients')

    } catch (error: any) {
        toast({
            title: "Erro",
            description: error.message || "Ocorreu um erro inesperado.",
            variant: "destructive"
        })
    }
  }

  return (
    <div className="space-y-4">
       <Link href="/patients" className="flex items-center text-sm text-muted-foreground hover:underline">
           <ArrowLeft className="mr-2 h-4 w-4" />
           Voltar para a lista de pacientes
       </Link>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Paciente</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para cadastrar um novo paciente no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 90000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="exemplo@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Bairro, Cidade - Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 