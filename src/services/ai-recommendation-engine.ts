/**
 * 🤖 AI Recommendation Engine para Fisioterapia
 * Sistema inteligente de recomendações baseado em evidências clínicas
 */

export interface PatientProfile {
  age: number;
  gender: 'M' | 'F' | 'Other';
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  painLevel: number; // 0-10
  mobilityLevel: 'low' | 'medium' | 'high';
  previousTreatments?: string[];
  comorbidities?: string[];
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
  riskFactors: RiskFactor[];
  confidenceScore: number; // 0-100
  reasoning: string;
}

export interface ProgressionStep {
  week: number;
  phase: 'initial' | 'intermediate' | 'advanced' | 'maintenance';
  exercises: string[];
  intensity: number; // 1-10
  modifications: string[];
}

export interface ExpectedOutcome {
  metric: 'pain_reduction' | 'mobility_improvement' | 'strength_gain' | 'function_improvement';
  expectedImprovement: number; // percentage
  timeframe: number; // weeks
  confidence: number; // 0-100
}

export interface RiskFactor {
  factor: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigation: string[];
}

/**
 * Base de conhecimento clínico para recomendações
 */
const CLINICAL_KNOWLEDGE_BASE = {
  // Lombalgia
  lombalgia: {
    exercises: {
      mild: [
        'alongamento_gato_camelo',
        'inclinacao_pelvica',
        'joelho_peito',
        'rotacao_lombar_suave'
      ],
      moderate: [
        'ponte_gluteo',
        'prancha_modificada',
        'bird_dog',
        'alongamento_piriforme'
      ],
      severe: [
        'mobilizacao_suave',
        'respiracao_diafragmatica',
        'posicionamento_alivio',
        'caminhada_assistida'
      ]
    },
    videos: {
      mild: ['lombar_alongamento_basico', 'exercicios_lombar_casa'],
      moderate: ['fortalecimento_core', 'estabilizacao_lombar'],
      severe: ['alivio_dor_lombar', 'posicionamento_lombar']
    },
    expectedDuration: { mild: 4, moderate: 8, severe: 12 },
    successRate: { mild: 85, moderate: 78, severe: 65 }
  },

  // Cervicalgia
  cervicalgia: {
    exercises: {
      mild: [
        'alongamento_cervical_lateral',
        'rotacao_cervical',
        'flexao_extensao_cervical',
        'alongamento_trapezio'
      ],
      moderate: [
        'fortalecimento_cervical_isometrico',
        'mobilizacao_escapular',
        'correcao_postural',
        'alongamento_escalenos'
      ],
      severe: [
        'relaxamento_cervical',
        'posicionamento_cervical',
        'mobilizacao_suave',
        'tecnicas_respiracao'
      ]
    },
    videos: {
      mild: ['cervical_alongamento', 'exercicios_pescoco'],
      moderate: ['fortalecimento_cervical', 'postura_cervical'],
      severe: ['alivio_cervical', 'relaxamento_pescoco']
    },
    expectedDuration: { mild: 3, moderate: 6, severe: 10 },
    successRate: { mild: 90, moderate: 82, severe: 70 }
  },

  // Ombro
  ombro: {
    exercises: {
      mild: [
        'pendulo_codman',
        'alongamento_capsular',
        'mobilizacao_escapular',
        'exercicios_amplitude'
      ],
      moderate: [
        'fortalecimento_manguito',
        'exercicios_proprioceptivos',
        'estabilizacao_escapular',
        'alongamento_especifico'
      ],
      severe: [
        'mobilizacao_passiva',
        'exercicios_assistidos',
        'crioterapia_funcional',
        'posicionamento_ombro'
      ]
    },
    videos: {
      mild: ['ombro_amplitude', 'mobilizacao_ombro'],
      moderate: ['fortalecimento_ombro', 'manguito_rotador'],
      severe: ['reabilitacao_ombro', 'ombro_pos_cirurgia']
    },
    expectedDuration: { mild: 6, moderate: 12, severe: 16 },
    successRate: { mild: 80, moderate: 75, severe: 60 }
  },

  // Joelho
  joelho: {
    exercises: {
      mild: [
        'fortalecimento_quadriceps',
        'alongamento_isquiotibiais',
        'mobilizacao_patela',
        'exercicios_proprioceptivos'
      ],
      moderate: [
        'agachamento_funcional',
        'fortalecimento_gluteo',
        'exercicios_cadeia_fechada',
        'treino_equilibrio'
      ],
      severe: [
        'mobilizacao_passiva',
        'exercicios_isometricos',
        'descarga_parcial',
        'crioterapia_ativa'
      ]
    },
    videos: {
      mild: ['joelho_fortalecimento', 'exercicios_joelho'],
      moderate: ['reabilitacao_joelho', 'joelho_funcional'],
      severe: ['joelho_pos_lesao', 'recuperacao_joelho']
    },
    expectedDuration: { mild: 8, moderate: 14, severe: 20 },
    successRate: { mild: 85, moderate: 70, severe: 55 }
  }
};

