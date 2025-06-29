
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Carregar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erro: As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam ser definidas.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function gerarRelatorioAuditoria() {
  console.log('Iniciando a geração do relatório de auditoria LGPD...');

  try {
    const { data: logs, error } = await supabaseAdmin
      .from('activity_logs')
      .select(`
        created_at,
        action,
        entity_type,
        entity_id,
        new_values,
        old_values,
        ip_address,
        user:users (email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(1000); // Limite para evitar sobrecarga

    if (error) {
      throw new Error(`Erro ao buscar logs de atividade: ${error.message}`);
    }

    if (!logs || logs.length === 0) {
      console.log('Nenhum log de atividade encontrado.');
      return;
    }

    console.log(`Encontrados ${logs.length} registros de log.`);

    let relatorio = '# Relatório de Auditoria de Conformidade LGPD\n\n';
    relatorio += 'Este relatório documenta as atividades registradas no sistema que são relevantes para a conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\n';
    relatorio += '| Data/Hora da Ação | Usuário | Ação | Entidade Afetada | ID da Entidade | Detalhes da Alteração | Endereço IP |\n';
    relatorio += '|---|---|---|---|---|---|---|\n';

    for (const log of logs) {
      const dataHora = new Date(log.created_at).toLocaleString('pt-BR');
      const usuario = log.user ? `${log.user.full_name} (${log.user.email})` : 'Sistema';
      const acao = log.action;
      const entidade = log.entity_type;
      const entidadeId = log.entity_id;
      const ip = log.ip_address || 'N/A';
      let detalhes = '';

      if (acao === 'INSERT') {
        detalhes = `Novo registro criado.`;
      } else if (acao === 'UPDATE') {
        const oldData = log.old_values || {};
        const newData = log.new_values || {};
        const changes = Object.keys(newData).reduce((acc, key) => {
          if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            acc.push(`**${key}**`);
          }
          return acc;
        }, []);
        detalhes = `Campos atualizados: ${changes.join(', ') || 'Nenhum'}`;
      } else if (acao === 'DELETE') {
        detalhes = `Registro deletado.`;
      }

      relatorio += `| ${dataHora} | ${usuario} | ${acao} | ${entidade} | ${entidadeId} | ${detalhes} | ${ip} |\n`;
    }

    fs.writeFileSync('RELATORIO_AUDITORIA_LGPD.md', relatorio);
    console.log('\n✅ Relatório de auditoria LGPD gerado com sucesso em RELATORIO_AUDITORIA_LGPD.md');

  } catch (err) {
    console.error('\n❌ Falha ao gerar o relatório:', err.message);
  }
}

gerarRelatorioAuditoria();
