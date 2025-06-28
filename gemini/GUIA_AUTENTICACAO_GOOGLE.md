# 🔐 Guia de Autenticação Google - Gemini CLI Gratuito

## 🎯 Objetivo
Obter uma **API Key gratuita** do Google Gemini para usar no seu projeto.

## 📋 Pré-requisitos
- ✅ Conta Google (Gmail)
- ✅ Navegador web
- ✅ 5 minutos de tempo

---

## 🚀 Passo a Passo Completo

### 1️⃣ **Acessar o Google AI Studio**

```
🌐 Link direto: https://makersuite.google.com/app/apikey
```

**Ou navegar manualmente:**
1. Acesse: https://ai.google.dev/
2. Clique em **"Get started"**
3. Clique em **"Get API key"**

### 2️⃣ **Fazer Login com Google**

1. **Clique em "Sign in"** no canto superior direito
2. **Escolha sua conta Google** (Gmail)
3. **Digite sua senha** se solicitado
4. **Aceite os termos** de uso do Google AI

### 3️⃣ **Criar Nova API Key**

1. Na página de API Keys, clique em **"Create API Key"**
2. **Escolha um projeto:**
   - **Opção 1:** Selecione projeto existente
   - **Opção 2:** Clique em **"Create API key in new project"** (recomendado)

3. **Configure o projeto** (se criando novo):
   - Nome: `Manus-Fisio-AI` 
   - Região: Mantenha padrão
   - Clique em **"Create"**

### 4️⃣ **Copiar a API Key**

1. **Sua API key aparecerá** na tela (algo como: `AIzaSyD...`)
2. **Clique no ícone de copiar** 📋
3. **⚠️ IMPORTANTE:** Salve em local seguro - não será mostrada novamente

### 5️⃣ **Verificar Limites Gratuitos**

✅ **Gemini 1.5 Flash (Gratuito):**
- 15 requests por minuto
- 1.500 requests por dia  
- 1 milhão tokens por minuto
- 50 milhões tokens por dia

---

## 🔧 Configuração no Projeto

### **Configurar API Key no .env**

```bash
# Abrir arquivo .env no editor
code .env

# OU editar manualmente e substituir:
GEMINI_API_KEY=sua_api_key_copiada_aqui
```

**Exemplo:**
```env
# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Verificar Configuração**

```bash
# Testar se está funcionando
node gemini/quick-analyze.js src/components/ui/button.tsx
```

**✅ Sucesso:** Você verá a análise do Gemini  
**❌ Erro:** "GEMINI_API_KEY não encontrada"

---

## 🧪 Primeiro Teste

### **Análise de Arquivo Pequeno**
```bash
# Testar com componente simples
node gemini/quick-analyze.js src/components/ui/button.tsx
```

### **Análise do Arquivo Problemático**
```bash
# Analisar o page.tsx (1041 linhas!)
node gemini/quick-analyze.js src/app/page.tsx
```

### **Output Esperado:**
```
🚀 Iniciando análise rápida com Gemini...
📄 Analisando: src/components/ui/button.tsx
🤖 Processando com Gemini...

============================================================
📊 ANÁLISE RÁPIDA - GEMINI AI
============================================================

## Score Geral: 85/100

✅ Componente bem estruturado!

### Pontos Positivos:
- Tipagem TypeScript completa
- Uso correto de Radix UI
- Acessibilidade implementada

### Melhorias Sugeridas:
- Adicionar documentação JSDoc
- Implementar forwardRef

============================================================

💾 Relatório salvo em: gemini/reports/quick-analysis-2024-01-25T15-30-15.md
```

---

## 🚨 Solução de Problemas

### **Erro: "API key not found"**
```bash
# Verificar se está no .env
cat .env | grep GEMINI

# Deve mostrar:
# GEMINI_API_KEY=AIzaSyD...
```

### **Erro: "API key invalid"**
```bash
# Verificar se copiou corretamente
# A key deve começar com: AIzaSy...
# E ter cerca de 39 caracteres
```

### **Erro: "Quota exceeded"**
```bash
# Aguardar reset dos limites:
# Por minuto: aguarde 1 minuto
# Por dia: aguarde até meia-noite UTC
```

### **Erro: "Project not found"**
```bash
# Verificar se o projeto existe no Google Cloud Console
# Ou criar nova API key em projeto diferente
```

---

## 💡 Dicas Importantes

### **Segurança**
- ✅ **Nunca commite** a API key no Git
- ✅ **Use apenas no .env** (já está no .gitignore)  
- ✅ **Não compartilhe** a key publicamente

### **Uso Eficiente**
- ✅ **Análise por demanda** - não automatize demais
- ✅ **Priorize arquivos problemáticos** primeiro
- ✅ **Use rate limiting** automático do CLI

### **Monitoramento**
```bash
# Ver quantas requests usou hoje
# (não há comando direto, mas monitore manualmente)

# Usar análise estratégica:
# 1. Arquivos com mais erros primeiro
# 2. Componentes críticos
# 3. Performance bottlenecks
```

---

## 🎯 Próximos Passos

### **Análise Imediata dos Problemas Críticos:**

```bash
# 1. Arquivo gigante (1041 linhas)
node gemini/quick-analyze.js src/app/page.tsx

# 2. Hook de autenticação com problemas
node gemini/quick-analyze.js src/hooks/use-auth.tsx

# 3. Componente iOS com caracteres malformados
node gemini/quick-analyze.js src/components/ui/ios-push-notifications.tsx

# 4. Dashboard analytics (pesado)
node gemini/quick-analyze.js src/components/ui/analytics-dashboard.tsx
```

### **Workflow Recomendado:**

```bash
# Análise semanal dos arquivos principais
node gemini/quick-analyze.js src/app/page.tsx > relatorio-page-$(date +%Y%m%d).md
node gemini/quick-analyze.js src/hooks/use-auth.tsx > relatorio-auth-$(date +%Y%m%d).md
```

---

## ✨ Resultado Final

Após completar este guia, você terá:

✅ **Conta Google autenticada** para Gemini  
✅ **API Key gratuita** configurada  
✅ **Gemini CLI funcionando** no projeto  
✅ **Análise de IA** para resolver os 179+ erros TypeScript  
✅ **Relatórios automáticos** de qualidade de código  

---

## 🆘 Suporte

**Se encontrar problemas:**

1. **Verificar configuração:**
   ```bash
   npm run gemini:help
   ```

2. **Testar conectividade:**
   ```bash
   node gemini/quick-analyze.js --help
   ```

3. **Documentação adicional:**
   - 📖 [gemini/README.md](README.md)
   - 🔧 [gemini/CONFIGURACAO_COMPLETA.md](CONFIGURACAO_COMPLETA.md)

---

**🎯 Em 5 minutos você terá IA analisando seu código gratuitamente!** 