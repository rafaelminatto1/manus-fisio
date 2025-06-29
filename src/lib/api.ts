import { type PatientFormValues } from '@/app/patients/new/page';

export const createPatient = async (patientData: PatientFormValues) => {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao criar o paciente.');
  }

  return response.json();
}; 