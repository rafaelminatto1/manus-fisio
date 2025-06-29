import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Database } from '@/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

export interface PatientsResponse {
  data: Patient[];
  totalPages: number;
  currentPage: number;
}

const fetchPatients = async (page: number = 1, limit: number = 10, search: string = ''): Promise<PatientsResponse> => {
  const response = await fetch(`/api/patients?page=${page}&limit=${limit}&search=${search}`);
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  return response.json();
};

const fetchPatient = async (id: string): Promise<Patient> => {
    const response = await fetch(`/api/patients/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient');
    }
    return response.json();
};

const createPatient = async (newPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
    });
    if (!response.ok) {
        throw new Error('Failed to create patient');
    }
    return response.json();
};

const updatePatient = async (updatedPatient: Partial<Patient> & { id: string }) => {
    const response = await fetch(`/api/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient),
    });
    if (!response.ok) {
        throw new Error('Failed to update patient');
    }
    return response.json();
};

export const usePatients = (page: number, limit: number, search: string) => {
  return useQuery<PatientsResponse, Error>({
    queryKey: ['patients', page, limit, search],
    queryFn: () => fetchPatients(page, limit, search),
    placeholderData: keepPreviousData,
  });
};

export const usePatient = (id: string) => {
    return useQuery<Patient, Error>({
        queryKey: ['patient', id],
        queryFn: () => fetchPatient(id),
        enabled: !!id,
    });
};

export const useCreatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePatient,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.setQueryData(['patient', data.id], data);
        },
    });
}; 