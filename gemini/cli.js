#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeGemini, rateLimiter } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showHelp() {
  console.log(`
${colorize('🤖 Manus Fisio - Gemini CLI', 'cyan')}
${colorize('Análise inteligente do sistema usando IA gratuita', 'blue')}

${colorize('Uso:', 'bright')}
  node gemini/cli.js <comando> [opções]

${colorize('Comandos:', 'bright')}
  ${colorize('setup', 'green')}        Configurar API key
  ${colorize('analyze', 'green')}      Análise completa do sistema
  ${colorize('code', 'green')}         Análise de qualidade do código
  ${colorize('security', 'green')}     Análise de segurança
  ${colorize('performance', 'green')}  Análise de performance
  ${colorize('architecture', 'green')} Análise da arquitetura
  ${colorize('help', 'green')}         Mostrar esta ajuda

${colorize('Opções:', 'bright')}
  --file <path>     Analisar arquivo específico
  --dir <path>      Analisar diretório específico
  --output <path>   Salvar resultado em arquivo
  --verbose         Output detalhado

${colorize('Exemplos:', 'bright')}
  node gemini/cli.js setup
  node gemini/cli.js analyze
  node gemini/cli.js code --file src/app/page.tsx
`);
}

async function setupApiKey() {
  console.log(colorize('\n🔧 Configuração da API Key do Gemini', 'cyan'));
  console.log('Para usar o Gemini gratuitamente, você precisa de uma API key.');
  console.log('1. Acesse: https://makersuite.google.com/app/apikey');
  console.log('2. Faça login com sua conta Google');
  console.log('3. Clique em "Create API Key"');
  console.log('4. Copie a API key gerada');
  console.log('5. Cole ela no arquivo .env como GEMINI_API_KEY=sua_api_key_aqui');
  
  const envPath = path.join(process.cwd(), '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    if (envContent.includes('GEMINI_API_KEY')) {
      console.log(colorize('✅ GEMINI_API_KEY já configurada no .env', 'green'));
    } else {
      await fs.appendFile(envPath, '\n# Gemini AI Configuration\nGEMINI_API_KEY=your_api_key_here\n');
      console.log(colorize('✅ Linha adicionada ao .env. Substitua "your_api_key_here" pela sua API key.', 'yellow'));
    }
  } catch (error) {
    await fs.writeFile(envPath, '# Gemini AI Configuration\nGEMINI_API_KEY=your_api_key_here\n');
    console.log(colorize('✅ Arquivo .env criado. Substitua "your_api_key_here" pela sua API key.', 'yellow'));
  }
}

async function runAnalysis(type, options = {}) {
  try {
    console.log(colorize(`\n🔍 Iniciando análise: ${type}`, 'cyan'));
    
    // Verificar rate limiting
    await rateLimiter.checkRateLimit();
    
    // Inicializar Gemini
    const { model } = initializeGemini();
    
    let result;
    
    switch (type) {
      case 'code':
        result = await analyzeCodeQuality(model, options);
        break;
      case 'security':
        result = await analyzeSecurity(model, options);
        break;
      case 'performance':
        result = await analyzePerformance(model, options);
        break;
      case 'architecture':
        result = await analyzeArchitecture(model, options);
        break;
      case 'analyze':
      case 'all':
        console.log(colorize('🔄 Executando análise completa...', 'yellow'));
        const allResults = await Promise.all([
          analyzeCodeQuality(model, options),
          analyzeSecurity(model, options),
          analyzePerformance(model, options),
          analyzeArchitecture(model, options),
        ]);
        result = {
          timestamp: new Date().toISOString(),
          codeQuality: allResults[0],
          security: allResults[1],
          performance: allResults[2],
          architecture: allResults[3],
        };
        break;
      default:
        throw new Error(`Tipo de análise desconhecido: ${type}`);
    }
    
    // Output do resultado
    if (options.output) {
      const format = options.format || 'json';
      await saveResult(result, options.output, format);
      console.log(colorize(`✅ Resultado salvo em: ${options.output}`, 'green'));
    } else {
      console.log(colorize('\n📊 Resultado da Análise:', 'bright'));
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error(colorize(`❌ Erro na análise: ${error.message}`, 'red'));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function saveResult(result, outputPath, format) {
  let content;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(result, null, 2);
      break;
    case 'md':
      content = generateReport(result, 'markdown');
      break;
    case 'txt':
      content = generateReport(result, 'text');
      break;
    default:
      throw new Error(`Formato não suportado: ${format}`);
  }
  
  await fs.writeFile(outputPath, content, 'utf-8');
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'setup':
      await setupApiKey();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.log(colorize(`Comando "${command}" ainda não implementado. Use "setup" primeiro.`, 'yellow'));
      break;
  }
}

// Executar CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 