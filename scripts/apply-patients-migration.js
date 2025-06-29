#!/usr/bin/env node

/**
 * Script para aplicar a migração do módulo de pacientes
 * Aplica o SQL diretamente no banco de dados de produção
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase
const SUPABASE_URL = 'https://hycudcwtuocmufhpsnmr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'CONFIGURE_SUA_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyPatientsMigration() {
  console.log('🚀 Aplicando migração do módulo de pacientes...');
  
  try {
    // Lê o arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250628180000_add_patients_module.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado');
    console.log('📊 Executando SQL...');
    
    // Executa a migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      process.exit(1);
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('  - patients (dados dos pacientes)');
    console.log('  - patient_records (prontuários)');
    console.log('  - project_patients (associações)');
    console.log('');
    console.log('🎉 Módulo de pacientes pronto para uso!');
    console.log('🌐 Acesse: http://localhost:3000/patients');
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  }
}

// Executa o script
applyPatientsMigration(); 