/**
 * Fatores de modificação baseados no perfil do paciente
 */
const MODIFICATION_FACTORS = {
  age: {
    young: (age: number) => age < 30 ? 1.1 : 1.0, // Recuperação mais rápida
    middle: (age: number) => age >= 30 && age < 60 ? 1.0 : 1.0,
    senior: (age: number) => age >= 60 ? 0.8 : 1.0 // Recuperação mais lenta
  },
  lifestyle: {
    sedentary: 0.8,
    active: 1.0,
    very_active: 1.2
  },
  comorbidities: {
    diabetes: 0.9,
    hypertension: 0.95,
    arthritis: 0.85,
    fibromyalgia: 0.7
  }
};

/**
 * Motor de recomendações de IA
 */
export class AIRecommendationEngine {
  
  /**
   * Gera recomendação completa de tratamento
   */
  static generateRecommendation(profile: PatientProfile): TreatmentRecommendation {
    const baseRecommendation = this.getBaseRecommendation(profile);
    const modifiedRecommendation = this.applyModifications(baseRecommendation, profile);
    const progressionPlan = this.generateProgressionPlan(modifiedRecommendation, profile);
    const expectedOutcomes = this.calculateExpectedOutcomes(profile);
    const riskFactors = this.assessRiskFactors(profile);
    
    return {
      ...modifiedRecommendation,
      progressionPlan,
      expectedOutcomes,
      riskFactors,
      confidenceScore: this.calculateConfidence(profile),
      reasoning: this.generateReasoning(profile, modifiedRecommendation)
    };
  }

  /**
   * Obtém recomendação base da base de conhecimento
   */
  private static getBaseRecommendation(profile: PatientProfile) {
    const condition = profile.condition.toLowerCase();
    const knowledge = CLINICAL_KNOWLEDGE_BASE[condition as keyof typeof CLINICAL_KNOWLEDGE_BASE];
    
    if (!knowledge) {
      return this.getGenericRecommendation(profile);
    }

    const severity = profile.severity;
    
    return {
      exerciseIds: knowledge.exercises[severity] || [],
      videoIds: knowledge.videos[severity] || [],
      frequency: this.calculateFrequency(profile),
      duration: knowledge.expectedDuration[severity] || 8
    };
  }

  /**
   * Aplica modificações baseadas no perfil do paciente
   */
  private static applyModifications(baseRec: any, profile: PatientProfile) {
    const modifiedRec = { ...baseRec };

    // Modificação por idade
    const ageModifier = profile.age < 30 ? 1.1 : profile.age > 60 ? 0.8 : 1.0;
    
    // Modificação por estilo de vida
    const lifestyleModifier = MODIFICATION_FACTORS.lifestyle[profile.lifestyle];
    
    // Modificação por comorbidades
    let comorbidityModifier = 1.0;
    if (profile.comorbidities) {
      profile.comorbidities.forEach(condition => {
        const modifier = MODIFICATION_FACTORS.comorbidities[condition as keyof typeof MODIFICATION_FACTORS.comorbidities];
        if (modifier) comorbidityModifier *= modifier;
      });
    }

    // Aplicar modificações
    const totalModifier = ageModifier * lifestyleModifier * comorbidityModifier;
    modifiedRec.duration = Math.round(modifiedRec.duration / totalModifier);
    modifiedRec.frequency = this.adjustFrequency(modifiedRec.frequency, profile);

    return modifiedRec;
  }

  /**
   * Calcula frequência ideal baseada no perfil
   */
  private static calculateFrequency(profile: PatientProfile): number {
    let baseFrequency = 3; // 3x por semana como padrão

    // Ajustes baseados na severidade
    switch (profile.severity) {
      case 'mild':
        baseFrequency = 2;
        break;
      case 'moderate':
        baseFrequency = 3;
        break;
      case 'severe':
        baseFrequency = 4;
        break;
    }

    // Ajustes baseados no nível de dor
    if (profile.painLevel > 7) baseFrequency = Math.max(2, baseFrequency - 1);
    if (profile.painLevel < 3) baseFrequency = Math.min(5, baseFrequency + 1);

    return baseFrequency;
  }

