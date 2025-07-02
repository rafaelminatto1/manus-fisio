import twilio from 'twilio';

// Tipos para as mensagens
export interface WhatsAppMessage {
  to: string; // Número de destino no formato: whatsapp:+5511999999999
  body: string; // Texto da mensagem
  mediaUrl?: string; // URL da mídia (imagem, pdf, etc.)
}

export interface AppointmentReminder {
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  clinicAddress?: string;
}

export interface ExercisePrescription {
  patientName: string;
  patientPhone: string;
  exercises: string[];
  notes?: string;
}

// Configuração do cliente Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Serviço para gerenciar comunicação via WhatsApp
 */
export class WhatsAppService {
  private static readonly FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  /**
   * Envia uma mensagem genérica via WhatsApp
   */
  static async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const result = await client.messages.create({
        from: this.FROM_NUMBER,
        to: message.to,
        body: message.body,
        ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] })
      });

      console.log(`✅ Mensagem WhatsApp enviada: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia lembrete de consulta
   */
  static async sendAppointmentReminder(reminder: AppointmentReminder): Promise<boolean> {
    const message = this.formatAppointmentMessage(reminder);
    
    return this.sendMessage({
      to: `whatsapp:${reminder.patientPhone}`,
      body: message
    });
  }

  /**
   * Envia prescrição de exercícios
   */
  static async sendExercisePrescription(prescription: ExercisePrescription): Promise<boolean> {
    const message = this.formatExerciseMessage(prescription);
    
    return this.sendMessage({
      to: `whatsapp:${prescription.patientPhone}`,
      body: message
    });
  }

  /**
   * Envia confirmação de agendamento
   */
  static async sendAppointmentConfirmation(
    patientName: string,
    patientPhone: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<boolean> {
    const message = `🗓️ *Consulta Confirmada!*

Olá, ${patientName}! 

Sua consulta foi confirmada para:
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}

Chegue com 10 minutos de antecedência.

Se precisar reagendar, entre em contato conosco.

_Manus Fisio - Cuidando da sua saúde! 💪_`;

    return this.sendMessage({
      to: `whatsapp:${patientPhone}`,
      body: message
    });
  }

  /**
   * Formata mensagem de lembrete de consulta
   */
  private static formatAppointmentMessage(reminder: AppointmentReminder): string {
    return `🏥 *Lembrete de Consulta*

Olá, ${reminder.patientName}! 

Você tem uma consulta agendada:
📅 *Data:* ${reminder.appointmentDate}
⏰ *Horário:* ${reminder.appointmentTime}
🏢 *Local:* ${reminder.clinicName}
${reminder.clinicAddress ? `📍 *Endereço:* ${reminder.clinicAddress}` : ''}

⚠️ *Importante:*
• Chegue com 10 minutos de antecedência
• Traga seus exames recentes
• Use roupas confortáveis

Para cancelar ou reagendar, responda esta mensagem.

_Manus Fisio - Estamos te esperando! 💪_`;
  }

  /**
   * Formata mensagem de prescrição de exercícios
   */
  private static formatExerciseMessage(prescription: ExercisePrescription): string {
    const exerciseList = prescription.exercises
      .map((exercise, index) => `${index + 1}. ${exercise}`)
      .join('\n');

    return `💪 *Seus Exercícios Prescritos*

Olá, ${prescription.patientName}! 

Aqui estão os exercícios recomendados para o seu tratamento:

📋 *EXERCÍCIOS:*
${exerciseList}

${prescription.notes ? `📝 *Observações:*\n${prescription.notes}\n` : ''}
⚠️ *Importante:*
• Execute os exercícios conforme orientado
• Em caso de dor, pare imediatamente
• Dúvidas? Responda esta mensagem

🎯 *Dica:* Pratique regularmente para melhores resultados!

_Manus Fisio - Seu bem-estar em primeiro lugar! 🌟_`;
  }

  /**
   * Valida se um número de telefone está no formato correto
   */
  static validatePhoneNumber(phone: string): boolean {
    // Remove espaços, parênteses e traços
    const cleanPhone = phone.replace(/[\s\(\)\-]/g, '');
    
    // Verifica se é um número brasileiro válido
    const brazilianPhoneRegex = /^(\+55|55|0)?([1-9]{2})(9?[0-9]{8})$/;
    
    return brazilianPhoneRegex.test(cleanPhone);
  }

  /**
   * Formata número de telefone para o padrão WhatsApp
   */
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[\s\(\)\-]/g, '');
    
    // Se não começar com +55, adiciona
    if (!cleanPhone.startsWith('+55')) {
      return `+55${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Testa a conectividade com a API da Twilio
   */
  static async testConnection(): Promise<boolean> {
    try {
      await client.api.accounts.list({ limit: 1 });
      console.log('✅ Conexão com Twilio estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro de conexão com Twilio:', error);
      return false;
    }
  }
}

export default WhatsAppService; 