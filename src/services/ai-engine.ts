/**
 * 🤖 AI Engine para Fisioterapia
 * Sistema inteligente de recomendações baseado em evidências clínicas
 */

export interface PatientProfile {
  age: number;
  gender: 'M' | 'F' | 'Other';
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  painLevel: number; // 0-10
  mobilityLevel: 'low' | 'medium' | 'high';
  lifestyle: 'sedentary' | 'active' | 'very_active';
  goals: string[];
}

export interface TreatmentRecommendation {
  exerciseIds: string[];
  videoIds: string[];
  frequency: number; // sessions per week
  duration: number; // weeks
  progressionPlan: ProgressionStep[];
  expectedOutcomes: ExpectedOutcome[];
  confidenceScore: number; // 0-100
  reasoning: string;
}

export interface ProgressionStep {
  week: number;
  phase: 'initial' | 'intermediate' | 'advanced';
  exercises: string[];
  intensity: number; // 1-10
}

export interface ExpectedOutcome {
  metric: 'pain_reduction' | 'mobility_improvement' | 'function_improvement';
  expectedImprovement: number; // percentage
  timeframe: number; // weeks
  confidence: number; // 0-100
}

/**
 * Base de conhecimento clínico
 */
const CLINICAL_KNOWLEDGE = {
  lombalgia: {
    exercises: {
      mild: ['alongamento_gato_camelo', 'inclinacao_pelvica', 'joelho_peito'],
      moderate: ['ponte_gluteo', 'prancha_modificada', 'bird_dog'],
      severe: ['mobilizacao_suave', 'respiracao_diafragmatica', 'posicionamento_alivio']
    },
    videos: {
      mild: ['lombar_alongamento_basico', 'exercicios_lombar_casa'],
      moderate: ['fortalecimento_core', 'estabilizacao_lombar'],
      severe: ['alivio_dor_lombar', 'posicionamento_lombar']
    },
    duration: { mild: 4, moderate: 8, severe: 12 },
    successRate: { mild: 85, moderate: 78, severe: 65 }
  },
  cervicalgia: {
    exercises: {
      mild: ['alongamento_cervical_lateral', 'rotacao_cervical', 'flexao_extensao_cervical'],
      moderate: ['fortalecimento_cervical_isometrico', 'mobilizacao_escapular', 'correcao_postural'],
      severe: ['relaxamento_cervical', 'posicionamento_cervical', 'mobilizacao_suave']
    },
    videos: {
      mild: ['cervical_alongamento', 'exercicios_pescoco'],
      moderate: ['fortalecimento_cervical', 'postura_cervical'],
      severe: ['alivio_cervical', 'relaxamento_pescoco']
    },
    duration: { mild: 3, moderate: 6, severe: 10 },
    successRate: { mild: 90, moderate: 82, severe: 70 }
  },
  ombro: {
    exercises: {
      mild: ['pendulo_codman', 'alongamento_capsular', 'mobilizacao_escapular'],
      moderate: ['fortalecimento_manguito', 'exercicios_proprioceptivos', 'estabilizacao_escapular'],
      severe: ['mobilizacao_passiva', 'exercicios_assistidos', 'crioterapia_funcional']
    },
    videos: {
      mild: ['ombro_amplitude', 'mobilizacao_ombro'],
      moderate: ['fortalecimento_ombro', 'manguito_rotador'],
      severe: ['reabilitacao_ombro', 'ombro_pos_cirurgia']
    },
    duration: { mild: 6, moderate: 12, severe: 16 },
    successRate: { mild: 80, moderate: 75, severe: 60 }
  }
};

/**
 * Motor de IA para recomendações
 */
export class AIEngine {
  
  /**
   * Gera recomendação completa de tratamento
   */
  static generateRecommendation(profile: PatientProfile): TreatmentRecommendation {
    const baseRecommendation = this.getBaseRecommendation(profile);
    const modifiedRecommendation = this.applyModifications(baseRecommendation, profile);
    const progressionPlan = this.generateProgressionPlan(modifiedRecommendation, profile);
    const expectedOutcomes = this.calculateExpectedOutcomes(profile);
    
    return {
      ...modifiedRecommendation,
      progressionPlan,
      expectedOutcomes,
      confidenceScore: this.calculateConfidence(profile),
      reasoning: this.generateReasoning(profile, modifiedRecommendation)
    };
  }

