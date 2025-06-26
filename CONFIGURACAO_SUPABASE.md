# 🚀 Configuração Supabase - Manus Fisio

## ✅ Configurações Corretas Confirmadas

As configurações na imagem estão **PERFEITAS** para o projeto:
- ✅ Data API + Connection String
- ✅ Use public schema for Data API  
- ✅ Postgres (Default)

## 📋 Passos Após Criar o Projeto

### 1. **Copiar Credenciais do Supabase**

Após criar o projeto, você verá:
```
Project URL: https://sua-chave-projeto.supabase.co
anon key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
service_role key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 2. **Atualizar .env.local**

Edite o arquivo `.env.local` no projeto:

```env
# Substitua pelas suas credenciais REAIS
NEXT_PUBLIC_SUPABASE_URL=https://sua-chave-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Remova esta linha para usar dados reais
# NEXT_PUBLIC_MOCK_AUTH=true
```

### 3. **Aplicar Migrations do Banco**

Execute os comandos:

```bash
# Navegar para pasta supabase
cd supabase

# Conectar ao projeto (use a Project Reference do dashboard)
supabase link --project-ref SUA_PROJECT_REF

# Aplicar todas as migrations
supabase db push
```

### 4. **Testar Conexão**

```bash
# Voltar para a raiz do projeto
cd ..

# Iniciar servidor
npm run dev

# Testar login (agora funcionará com dados reais!)
```

## 🔧 **Localizar Informações no Dashboard**

### Project Reference (para o link):
- Dashboard → Settings → General → Reference ID

### URLs e Chaves:
- Dashboard → Settings → API

### Banco de Dados:
- Dashboard → Database → Connection string

## ✅ **Validação Final**

Depois de configurar, teste:

1. **Login funciona** sem modo mock
2. **Dados persistem** no banco
3. **Dashboard mostra** estatísticas reais
4. **Não aparece** o aviso de "Mock Data"

## 🚨 **Se Algo Der Errado**

### Erro de Conexão:
```bash
# Verificar se as URLs estão corretas
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Tabelas não existem:
```bash
# Verificar migrations aplicadas
supabase db diff --use-migra
```

### Problemas de Auth:
- Verificar se RLS está configurado nas tabelas
- Confirmar se o schema público está habilitado

---

**🎯 RESULTADO ESPERADO:**
Sistema funcionando 100% com dados reais, sem mocks, conectado ao Supabase em produção! 