  /**
   * Ajusta frequência baseada em fatores adicionais
   */
  private static adjustFrequency(baseFreq: number, profile: PatientProfile): number {
    let adjustedFreq = baseFreq;

    // Ajuste por estilo de vida
    if (profile.lifestyle === 'sedentary') adjustedFreq = Math.max(2, adjustedFreq - 1);
    if (profile.lifestyle === 'very_active') adjustedFreq = Math.min(5, adjustedFreq + 1);

    // Ajuste por idade
    if (profile.age > 65) adjustedFreq = Math.max(2, adjustedFreq - 1);

    return adjustedFreq;
  }

  /**
   * Gera plano de progressão por fases
   */
  private static generateProgressionPlan(recommendation: any, profile: PatientProfile): ProgressionStep[] {
    const totalWeeks = recommendation.duration;
    const phases = this.calculatePhases(totalWeeks);
    
    return phases.map((phase, index) => ({
      week: phase.startWeek,
      phase: phase.phase,
      exercises: this.selectExercisesForPhase(recommendation.exerciseIds, phase.phase),
      intensity: this.calculateIntensity(phase.phase, profile),
      modifications: this.generateModifications(phase.phase, profile)
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
        { phase: 'advanced' as const, startWeek: 8 },
        { phase: 'maintenance' as const, startWeek: Math.max(12, totalWeeks - 2) }
      ];
    }
  }

  /**
   * Seleciona exercícios apropriados para cada fase
   */
  private static selectExercisesForPhase(allExercises: string[], phase: string): string[] {
    // Lógica simplificada - em produção seria mais sofisticada
    const phaseMultiplier = {
      'initial': 0.6,
      'intermediate': 0.8,
      'advanced': 1.0,
      'maintenance': 0.7
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
      'advanced': 7,
      'maintenance': 6
    };

    let intensity = baseIntensities[phase as keyof typeof baseIntensities];

    // Ajustes baseados no perfil
    if (profile.painLevel > 6) intensity = Math.max(2, intensity - 2);
    if (profile.lifestyle === 'very_active') intensity = Math.min(8, intensity + 1);
    if (profile.age > 65) intensity = Math.max(3, intensity - 1);

    return intensity;
  }

  /**
   * Gera modificações específicas para cada fase
   */
  private static generateModifications(phase: string, profile: PatientProfile): string[] {
    const modifications: string[] = [];

    // Modificações baseadas na idade
    if (profile.age > 65) {
      modifications.push('Progressão mais lenta', 'Aquecimento prolongado', 'Monitoramento cardíaco');
    }

    // Modificações baseadas no nível de dor
    if (profile.painLevel > 6) {
      modifications.push('Interromper se dor aumentar', 'Aplicar gelo após exercícios', 'Reduzir amplitude se necessário');
    }

    // Modificações baseadas na fase
    switch (phase) {
      case 'initial':
        modifications.push('Foco na educação do paciente', 'Estabelecer confiança', 'Movimentos suaves');
        break;
      case 'intermediate':
        modifications.push('Aumentar progressivamente', 'Introduzir resistência', 'Monitorar fadiga');
        break;
      case 'advanced':
        modifications.push('Exercícios funcionais', 'Simulação de atividades diárias', 'Treino de resistência');
        break;
      case 'maintenance':
        modifications.push('Programa domiciliar', 'Exercícios preventivos', 'Revisões periódicas');
        break;
    }

    return modifications;
  }

  /**
   * Calcula resultados esperados
   */
  private static calculateExpectedOutcomes(profile: PatientProfile): ExpectedOutcome[] {
    const condition = profile.condition.toLowerCase();
    const knowledge = CLINICAL_KNOWLEDGE_BASE[condition as keyof typeof CLINICAL_KNOWLEDGE_BASE];
    
    const baseSuccessRate = knowledge?.successRate[profile.severity] || 70;
    
    // Ajustes baseados no perfil
    let adjustedSuccessRate = baseSuccessRate;
    if (profile.age < 30) adjustedSuccessRate += 10;
    if (profile.age > 65) adjustedSuccessRate -= 15;
    if (profile.lifestyle === 'very_active') adjustedSuccessRate += 5;
    if (profile.lifestyle === 'sedentary') adjustedSuccessRate -= 10;

    return [
      {
        metric: 'pain_reduction',
        expectedImprovement: Math.min(90, adjustedSuccessRate),
        timeframe: Math.ceil((knowledge?.expectedDuration[profile.severity] || 8) * 0.6),
        confidence: Math.min(95, adjustedSuccessRate + 5)
      },
      {
        metric: 'mobility_improvement',
        expectedImprovement: Math.min(85, adjustedSuccessRate - 5),
        timeframe: knowledge?.expectedDuration[profile.severity] || 8,
        confidence: Math.min(90, adjustedSuccessRate)
      },
      {
        metric: 'function_improvement',
        expectedImprovement: Math.min(80, adjustedSuccessRate - 10),
        timeframe: Math.ceil((knowledge?.expectedDuration[profile.severity] || 8) * 1.2),
        confidence: Math.min(85, adjustedSuccessRate - 5)
      }
    ];
  }

  /**
   * Avalia fatores de risco
   */
  private static assessRiskFactors(profile: PatientProfile): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    // Risco por idade
    if (profile.age > 65) {
      riskFactors.push({
        factor: 'Idade avançada',
        riskLevel: 'medium',
        mitigation: ['Progressão mais lenta', 'Monitoramento cardiovascular', 'Prevenção de quedas']
      });
    }

    // Risco por nível de dor
    if (profile.painLevel > 7) {
      riskFactors.push({
        factor: 'Dor intensa',
        riskLevel: 'high',
        mitigation: ['Controle da dor antes dos exercícios', 'Modificação de intensidade', 'Reavaliação frequente']
      });
    }

    // Risco por comorbidades
    if (profile.comorbidities?.includes('diabetes')) {
      riskFactors.push({
        factor: 'Diabetes',
        riskLevel: 'medium',
        mitigation: ['Monitoramento glicêmico', 'Cuidado com feridas', 'Hidratação adequada']
      });
    }

    // Risco por estilo de vida
    if (profile.lifestyle === 'sedentary') {
      riskFactors.push({
        factor: 'Sedentarismo',
        riskLevel: 'medium',
        mitigation: ['Progressão muito gradual', 'Educação sobre atividade física', 'Motivação constante']
      });
    }

    return riskFactors;
  }

