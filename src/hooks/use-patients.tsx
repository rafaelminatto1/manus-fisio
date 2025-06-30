import { useQuery } from '@tanstack/react-query'
import { Patient } from '@/types/database.types'

const fetchPatients = async (searchTerm: string): Promise<Patient[]> => {
  const url = searchTerm 
    ? `/api/patients?search=${encodeURIComponent(searchTerm)}`
    : '/api/patients'
    
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Falha ao buscar pacientes')
  }
  return response.json()
}

export function usePatients(searchTerm: string = '') {
  return useQuery<Patient[]>({
    queryKey: ['patients', searchTerm],
    queryFn: () => fetchPatients(searchTerm),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, 
  })
}