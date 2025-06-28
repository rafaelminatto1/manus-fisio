#!/usr/bin/env node

import { initializeGemini } from './config.js';

// Script para testar a autenticação do Gemini
async function testAuth() {
  console.log('🔍 Testando autenticação do Google Gemini...\n');
  
  try {
    // Tentar inicializar o Gemini
    console.log('1️⃣ Verificando configuração...');
    const { model } = initializeGemini();
    console.log('✅ Configuração OK - Gemini inicializado\n');
    
    // Teste simples de conectividade
    console.log('2️⃣ Testando conectividade com Google AI...');
    const prompt = "Responda apenas com: 'Autenticação Google funcionando!'";
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Conectividade OK\n');
    console.log('📋 Resposta do Gemini:');
    console.log(`"${response}"\n`);
    
    // Teste de análise de código simples
    console.log('3️⃣ Testando análise de código...');
    const codeTest = `
const example = () => {
  console.log("Hello World");
};
`;
    
    const codePrompt = `Analise este código JavaScript e diga se está correto: ${codeTest}`;
    const codeResult = await model.generateContent(codePrompt);
    const codeResponse = codeResult.response.text();
    
    console.log('✅ Análise de código OK\n');
    console.log('📋 Análise:');
    console.log(codeResponse.slice(0, 200) + '...\n');
    
    console.log('🎉 SUCESSO! Gemini CLI está funcionando perfeitamente!');
    console.log('\n🚀 Próximos passos:');
    console.log('   npm run gemini:analyze src/app/page.tsx');
    console.log('   node gemini/quick-analyze.js src/components/ui/button.tsx');
    
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('\n💡 Solução:');
      console.log('1. Acesse: https://makersuite.google.com/app/apikey');
      console.log('2. Crie uma API key');
      console.log('3. Substitua no arquivo .env:');
      console.log('   GEMINI_API_KEY=sua_api_key_real');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Solução:');
      console.log('1. Verifique se a API key está correta no .env');
      console.log('2. A key deve começar com "AIzaSy..."');
      console.log('3. Verifique se não há espaços extras');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('\n💡 Solução:');
      console.log('1. Aguarde 1 minuto (limite: 15 requests/minuto)');
      console.log('2. Ou aguarde até meia-noite UTC (limite diário)');
    } else {
      console.log('\n💡 Solução:');
      console.log('1. Verifique sua conexão com internet');
      console.log('2. Tente novamente em alguns minutos');
      console.log('3. Verifique se a API key não expirou');
    }
  }
}

// Executar teste
testAuth().catch(console.error); 