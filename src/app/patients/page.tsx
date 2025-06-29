'use client';

import { useState, useEffect } from 'react';
import { usePatients, useCreatePatient } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/types/database';
import { format } from 'date-fns';

// Mock para desenvolvimento inicial da UI
const mockPatients: Patient[] = [
    {
        id: '1',
        full_name: 'José Carlos',
        birth_date: '1980-05-15',
        gender: 'Masculino',
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        full_name: 'Maria da Silva',
        birth_date: '1992-11-20',
        gender: 'Feminino',
        created_at: new Date().toISOString(),
    },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error('Falha ao buscar pacientes');
        }
        const data = await response.json();
        setPatients(data);
        
        // Usando mock por enquanto
        // setPatients(mockPatients);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Link href="/patients/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Paciente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            Gerencie os pacientes da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nasc.</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.full_name}</TableCell>
                    <TableCell>{format(new Date(patient.birth_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.gender}</Badge>
                    </TableCell>
                     <TableCell>{format(new Date(patient.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                       <Link href={`/patients/${patient.id}`}>
                         <Button variant="outline" size="sm">
                           Ver Detalhes
                         </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 