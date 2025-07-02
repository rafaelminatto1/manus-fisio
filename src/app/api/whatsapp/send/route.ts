import { NextRequest, NextResponse } from 'next/server';
import WhatsAppService, { AppointmentReminder, ExercisePrescription } from '@/services/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    // Validação básica
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Tipo de mensagem é obrigatório' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'appointment-reminder':
        success = await handleAppointmentReminder(data);
        break;
      
      case 'exercise-prescription':
        success = await handleExercisePrescription(data);
        break;
      
      case 'appointment-confirmation':
        success = await handleAppointmentConfirmation(data);
        break;
      
      case 'generic':
        success = await handleGenericMessage(data);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de mensagem inválido' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mensagem enviada com sucesso!' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Falha ao enviar mensagem' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro na API WhatsApp:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Handler para lembrete de consulta
async function handleAppointmentReminder(data: any): Promise<boolean> {
  const { patientName, patientPhone, appointmentDate, appointmentTime, clinicName, clinicAddress } = data;
  
  // Validação
  if (!patientName || !patientPhone || !appointmentDate || !appointmentTime || !clinicName) {
    throw new Error('Dados obrigatórios: patientName, patientPhone, appointmentDate, appointmentTime, clinicName');
  }

  const reminder: AppointmentReminder = {
    patientName,
    patientPhone: WhatsAppService.formatPhoneNumber(patientPhone),
    appointmentDate,
    appointmentTime,
    clinicName,
    clinicAddress
  };

  return WhatsAppService.sendAppointmentReminder(reminder);
}

// Handler para prescrição de exercícios
async function handleExercisePrescription(data: any): Promise<boolean> {
  const { patientName, patientPhone, exercises, notes } = data;
  
  // Validação
  if (!patientName || !patientPhone || !exercises || !Array.isArray(exercises)) {
    throw new Error('Dados obrigatórios: patientName, patientPhone, exercises (array)');
  }

  const prescription: ExercisePrescription = {
    patientName,
    patientPhone: WhatsAppService.formatPhoneNumber(patientPhone),
    exercises,
    notes
  };

  return WhatsAppService.sendExercisePrescription(prescription);
}

// Handler para confirmação de agendamento
async function handleAppointmentConfirmation(data: any): Promise<boolean> {
  const { patientName, patientPhone, appointmentDate, appointmentTime } = data;
  
  // Validação
  if (!patientName || !patientPhone || !appointmentDate || !appointmentTime) {
    throw new Error('Dados obrigatórios: patientName, patientPhone, appointmentDate, appointmentTime');
  }

  return WhatsAppService.sendAppointmentConfirmation(
    patientName,
    WhatsAppService.formatPhoneNumber(patientPhone),
    appointmentDate,
    appointmentTime
  );
}

// Handler para mensagem genérica
async function handleGenericMessage(data: any): Promise<boolean> {
  const { to, body, mediaUrl } = data;
  
  // Validação
  if (!to || !body) {
    throw new Error('Dados obrigatórios: to, body');
  }

  return WhatsAppService.sendMessage({
    to: `whatsapp:${WhatsAppService.formatPhoneNumber(to)}`,
    body,
    mediaUrl
  });
}

// Endpoint GET para testar a conectividade
export async function GET() {
  try {
    const isConnected = await WhatsAppService.testConnection();
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Conexão com WhatsApp ativa' : 'Falha na conexão',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao testar conexão' },
      { status: 500 }
    );
  }
} 