# 🆓 Configuração Supabase - Plano Gratuito (Sem Branching)

## ✅ **Decisão Correta:** Seguir sem Database Branching

O Database Branching é uma funcionalidade premium **NÃO essencial** para o projeto Manus Fisio funcionar perfeitamente.

## 🎯 **O que funciona 100% no plano gratuito:**

### ✅ **Funcionalidades Completas:**
- ✅ Banco PostgreSQL robusto
- ✅ Autenticação real com roles
- ✅ APIs REST autogeneradas  
- ✅ Deploy automático do GitHub
- ✅ Real-time subscriptions
- ✅ Storage para arquivos
- ✅ Dashboard administrativo
- ✅ SSL/HTTPS automático

### 📊 **Limites Generosos do Plano Gratuito:**
- **2 projetos** (suficiente)
- **500MB banco** (comporta milhares de registros clínicos)
- **50MB storage** (documentos e imagens básicas)
- **2GB transferência/mês** (OK para desenvolvimento e teste)

## 🚀 **Configuração Rápida (5 passos):**

### **1. Copiar Credenciais**

**Vá para:** Dashboard → Settings → API

Copie:
```
Project URL: https://sua-referencia.supabase.co
anon key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### **2. Atualizar .env.local**

```env
# Credenciais REAIS do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sua-referencia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service

# Configurações básicas
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=qualquer-string-secreta-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Manus Fisio - Gestão Clínica"

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_REALTIME=true

# IMPORTANTE: Comente esta linha para usar dados reais
# NEXT_PUBLIC_MOCK_AUTH=true
```

### **3. Aplicar Schema do Banco**

**Vá para:** Dashboard → SQL Editor

**Execute:** Conteúdo do arquivo `supabase/migrations/20240125000000_initial_schema.sql`

### **4. Configurar RLS (Row Level Security)**

**Execute também:** Conteúdo do arquivo `supabase/migrations/20240125000001_rls_policies.sql`

### **5. Testar Sistema**

```bash
npm run dev
```

## ✅ **Validação (sem branching):**

**Funciona quando:**
1. ✅ Login funciona
2. ✅ Dados persistem no banco
3. ✅ Dashboard mostra dados reais
4. ✅ Não aparece aviso "Mock Data"
5. ✅ Push no GitHub → Deploy automático

## 🔄 **Workflow Simplificado (sem branches):**

```bash
# Desenvolvimento direto no master
git add .
git commit -m "Nova funcionalidade"
git push origin master
# → Deploy automático no Supabase
```

## 🚀 **Quando considerar o plano Pro:**

- **Múltiplos ambientes** (dev/staging/prod)
- **Equipe grande** (5+ desenvolvedores)
- **Banco > 500MB** 
- **Muito tráfego** (>2GB/mês)

## 💡 **Dicas para Maximizar o Plano Gratuito:**

### **Otimizar Banco:**
- Use índices nas consultas frequentes
- Limite registros antigos (soft delete)
- Comprima imagens antes do upload

### **Gerenciar Storage:**
- Use compressão de imagens
- Limite tamanho de uploads
- Considere CDN externo para arquivos grandes

### **Monitorar Uso:**
- Dashboard → Settings → Usage
- Acompanhe mensalmente
- Configure alertas se necessário

## 🎯 **Resultado Final:**

**Sistema 100% funcional:**
- ✅ Dados reais no banco
- ✅ Autenticação completa
- ✅ Deploy automático
- ✅ Todas as funcionalidades do Manus Fisio
- ✅ Zero custo mensal

---

**💰 ECONOMIA:** $0/mês vs $25/mês (Pro plan)  
**📈 FUNCIONALIDADE:** 95% das features funcionam igual  
**🎯 DECISÃO:** Perfeita para começar o projeto! 