import { type PatientFormValues } from '@/app/patients/new/page';
// import * as Sentry from '@sentry/nextjs';

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

// Função utilitária para log de erros críticos e alertas de segurança
export function logCriticalError(context: string, error: any, req?: Request) {
  const log = {
    context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    url: req?.url,
    timestamp: new Date().toISOString(),
    userAgent: req?.headers?.get('user-agent'),
    ip: req?.headers?.get('x-forwarded-for') || req?.headers?.get('cf-connecting-ip'),
  }
  // Log local
  console.error('[CRITICAL]', log)
  // Sentry removido temporariamente
  // Sentry.captureException(error, { extra: log })
} 