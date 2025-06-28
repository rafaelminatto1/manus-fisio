#!/usr/bin/env node

import { initializeGemini, rateLimiter } from './config.js';
import fs from 'fs/promises';
import path from 'path';

// Script simplificado para análise rápida
async function quickAnalyze(targetFile) {
  try {
    console.log('🚀 Iniciando análise rápida com Gemini...');
    
    // Verificar rate limiting
    await rateLimiter.checkRateLimit();
    
    // Inicializar Gemini
    const { model } = initializeGemini();
    
    // Ler arquivo alvo
    const filePath = targetFile || 'src/app/page.tsx';
    console.log(`📄 Analisando: ${filePath}`);
    
    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`❌ Não foi possível ler o arquivo: ${filePath}`);
      console.log('💡 Verifique se o caminho está correto ou use: node gemini/quick-analyze.js <caminho-do-arquivo>');
      return;
    }
    
    // Limitar conteúdo para economizar tokens
    const limitedContent = content.slice(0, 6000);
    if (content.length > 6000) {
      console.log(`⚠️  Arquivo muito grande, analisando apenas os primeiros 6000 caracteres`);
    }
    
    const prompt = `
Analise este código TypeScript/React e forneça uma análise rápida:

**Arquivo:** ${filePath}

**Código:**
\`\`\`typescript
${limitedContent}
\`\`\`

Por favor, forneça:

1. **Problemas Críticos** (🔴): Erros que impedem funcionamento
2. **Problemas de Performance** (⚡): Issues que afetam velocidade  
3. **Melhorias de Código** (📝): Sugestões para qualidade
4. **Score Geral** (0-100): Qualidade do código

Seja direto e prático. Foque nos 3-5 problemas mais importantes.
`;

    console.log('🤖 Processando com Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANÁLISE RÁPIDA - GEMINI AI');
    console.log('='.repeat(60));
    console.log(response);
    console.log('\n' + '='.repeat(60));
    
    // Salvar resultado
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputFile = `gemini/reports/quick-analysis-${timestamp}.md`;
    
    await fs.mkdir('gemini/reports', { recursive: true });
    await fs.writeFile(outputFile, `# Análise Rápida - ${filePath}\n\n${response}`, 'utf-8');
    
    console.log(`💾 Relatório salvo em: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('\n💡 Para configurar sua API key gratuita:');
      console.log('1. Execute: node gemini/cli.js setup');
      console.log('2. Obtenha sua key em: https://makersuite.google.com/app/apikey');
    }
  }
}

// Executar análise
const targetFile = process.argv[2];
quickAnalyze(targetFile).catch(console.error); 