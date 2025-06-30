'use client';

import { useState } from 'react';
import { usePatients } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '@/hooks/use-debounce';
import { Patient } from '@/types/database.types';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: patients = [], isLoading, error } = usePatients(debouncedSearchTerm);

  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) {
      return null;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return null;
    }
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes da clínica de fisioterapia
          </p>
        </div>
        <Link href="/patients/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os pacientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando pacientes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-500 mb-2">Erro ao carregar pacientes</p>
                <p className="text-muted-foreground text-sm">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </p>
                {!searchTerm && (
                  <Link href="/patients/new">
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Cadastrar primeiro paciente
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient: Patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.full_name}</TableCell>
                      <TableCell>{patient.email || 'Não informado'}</TableCell>
                      <TableCell>{patient.phone || 'Não informado'}</TableCell>
                      <TableCell>
                        {patient.birth_date ? (
                          <Badge variant="secondary">
                            {calculateAge(patient.birth_date)} anos
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.created_at ? format(new Date(patient.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 