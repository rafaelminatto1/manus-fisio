# 🤖 Manus Fisio - Gemini CLI

Análise inteligente do sistema usando **Google Gemini AI** de forma **gratuita**.

## 🚀 Configuração Rápida

### 1. Obter API Key Gratuita

```bash
# Configurar automaticamente
npm run gemini:setup
```

**Ou manualmente:**

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a API key gerada
5. Adicione no arquivo `.env`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=sua_api_key_aqui
```

### 2. Verificar Instalação

```bash
npm run gemini:help
```

## 🔍 Análise Rápida

### Analisar arquivo específico:
```bash
# Arquivo específico
npm run gemini:analyze src/app/page.tsx

# Usar script diretamente
node gemini/quick-analyze.js src/components/ui/button.tsx
```

### Analisar arquivo padrão (page.tsx):
```bash
npm run gemini:analyze
```

## 📊 Tipos de Análise

### 🔴 Problemas Críticos
- Erros de TypeScript
- Problemas de sintaxe
- Imports quebrados
- Hooks mal utilizados

### ⚡ Performance
- Re-renders desnecessários
- Memorização ausente
- Loops ineficientes
- Bundle size

### 📝 Qualidade de Código
- Tipos implícitos `any`
- Código duplicado
- Complexidade excessiva
- Convenções de nomenclatura

### 🛡️ Segurança
- XSS vulnerabilities
- Dados sensíveis expostos
- Validação insuficiente

## 💡 Exemplos de Uso

### Análise de Componente UI
```bash
node gemini/quick-analyze.js src/components/ui/analytics-dashboard.tsx
```

### Análise de Página Principal
```bash
node gemini/quick-analyze.js src/app/page.tsx
```

### Análise de Hook Customizado
```bash
node gemini/quick-analyze.js src/hooks/use-auth.tsx
```

## 📋 Limites Gratuitos

O Gemini 1.5 Flash tem os seguintes limites **gratuitos**:

- ✅ **15 requests/minuto**
- ✅ **1.500 requests/dia**
- ✅ **1 milhão tokens/minuto**
- ✅ **50 milhões tokens/dia**

> 💡 **Dica:** O CLI automaticamente gerencia rate limiting para evitar exceder os limites.

## 📁 Estrutura dos Relatórios

Os relatórios são salvos em `gemini/reports/` com timestamp:

```
gemini/
├── reports/
│   ├── quick-analysis-2024-01-25T14-30-00.md
│   ├── quick-analysis-2024-01-25T15-15-30.md
│   └── ...
├── config.js          # Configuração do Gemini
├── cli.js             # CLI principal
├── quick-analyze.js   # Análise rápida
└── README.md          # Este arquivo
```

## 🎯 Foco da Análise

O Gemini está configurado para focar especificamente em:

1. **Erros do projeto atual** (179+ erros TypeScript)
2. **Performance React/Next.js**
3. **Práticas de segurança**
4. **Qualidade de código**
5. **Acessibilidade (a11y)**

## 🚨 Solução de Problemas

### Erro: "GEMINI_API_KEY não encontrada"
```bash
# Execute a configuração
npm run gemini:setup

# Ou adicione manualmente no .env
echo "GEMINI_API_KEY=sua_key_aqui" >> .env
```

### Erro: "Rate limit atingido"
```bash
# Aguarde 1 minuto e tente novamente
# O CLI mostra quanto tempo esperar
```

### Arquivo muito grande
```bash
# O CLI automaticamente analisa apenas os primeiros 6000 caracteres
# Para arquivos grandes, considere analisar seções específicas
```

## 🔧 Configuração Avançada

### Personalizar Rate Limiting
Edite `gemini/config.js`:

```javascript
rateLimits: {
  requestsPerMinute: 10,    // Reduzir para ser mais conservador
  requestsPerDay: 1000,     // Reduzir limite diário
  // ...
}
```

### Personalizar Prompts
Edite `gemini/quick-analyze.js` para personalizar o prompt de análise.

## 📈 Próximos Passos

Com o Gemini configurado, você pode:

1. **Análise de arquivos críticos** com muitos erros
2. **Revisão de componentes complexos** (page.tsx com 1041 linhas)
3. **Verificação de segurança** em componentes de autenticação
4. **Otimização de performance** em dashboards pesados

## 🆘 Ajuda

```bash
# Ver todos os comandos disponíveis
npm run gemini:help

# Ver este README
cat gemini/README.md
```

---

**💚 Gemini 1.5 Flash é gratuito e poderoso** - perfeito para análise contínua de código! 