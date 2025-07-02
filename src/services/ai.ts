// 🤖 Motor de IA para Fisioterapia
export interface PatientProfile {
  age: number;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  painLevel: number;
  lifestyle: 'sedentary' | 'active' | 'very_active';
}

export interface AIRecommendation {
  exercises: string[];
  videos: string[];
  frequency: number;
  duration: number;
  confidence: number;
  reasoning: string;
}

const KNOWLEDGE_BASE = {
  lombalgia: {
    exercises: {
      mild: ['alongamento_lombar', 'ponte_gluteo', 'joelho_peito'],
      moderate: ['prancha_modificada', 'bird_dog', 'cat_cow'],
      severe: ['mobilizacao_suave', 'respiracao', 'posicionamento']
    },
    videos: {
      mild: ['lombar_basico', 'exercicios_casa'],
      moderate: ['core_fortalecimento', 'estabilizacao'],
      severe: ['alivio_dor', 'relaxamento']
    },
    duration: { mild: 4, moderate: 8, severe: 12 }
  },
  cervicalgia: {
    exercises: {
      mild: ['alongamento_cervical', 'rotacao_pescoco'],
      moderate: ['fortalecimento_cervical', 'postura'],
      severe: ['relaxamento_cervical', 'mobilizacao']
    },
    videos: {
      mild: ['cervical_exercicios', 'pescoco_alongamento'],
      moderate: ['cervical_fortalecimento', 'postura_cervical'],
      severe: ['alivio_cervical', 'relaxamento']
    },
    duration: { mild: 3, moderate: 6, severe: 10 }
  }
};

export class AIEngine {
  static generateRecommendation(profile: PatientProfile): AIRecommendation {
    const condition = profile.condition.toLowerCase();
    const knowledge = KNOWLEDGE_BASE[condition as keyof typeof KNOWLEDGE_BASE];
    
    if (!knowledge) {
      return this.getDefaultRecommendation(profile);
    }

    const exercises = knowledge.exercises[profile.severity] || [];
    const videos = knowledge.videos[profile.severity] || [];
    const duration = knowledge.duration[profile.severity] || 6;
    
    // Calcular frequência baseada no perfil
    let frequency = 3;
    if (profile.severity === 'mild') frequency = 2;
    if (profile.severity === 'severe') frequency = 4;
    if (profile.painLevel > 7) frequency = Math.max(2, frequency - 1);
    if (profile.age > 65) frequency = Math.max(2, frequency - 1);
    
    // Ajustar duração baseada na idade e estilo de vida
    let adjustedDuration = duration;
    if (profile.age > 65) adjustedDuration = Math.round(duration * 1.2);
    if (profile.lifestyle === 'very_active') adjustedDuration = Math.round(duration * 0.8);
    if (profile.lifestyle === 'sedentary') adjustedDuration = Math.round(duration * 1.1);
    
    const confidence = this.calculateConfidence(profile, condition);
    const reasoning = this.generateReasoning(profile, frequency, adjustedDuration);
    
    return {
      exercises,
      videos,
      frequency,
      duration: adjustedDuration,
      confidence,
      reasoning
    };
  }

  private static calculateConfidence(profile: PatientProfile, condition: string): number {
    let confidence = 75;
    
    // Condições conhecidas têm maior confiança
    if (KNOWLEDGE_BASE[condition as keyof typeof KNOWLEDGE_BASE]) {
      confidence += 15;
    }
    
    // Perfil completo aumenta confiança
    if (profile.age && profile.severity && profile.painLevel !== undefined) {
      confidence += 10;
    }
    
    // Casos complexos reduzem confiança
    if (profile.age > 75) confidence -= 10;
    if (profile.painLevel > 8) confidence -= 5;
    
    return Math.max(50, Math.min(95, confidence));
  }

  private static generateReasoning(profile: PatientProfile, frequency: number, duration: number): string {
    let reasoning = `Baseado no diagnóstico de ${profile.condition} `;
    reasoning += `(severidade: ${profile.severity}), recomendo `;
    reasoning += `${frequency}x por semana durante ${duration} semanas. `;
    
    if (profile.age > 65) {
      reasoning += `A idade foi considerada para uma progressão mais gradual. `;
    }
    
    if (profile.painLevel > 6) {
      reasoning += `O alto nível de dor (${profile.painLevel}/10) indica necessidade de abordagem conservadora. `;
    }
    
    if (profile.lifestyle === 'sedentary') {
      reasoning += `O estilo de vida sedentário requer atenção especial à motivação e aderência. `;
    }
    
    reasoning += `Recomendação baseada em evidências clínicas.`;
    
    return reasoning;
  }

  private static getDefaultRecommendation(profile: PatientProfile): AIRecommendation {
    return {
      exercises: ['avaliacao_geral', 'exercicios_basicos'],
      videos: ['introducao_fisioterapia'],
      frequency: 2,
      duration: 6,
      confidence: 60,
      reasoning: `Recomendação geral para ${profile.condition}. Avaliação presencial recomendada para protocolo específico.`
    };
  }
} 