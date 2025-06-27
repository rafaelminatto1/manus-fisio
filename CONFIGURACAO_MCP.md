# Configuração MCP (Model Context Protocol) - Manus Fisio

## 🚀 Visão Geral

O sistema Manus Fisio agora possui integração completa com o Model Context Protocol (MCP) da Vercel, permitindo que assistentes de IA interajam diretamente com o sistema de gestão da clínica de fisioterapia.

## 📋 Recursos Implementados

### 🔧 Ferramentas Disponíveis

#### 📅 **Gestão de Agenda**
- `get_calendar_events` - Busca eventos do calendário
- `create_calendar_event` - Cria novos agendamentos

#### 👥 **Gestão de Pacientes**
- `search_patients` - Busca pacientes por nome, email ou telefone
- `create_patient` - Cadastra novos pacientes

#### 📋 **Gestão de Tarefas**
- `get_tasks` - Lista tarefas da equipe com filtros
- `create_task` - Cria novas tarefas

#### 📊 **Analytics e Monitoramento**
- `get_dashboard_stats` - Estatísticas gerais da clínica
- `system_health_check` - Verificação de saúde do sistema

## 🛠️ Configuração Técnica

### 1. Dependências Instaladas

```json
{
  "@vercel/mcp-adapter": "^1.0.0",
  "ai": "^4.3.16",
  "zod": "^3.25.67"
}
```

### 2. Endpoint MCP

**URL**: `https://manus-odxhfxdmj-rafael-minattos-projects.vercel.app/api/mcp/[transport]`

Suporta os seguintes transportes:
- `http` - Protocolo HTTP moderno (recomendado)
- `sse` - Server-Sent Events (compatibilidade)

### 3. Configuração do Vercel

```json
{
  "functions": {
    "src/app/api/mcp/**/*.ts": {
      "maxDuration": 60,
      "memory": 512
    }
  },
  "headers": [
    {
      "source": "/api/mcp/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

## 🔗 Como Conectar ao MCP

### Para Cursor AI

1. Abra as configurações do Cursor
2. Vá para **Settings** → **MCP** → **Add new global MCP server**
3. Adicione a seguinte configuração:

```json
{
  "mcpServers": {
    "Manus Fisio": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://manus-odxhfxdmj-rafael-minattos-projects.vercel.app/api/mcp/sse"
      ]
    }
  }
}
```

### Para Desenvolvimento Local

```javascript
import { experimental_createMCPClient as createMcpClient } from 'ai';

const client = await createMcpClient({
  name: 'manus-fisio',
  transport: {
    type: 'sse',
    url: 'https://manus-odxhfxdmj-rafael-minattos-projects.vercel.app/api/mcp/sse'
  }
});
```

## 💡 Exemplos de Uso

### 1. Buscar Eventos do Dia

```
"Liste todos os agendamentos de hoje na clínica"
```

### 2. Cadastrar Novo Paciente

```
"Cadastre um novo paciente: João Silva, email joao@email.com, telefone (11) 99999-9999"
```

### 3. Criar Tarefa Urgente

```
"Crie uma tarefa urgente: Verificar equipamento de ultrassom, atribuir para o admin"
```

### 4. Verificar Status do Sistema

```
"Verifique o status de saúde do sistema Manus Fisio"
```

## 🔒 Segurança e Autenticação

- **Autenticação**: Utiliza Service Role Key do Supabase
- **CORS**: Configurado para permitir acesso de assistentes IA
- **Rate Limiting**: Máximo 60 segundos por requisição
- **Validação**: Schemas Zod para validação de dados

## 📊 Monitoramento

### Logs da Vercel
- Acesse: https://vercel.com/dashboard
- Monitore chamadas MCP em tempo real
- Verifique performance e erros

### Health Check
```bash
curl https://manus-odxhfxdmj-rafael-minattos-projects.vercel.app/api/mcp/http
```

## 🚨 Troubleshooting

### Erro de Conexão
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme se o Supabase está acessível
3. Teste o endpoint de health check

### Timeout
- Aumente `maxDuration` se necessário
- Otimize queries do Supabase
- Use índices apropriados

### Erro de CORS
- Verifique configuração no `vercel.json`
- Confirme headers de CORS

## 🔄 Atualizações Futuras

### Fase 6 - Expansão MCP
- [ ] Integração com WhatsApp Business
- [ ] Ferramentas de relatórios avançados
- [ ] Integração com sistemas de pagamento
- [ ] Backup e restauração de dados
- [ ] Integração com equipamentos médicos

### Otimizações Planejadas
- [ ] Cache de respostas frequentes
- [ ] Compressão de dados
- [ ] Webhooks para notificações
- [ ] Autenticação OAuth2

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a integração MCP:

1. **Documentação**: Consulte este arquivo
2. **Logs**: Verifique logs da Vercel
3. **Health Check**: Use a ferramenta de verificação
4. **Issues**: Reporte problemas no repositório

---

## ✅ Status da Implementação

- [x] Configuração básica do MCP
- [x] Ferramentas de agenda
- [x] Ferramentas de pacientes  
- [x] Ferramentas de tarefas
- [x] Analytics e monitoramento
- [x] Deploy na Vercel
- [x] Documentação completa
- [x] Testes de conectividade

**Sistema MCP 100% funcional e pronto para uso em produção! 🎉** 