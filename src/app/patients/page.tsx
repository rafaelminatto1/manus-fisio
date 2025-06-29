'use client';

import { useState } from 'react';
import { usePatients, useCreatePatient } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error } = usePatients(page, 10, searchTerm);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(search);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <form onSubmit={handleSearch} className="flex gap-2 pt-2">
            <Input 
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Birth Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((patient: any) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.full_name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{new Date(patient.birth_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end items-center gap-2 pt-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>Page {data?.currentPage} of {data?.totalPages}</span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data?.totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 