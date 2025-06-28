# 🚀 Guia Prático - CLIs Vercel & Supabase

## ✅ Status das Instalações

- ✅ **Vercel CLI**: v44.2.7 (instalado globalmente)
- ✅ **Supabase CLI**: v2.26.9 (disponível via npx)

---

## 🔗 **Vercel CLI - Deploy e Hospedagem**

### **Primeiro Login:**
```bash
# Fazer login na Vercel
npm run vercel:login
# OU
vercel login
```

### **Deploy do Projeto:**
```bash
# Deploy de desenvolvimento
npm run vercel:deploy
# OU
vercel

# Deploy para produção
npm run vercel:prod  
# OU
vercel --prod
```

### **Comandos Úteis:**
```bash
# Ver status do projeto
vercel ls

# Ver logs em tempo real
vercel logs

# Gerenciar variáveis de ambiente
vercel env ls                    # Listar
vercel env add GEMINI_API_KEY    # Adicionar
vercel env rm GEMINI_API_KEY     # Remover

# Ver domínios
vercel domains ls

# Ver deployments
vercel ls
```

---

## 🗄️ **Supabase CLI - Banco de Dados**

### **Verificar Status:**
```bash
npm run supabase:status
# OU
npx supabase status
```

### **Gerar Types TypeScript:**
```bash
# Atualizar tipos do banco
npm run supabase:types
# OU
npx supabase gen types typescript --project-id hycudcwtuocmufahpsnmr --schema public > src/types/database.types.ts
```

### **Comandos de Banco:**
```bash
# Reset do banco (cuidado!)
npm run supabase:reset

# Ver migrations
npx supabase db diff

# Aplicar migrations
npx supabase db push

# Fazer backup
npx supabase db dump > backup.sql

# Executar SQL
npx supabase db query "SELECT * FROM users;"
```

### **Desenvolvimento Local:**
```bash
# Iniciar ambiente local do Supabase
npx supabase start

# Parar ambiente local
npx supabase stop

# Logs do ambiente local
npx supabase logs
```

---

## 🛠️ **Scripts NPM Configurados**

### **Vercel:**
```bash
npm run vercel:deploy      # Deploy para desenvolvimento
npm run vercel:prod        # Deploy para produção  
npm run vercel:login       # Login na Vercel
```

### **Supabase:**
```bash
npm run supabase:status    # Ver status do projeto
npm run supabase:types     # Gerar types TypeScript
npm run supabase:reset     # Reset do banco (cuidado!)
```

### **Gemini (já configurado):**
```bash
npm run gemini:test        # Testar autenticação
npm run gemini:analyze     # Analisar código
npm run gemini:setup       # Configurar API key
```

---

## 🚀 **Workflow Recomendado**

### **1. Desenvolvimento Local:**
```bash
# Iniciar desenvolvimento
npm run dev

# Verificar banco
npm run supabase:status

# Testar IA
npm run gemini:test
```

### **2. Deploy para Produção:**
```bash
# Build local
npm run build

# Gerar types atualizados
npm run supabase:types

# Deploy para produção
npm run vercel:prod
```

### **3. Monitoramento:**
```bash
# Ver logs do deploy
vercel logs

# Ver status do banco
npm run supabase:status

# Analisar código com IA
npm run gemini:analyze src/app/page.tsx
```

---

## 🔧 **Configurações Importantes**

### **Variáveis de Ambiente na Vercel:**
```bash
# Adicionar variáveis importantes
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
```

### **Sincronizar .env com Vercel:**
```bash
# Baixar variáveis da Vercel
vercel env pull .env.local

# Ver diferenças
vercel env ls
```

---

## 📊 **Comandos de Monitoramento**

### **Performance:**
```bash
# Analisar bundle
npm run build && npx @next/bundle-analyzer

# Lighthouse via Vercel
vercel --prod && echo "Deploy realizado, verificar Lighthouse no dashboard"
```

### **Database Health:**
```bash
# Ver conexões ativas
npx supabase db query "SELECT count(*) FROM pg_stat_activity;"

# Ver tamanho do banco
npx supabase db query "SELECT pg_size_pretty(pg_database_size('postgres'));"
```

### **Análise de Código:**
```bash
# Analisar arquivos problemáticos
npm run gemini:analyze src/app/page.tsx
npm run gemini:analyze src/hooks/use-auth.tsx
npm run gemini:analyze src/components/ui/analytics-dashboard.tsx
```

---

## 🚨 **Troubleshooting**

### **Vercel Issues:**
```bash
# Login expirado
vercel login

# Cache issues
vercel --force

# Ver logs detalhados
vercel logs --follow
```

### **Supabase Issues:**
```bash
# Reconectar
npx supabase login

# Verificar conexão
npx supabase projects list

# Reset types
npm run supabase:types
```

### **Build Issues:**
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 🎯 **Próximos Passos**

### **Deploy Imediato:**
```bash
# 1. Build e test local
npm run build
npm run test

# 2. Deploy para produção
npm run vercel:prod

# 3. Verificar saúde do sistema
npm run supabase:status
npm run gemini:test
```

### **Desenvolvimento Contínuo:**
```bash
# Análise semanal com IA
npm run gemini:analyze src/app/page.tsx

# Atualizar types mensalmente
npm run supabase:types

# Monitor deploy contínuo
npm run deploy:check
```

---

## 📚 **Links Úteis**

- 🚀 **Vercel Dashboard**: https://vercel.com/dashboard
- 🗄️ **Supabase Dashboard**: https://app.supabase.com/
- 🤖 **Google AI Studio**: https://makersuite.google.com/
- 📖 **Vercel Docs**: https://vercel.com/docs
- 📖 **Supabase Docs**: https://supabase.com/docs

---

**🎉 Agora você tem todos os CLIs necessários para deploy, gerenciamento de banco e análise de IA!** 