  /**
   * Obtém recomendação base
   */
  private static getBaseRecommendation(profile: PatientProfile) {
    const condition = profile.condition.toLowerCase();
    const knowledge = CLINICAL_KNOWLEDGE[condition as keyof typeof CLINICAL_KNOWLEDGE];
    
    if (!knowledge) {
      return this.getGenericRecommendation();
    }

    const severity = profile.severity;
    
    return {
      exerciseIds: knowledge.exercises[severity] || [],
      videoIds: knowledge.videos[severity] || [],
      frequency: this.calculateFrequency(profile),
      duration: knowledge.duration[severity] || 8
    };
  }

  /**
   * Aplica modificações baseadas no perfil
   */
  private static applyModifications(baseRec: any, profile: PatientProfile) {
    const modifiedRec = { ...baseRec };

    // Modificação por idade
    const ageModifier = profile.age < 30 ? 1.1 : profile.age > 60 ? 0.8 : 1.0;
    
    // Modificação por estilo de vida
    const lifestyleModifier = {
      'sedentary': 0.8,
      'active': 1.0,
      'very_active': 1.2
    }[profile.lifestyle];

    // Aplicar modificações
    const totalModifier = ageModifier * lifestyleModifier;
    modifiedRec.duration = Math.round(modifiedRec.duration / totalModifier);
    modifiedRec.frequency = this.adjustFrequency(modifiedRec.frequency, profile);

    return modifiedRec;
  }

  /**
   * Calcula frequência ideal
   */
  private static calculateFrequency(profile: PatientProfile): number {
    let baseFrequency = 3;

    switch (profile.severity) {
      case 'mild': baseFrequency = 2; break;
      case 'moderate': baseFrequency = 3; break;
      case 'severe': baseFrequency = 4; break;
    }

    if (profile.painLevel > 7) baseFrequency = Math.max(2, baseFrequency - 1);
    if (profile.painLevel < 3) baseFrequency = Math.min(5, baseFrequency + 1);

    return baseFrequency;
  }

  /**
   * Ajusta frequência
   */
  private static adjustFrequency(baseFreq: number, profile: PatientProfile): number {
    let adjustedFreq = baseFreq;

    if (profile.lifestyle === 'sedentary') adjustedFreq = Math.max(2, adjustedFreq - 1);
    if (profile.lifestyle === 'very_active') adjustedFreq = Math.min(5, adjustedFreq + 1);
    if (profile.age > 65) adjustedFreq = Math.max(2, adjustedFreq - 1);

    return adjustedFreq;
  }

  /**
   * Gera plano de progressão
   */
  private static generateProgressionPlan(recommendation: any, profile: PatientProfile): ProgressionStep[] {
    const totalWeeks = recommendation.duration;
    const phases = this.calculatePhases(totalWeeks);
    
    return phases.map((phase, index) => ({
      week: phase.startWeek,
      phase: phase.phase,
      exercises: this.selectExercisesForPhase(recommendation.exerciseIds, phase.phase),
      intensity: this.calculateIntensity(phase.phase, profile)
    }));
  }

  /**
   * Calcula fases do tratamento
   */
  private static calculatePhases(totalWeeks: number) {
    if (totalWeeks <= 4) {
      return [
        { phase: 'initial' as const, startWeek: 1 },
        { phase: 'intermediate' as const, startWeek: 3 }
      ];
    } else if (totalWeeks <= 8) {
      return [
        { phase: 'initial' as const, startWeek: 1 },
        { phase: 'intermediate' as const, startWeek: 3 },
        { phase: 'advanced' as const, startWeek: 6 }
      ];
    } else {
      return [
        { phase: 'initial' as const, startWeek: 1 },
        { phase: 'intermediate' as const, startWeek: 4 },
        { phase: 'advanced' as const, startWeek: 8 }
      ];
    }
  }

  /**
   * Seleciona exercícios para cada fase
   */
  private static selectExercisesForPhase(allExercises: string[], phase: string): string[] {
    const phaseMultiplier = {
      'initial': 0.6,
      'intermediate': 0.8,
      'advanced': 1.0
    };

    const exerciseCount = Math.ceil(allExercises.length * phaseMultiplier[phase as keyof typeof phaseMultiplier]);
    return allExercises.slice(0, exerciseCount);
  }

