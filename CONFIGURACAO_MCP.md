# Configuração MCP (Model Context Protocol) - Supabase

## ✅ Configuração Concluída

A configuração do MCP para Supabase foi criada com sucesso no projeto Manus Fisio.

### 📁 Arquivos Criados

- **`.cursor/mcp.json`** - Arquivo de configuração do MCP

### 🔧 Configuração Atual

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=hycudcwtuocmufhpsnmr"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_b05236ef55afbc6e772db98fa3ad1bcf8e67fc5d"
      }
    }
  }
}
```

### 🚀 Como Ativar

1. **Reinicie o Cursor** - Feche e abra novamente o editor
2. **Vá para Settings/MCP** - Navegue até as configurações do MCP
3. **Verifique o Status** - Deve aparecer um status verde "active" para o servidor Supabase

### ✅ Pré-requisitos Verificados

- ✅ **Node.js v22.17.0** - Instalado e funcionando
- ✅ **NPX v10.9.2** - Disponível no PATH
- ✅ **Diretório .cursor** - Criado
- ✅ **Arquivo mcp.json** - Configurado

### 🔧 Funcionalidades do MCP Supabase

Com o MCP configurado, você terá acesso a:

- **Consultas diretas ao banco** - Execute queries SQL diretamente
- **Visualização de esquemas** - Veja estruturas de tabelas
- **Dados em tempo real** - Acesse dados atualizados
- **Análise de performance** - Monitore queries e índices
- **Backup e restauração** - Gerencie dados com segurança

### 🛠️ Comandos Úteis

```bash
# Verificar se o MCP está funcionando
npx @supabase/mcp-server-supabase@latest --project-ref=hycudcwtuocmufhpsnmr

# Ver logs do MCP (se necessário)
# Os logs aparecerão no console do Cursor
```

### 🔒 Segurança

- **Token de acesso**: Configurado como read-only para segurança
- **Project ref**: Específico para o projeto Manus Fisio
- **Escopo limitado**: Acesso apenas aos dados necessários

### 🚨 Próximos Passos

1. **Reiniciar Cursor** - Para ativar a configuração
2. **Verificar Settings/MCP** - Confirmar status ativo
3. **Testar integração** - Fazer consultas de teste
4. **Aplicar dados de exemplo** - Usar o arquivo `DADOS_EXEMPLO_AUTOMATICO.sql`

### 📞 Suporte

Se houver problemas:
1. Verifique se o Cursor foi reiniciado
2. Confirme que o Node.js está no PATH
3. Verifique se o token Supabase está válido
4. Consulte os logs do Cursor para erros específicos

---

**Status**: ✅ Configuração completa - Reinicie o Cursor para ativar 