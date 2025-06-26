# ⚡ Configuração Rápida - GitHub + Supabase Integrados

## ✅ **Status:** Integração GitHub-Supabase funcionando!

### 🚀 **Próximos Passos Imediatos**

## **1. Habilitar Branching no Supabase (IMPORTANTE)**

1. No painel Supabase → **clique no botão "Enable branching"** (topo da página)
2. Isso permitirá ambientes separados por branch

## **2. Copiar Credenciais do Supabase**

**Vá para:** Dashboard → Settings → API

Copie estas 3 informações:
```
Project URL: https://....supabase.co
anon key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## **3. Atualizar .env.local no Projeto**

Edite o arquivo `.env.local`:

```env
# SUBSTITUA pelas credenciais REAIS do painel Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_aqui

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_secret_aqui

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Manus Fisio - Gestão Clínica"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_REALTIME=true

# Development
NODE_ENV=development

# IMPORTANTE: REMOVA ou comente esta linha para usar dados reais:
# NEXT_PUBLIC_MOCK_AUTH=true
```

## **4. Aplicar Schema do Banco (Manual)**

**Vá para:** Dashboard → SQL Editor

**Execute este script** (está no arquivo `supabase/migrations/20240125000000_initial_schema.sql`):

```sql
-- Este é o conteúdo do arquivo de migration
-- Copie e cole o conteúdo completo do arquivo no SQL Editor
```

## **5. Testar o Sistema**

```bash
# Restart o servidor para pegar as novas variáveis
npm run dev
```

**Acesse:** http://localhost:3000

**O que deve funcionar:**
- ✅ Não aparecer mais o aviso de "Mock Data"
- ✅ Login real funcionando
- ✅ Dados persistindo no banco
- ✅ Dashboard com estatísticas reais

## **6. Testar Deploy Automático**

```bash
# Fazer uma mudança e enviar para GitHub
git add .
git commit -m "🔧 Configuração Supabase completa"
git push origin master
```

**Resultado:** Deploy automático no Supabase!

## 🔧 **Localizar Informações no Dashboard**

### Credenciais (Settings → API):
- Project URL
- anon key 
- service_role key

### Reference ID (Settings → General):
- Para conectar CLI futuramente

### Database (Database → Connection string):
- Para conexões diretas se necessário

## ✅ **Validação Final**

**Sistema funcionando quando:**
1. ✅ Login funciona sem erro
2. ✅ Dados salvam no banco
3. ✅ Dashboard mostra estatísticas reais
4. ✅ Não aparece aviso de Mock Data
5. ✅ Push no GitHub → Deploy automático

## 🚨 **Se Algo Der Errado**

### Erro de Conexão:
- Verificar se as URLs estão corretas no .env.local
- Confirmar que não há espaços extras nas chaves

### Tabelas não existem:
- Aplicar o script SQL manualmente no painel
- Verificar se todas as migrations foram executadas

### Login não funciona:
- Verificar se NEXT_PUBLIC_MOCK_AUTH está comentado
- Confirmar se as chaves estão corretas

---

**🎯 RESULTADO ESPERADO:**
Sistema 100% funcional com dados reais + Deploy automático GitHub ↔ Supabase! 