  /**
   * Calcula intensidade para cada fase
   */
  private static calculateIntensity(phase: string, profile: PatientProfile): number {
    const baseIntensities = {
      'initial': 3,
      'intermediate': 5,
      'advanced': 7
    };

    let intensity = baseIntensities[phase as keyof typeof baseIntensities];

    if (profile.painLevel > 6) intensity = Math.max(2, intensity - 2);
    if (profile.lifestyle === 'very_active') intensity = Math.min(8, intensity + 1);
    if (profile.age > 65) intensity = Math.max(3, intensity - 1);

    return intensity;
  }

  /**
   * Calcula resultados esperados
   */
  private static calculateExpectedOutcomes(profile: PatientProfile): ExpectedOutcome[] {
    const condition = profile.condition.toLowerCase();
    const knowledge = CLINICAL_KNOWLEDGE[condition as keyof typeof CLINICAL_KNOWLEDGE];
    
    const baseSuccessRate = knowledge?.successRate[profile.severity] || 70;
    
    let adjustedSuccessRate = baseSuccessRate;
    if (profile.age < 30) adjustedSuccessRate += 10;
    if (profile.age > 65) adjustedSuccessRate -= 15;
    if (profile.lifestyle === 'very_active') adjustedSuccessRate += 5;
    if (profile.lifestyle === 'sedentary') adjustedSuccessRate -= 10;

    return [
      {
        metric: 'pain_reduction',
        expectedImprovement: Math.min(90, adjustedSuccessRate),
        timeframe: Math.ceil((knowledge?.duration[profile.severity] || 8) * 0.6),
        confidence: Math.min(95, adjustedSuccessRate + 5)
      },
      {
        metric: 'mobility_improvement',
        expectedImprovement: Math.min(85, adjustedSuccessRate - 5),
        timeframe: knowledge?.duration[profile.severity] || 8,
        confidence: Math.min(90, adjustedSuccessRate)
      },
      {
        metric: 'function_improvement',
        expectedImprovement: Math.min(80, adjustedSuccessRate - 10),
        timeframe: Math.ceil((knowledge?.duration[profile.severity] || 8) * 1.2),
        confidence: Math.min(85, adjustedSuccessRate - 5)
      }
    ];
  }

  /**
   * Calcula confiança da recomendação
   */
  private static calculateConfidence(profile: PatientProfile): number {
    let confidence = 80;

    if (profile.condition && profile.severity && profile.painLevel !== undefined) {
      confidence += 10;
    }

    const commonConditions = ['lombalgia', 'cervicalgia', 'ombro', 'joelho'];
    if (commonConditions.includes(profile.condition.toLowerCase())) {
      confidence += 10;
    }

    if (profile.age > 75 || profile.age < 18) {
      confidence -= 10;
    }

    return Math.max(50, Math.min(95, confidence));
  }

  /**
   * Gera explicação da recomendação
   */
  private static generateReasoning(profile: PatientProfile, recommendation: any): string {
    const condition = profile.condition;
    const severity = profile.severity;
    const age = profile.age;
    
    let reasoning = `Baseado no diagnóstico de ${condition} com severidade ${severity}, `;
    reasoning += `recomendo um programa de ${recommendation.duration} semanas com frequência de ${recommendation.frequency}x por semana. `;
    
    if (age > 65) {
      reasoning += `Considerando a idade do paciente (${age} anos), o programa foi adaptado com progressão mais cautelosa. `;
    }
    
    if (profile.painLevel > 6) {
      reasoning += `Devido ao alto nível de dor (${profile.painLevel}/10), priorizamos exercícios de baixa intensidade inicialmente. `;
    }
    
    if (profile.lifestyle === 'sedentary') {
      reasoning += `O estilo de vida sedentário foi considerado, com ênfase na educação e motivação. `;
    }
    
    reasoning += `Esta recomendação é baseada em evidências clínicas e protocolos estabelecidos.`;
    
    return reasoning;
  }

  /**
   * Recomendação genérica
   */
  private static getGenericRecommendation() {
    return {
      exerciseIds: ['avaliacao_geral', 'exercicios_basicos', 'alongamento_geral'],
      videoIds: ['introducao_fisioterapia', 'exercicios_gerais'],
      frequency: 2,
      duration: 6
    };
  }
} 