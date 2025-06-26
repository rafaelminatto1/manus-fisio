# Guia para Criar Usuário Administrador - Rafael Minatto

## 🎯 **Objetivo**
Criar conta de administrador para `rafael.minatto@yahoo.com.br` no sistema Manus Fisio.

## 📋 **Passos para Criação**

### **Método 1: Via Supabase Dashboard (Recomendado)**

1. **Acesse o Supabase Dashboard**:
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `hycudcwtuocmufhpsnmr`

2. **Navegue para Authentication**:
   - No menu lateral: `Authentication` → `Users`
   - Clique em `Add User`

3. **Preencha os dados**:
   ```
   Email: rafael.minatto@yahoo.com.br
   Password: Yukari30@
   Email Confirm: ✅ (marcado)
   Auto Confirm User: ✅ (marcado)
   ```

4. **Execute o SQL**:
   - Após criar no Auth, execute o arquivo `CRIAR_USUARIO_ADMIN.sql`
   - Isso adicionará o usuário na tabela `users` com role `admin`

### **Método 2: Via SQL Editor**

1. **Execute primeiro**: `CRIAR_USUARIO_ADMIN.sql`
2. **Depois faça login**: O sistema criará automaticamente na tabela auth

### **Método 3: Via Interface do Sistema**

1. **Acesse**: http://localhost:3000
2. **Clique em "Sign Up"** (se houver)
3. **Cadastre-se** com:
   ```
   Email: rafael.minatto@yahoo.com.br
   Senha: Yukari30@
   ```
4. **Execute o SQL** para tornar admin

## 🔧 **Scripts Disponíveis**

### **1. CRIAR_USUARIO_ADMIN.sql**
- Adiciona usuário na tabela `users`
- Define role como `admin`
- Configura dados do perfil

### **2. Verificação**
```sql
SELECT * FROM users WHERE email = 'rafael.minatto@yahoo.com.br';
```

## ✅ **Verificação Final**

Após a criação, verifique:

1. **Login funciona** em http://localhost:3000
2. **Role é 'admin'** na tabela users
3. **Acesso completo** a todas as funcionalidades

## 🔐 **Credenciais**

```
Email: rafael.minatto@yahoo.com.br
Senha: Yukari30@
Role: admin
```

## 🚨 **Importante**

- ⚠️ **Senha segura**: Mantenha as credenciais em local seguro
- 🔒 **Acesso total**: Usuário admin tem acesso completo ao sistema
- 📧 **Email único**: Certifique-se de que o email não existe em outro usuário

## 🎯 **Próximos Passos**

1. Executar `CRIAR_USUARIO_ADMIN.sql`
2. Criar conta no Supabase Auth (método 1)
3. Fazer login no sistema
4. Verificar acesso administrativo

---

**Status**: 📝 Pronto para execução 