import fs from 'fs/promises';
import path from 'path';
import { rateLimiter } from '../config.js';

// Análise de qualidade do código
export async function analyzeCodeQuality(model, options = {}) {
  try {
    console.log('🔍 Analisando qualidade do código...');
    
    // Verificar rate limiting
    await rateLimiter.checkRateLimit();
    
    const files = await getFilesToAnalyze(options);
    const issues = [];
    
    for (const file of files.slice(0, 5)) { // Limitar a 5 arquivos para economizar tokens
      console.log(`📄 Analisando: ${file.path}`);
      
      const analysis = await analyzeFile(model, file);
      if (analysis) {
        issues.push(analysis);
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      type: 'code-quality',
      filesAnalyzed: issues.length,
      issues,
      summary: generateQualitySummary(issues),
    };
    
  } catch (error) {
    console.error('Erro na análise de qualidade:', error.message);
    throw error;
  }
}

async function getFilesToAnalyze(options) {
  const targetDir = options.dir || 'src';
  const files = [];
  
  // Se arquivo específico foi especificado
  if (options.file) {
    const content = await fs.readFile(options.file, 'utf-8');
    return [{ path: options.file, content }];
  }
  
  // Buscar arquivos TypeScript/JavaScript relevantes
  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && shouldAnalyzeFile(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            // Limitar tamanho do arquivo para economizar tokens
            if (content.length < 50000) {
              files.push({ path: fullPath, content });
            }
          } catch (error) {
            console.warn(`Não foi possível ler: ${fullPath}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Não foi possível escanear diretório: ${dir}`);
    }
  }
  
  await scanDirectory(targetDir);
  
  // Priorizar arquivos com mais problemas potenciais (maiores, mais complexos)
  return files
    .sort((a, b) => b.content.length - a.content.length)
    .slice(0, 10); // Limitar a 10 arquivos
}

function shouldSkipDirectory(name) {
  const skipDirs = [
    'node_modules', '.git', '.next', 'dist', 'build', 
    '__tests__', 'coverage', '.cache'
  ];
  return skipDirs.includes(name) || name.startsWith('.');
}

function shouldAnalyzeFile(name) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  return extensions.some(ext => name.endsWith(ext)) && 
         !name.includes('.test.') && 
         !name.includes('.spec.');
}

async function analyzeFile(model, file) {
  try {
    const prompt = `
Analise este arquivo TypeScript/React e identifique problemas de qualidade:

**Arquivo:** ${file.path}

**Código:**
\`\`\`typescript
${file.content.slice(0, 8000)} // Limitando para economizar tokens
\`\`\`

Por favor, analise e identifique:

1. **Erros de TypeScript:** Tipos ausentes, any implícitos, erros de sintaxe
2. **Problemas de Performance:** Re-renders desnecessários, memorização ausente
3. **Código Duplicado:** Lógica repetida que pode ser extraída
4. **Complexidade:** Funções muito longas ou complexas
5. **Melhores Práticas:** Violações de padrões React/Next.js
6. **Acessibilidade:** Problemas de a11y em componentes UI
7. **Segurança:** Vulnerabilidades potenciais

Formato da resposta em JSON:
{
  "issues": [
    {
      "type": "typescript|performance|duplication|complexity|practices|accessibility|security",
      "severity": "high|medium|low",
      "line": number,
      "description": "Descrição do problema",
      "suggestion": "Como corrigir"
    }
  ],
  "score": number, // 0-100, qualidade geral do arquivo
  "summary": "Resumo dos principais problemas"
}
`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        file: file.path,
        ...analysis
      };
    }
    
  } catch (error) {
    console.warn(`Erro ao analisar ${file.path}:`, error.message);
    return null;
  }
}

function generateQualitySummary(issues) {
  const totalIssues = issues.reduce((sum, file) => sum + (file.issues?.length || 0), 0);
  const avgScore = issues.reduce((sum, file) => sum + (file.score || 0), 0) / issues.length;
  
  const issuesByType = {};
  const issuesBySeverity = { high: 0, medium: 0, low: 0 };
  
  issues.forEach(file => {
    file.issues?.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
    });
  });
  
  return {
    totalIssues,
    averageScore: Math.round(avgScore),
    issuesByType,
    issuesBySeverity,
    recommendations: generateRecommendations(issuesByType, issuesBySeverity)
  };
}

function generateRecommendations(byType, bySeverity) {
  const recommendations = [];
  
  if (bySeverity.high > 0) {
    recommendations.push('🔴 Prioridade ALTA: Corrigir problemas críticos primeiro');
  }
  
  if (byType.typescript > 5) {
    recommendations.push('📝 Melhorar tipagem TypeScript - muitos tipos ausentes');
  }
  
  if (byType.performance > 3) {
    recommendations.push('⚡ Otimizar performance - revisar re-renders e memorização');
  }
  
  if (byType.complexity > 2) {
    recommendations.push('🧹 Refatorar funções complexas em componentes menores');
  }
  
  if (byType.accessibility > 0) {
    recommendations.push('♿ Melhorar acessibilidade - adicionar ARIA labels e navegação por teclado');
  }
  
  return recommendations;
} 