  /**
   * Calcula confiança da recomendação
   */
  private static calculateConfidence(profile: PatientProfile): number {
    let confidence = 80; // Base

    // Ajustes baseados na qualidade dos dados
    if (profile.condition && profile.severity && profile.painLevel !== undefined) {
      confidence += 10;
    }

    // Ajustes baseados na condição
    const commonConditions = ['lombalgia', 'cervicalgia', 'ombro', 'joelho'];
    if (commonConditions.includes(profile.condition.toLowerCase())) {
      confidence += 10;
    }

    // Ajustes baseados na complexidade
    if (profile.comorbidities && profile.comorbidities.length > 2) {
      confidence -= 15;
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
    
    reasoning += `Esta recomendação é baseada em evidências clínicas e protocolos estabelecidos para ${condition}.`;
    
    return reasoning;
  }

  /**
   * Recomendação genérica para condições não mapeadas
   */
  private static getGenericRecommendation(profile: PatientProfile) {
    return {
      exerciseIds: ['avaliacao_geral', 'exercicios_basicos', 'alongamento_geral'],
      videoIds: ['introducao_fisioterapia', 'exercicios_gerais'],
      frequency: 2,
      duration: 6
    };
  }

  /**
   * Atualiza recomendação baseada no progresso
   */
  static updateRecommendationBasedOnProgress(
    currentRecommendation: TreatmentRecommendation,
    progressData: {
      painReduction: number;
      mobilityImprovement: number;
      adherence: number;
      weeksCompleted: number;
    }
  ): TreatmentRecommendation {
    const updatedRecommendation = { ...currentRecommendation };

    // Se progresso for melhor que esperado, acelerar
    if (progressData.painReduction > 50 && progressData.weeksCompleted < 4) {
      updatedRecommendation.duration = Math.max(
        updatedRecommendation.duration - 2,
        4
      );
    }

    // Se progresso for menor que esperado, estender
    if (progressData.painReduction < 20 && progressData.weeksCompleted > 4) {
      updatedRecommendation.duration += 2;
    }

    // Ajustar frequência baseada na aderência
    if (progressData.adherence < 60) {
      updatedRecommendation.frequency = Math.max(
        updatedRecommendation.frequency - 1,
        2
      );
    }

    return updatedRecommendation;
  }
} 