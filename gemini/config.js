// Configuração do Gemini para uso gratuito
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Configuração para uso gratuito do Gemini
export const GEMINI_CONFIG = {
  // API Key - deve ser configurada no .env como GEMINI_API_KEY
  apiKey: process.env.GEMINI_API_KEY,
  
  // Modelo gratuito do Gemini
  model: 'gemini-1.5-flash',
  
  // Configurações de rate limiting para uso gratuito
  rateLimits: {
    requestsPerMinute: 60,     // Limite gratuito: 60 RPM
    requestsPerDay: 1000,      // Limite gratuito: 1000 RPD
    tokensPerMinute: 1000000,  // Limite gratuito: 1M TPM
    tokensPerDay: 50000000,    // Limite gratuito: 50M TPD
  },
  
  // Configurações de geração
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
  
  // Configurações de segurança
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

// Inicialização do cliente Gemini
export function initializeGemini() {
  if (!GEMINI_CONFIG.apiKey) {
    throw new Error(
      'GEMINI_API_KEY não encontrada. ' +
      'Por favor, configure sua API key no arquivo .env\n' +
      'Obtenha sua API key gratuita em: https://makersuite.google.com/app/apikey'
    );
  }

  const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_CONFIG.model,
    generationConfig: GEMINI_CONFIG.generationConfig,
    safetySettings: GEMINI_CONFIG.safetySettings,
  });

  return { genAI, model };
}

// Rate limiting helper
class RateLimiter {
  constructor() {
    this.requestTimes = [];
    this.dailyRequestCount = 0;
    this.lastResetDate = new Date().toDateString();
  }

  async checkRateLimit() {
    const now = Date.now();
    const currentDate = new Date().toDateString();
    
    // Reset contador diário se mudou o dia
    if (currentDate !== this.lastResetDate) {
      this.dailyRequestCount = 0;
      this.lastResetDate = currentDate;
    }
    
    // Remove requests antigas (mais de 1 minuto)
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
    
    // Verifica limite por minuto
    if (this.requestTimes.length >= GEMINI_CONFIG.rateLimits.requestsPerMinute) {
      const waitTime = 60000 - (now - this.requestTimes[0]);
      throw new Error(`Rate limit atingido. Aguarde ${Math.ceil(waitTime / 1000)} segundos.`);
    }
    
    // Verifica limite diário
    if (this.dailyRequestCount >= GEMINI_CONFIG.rateLimits.requestsPerDay) {
      throw new Error('Limite diário de requests atingido. Tente novamente amanhã.');
    }
    
    // Registra a request
    this.requestTimes.push(now);
    this.dailyRequestCount++;
  }
}

export const rateLimiter = new RateLimiter(); 