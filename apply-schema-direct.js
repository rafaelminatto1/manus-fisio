const https = require('https');

const supabaseUrl = 'https://hycudcwtuocmufhpsnmr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3VkY3d0dW9jbXVmYWhwc25tciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzcwNDEwODQsImV4cCI6MjA1MjYxNzA4NH0.WN6r0TejH0LKqTPmQYyQfF8Q7SMLM-yfF1x8a_BPVYs';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'hycudcwtuocmufhpsnmr.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function applySchema() {
  console.log('🚀 Aplicando schema do Manus Fisio...');

  try {
    // 1. Criar tabela de usuários
    console.log('📝 Criando tabela users...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          avatar_url TEXT,
          role TEXT DEFAULT 'guest' CHECK (role IN ('admin', 'mentor', 'intern', 'guest')),
          crefito TEXT,
          specialty TEXT,
          university TEXT,
          semester INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Criar tabela de notebooks
    console.log('📝 Criando tabela notebooks...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS notebooks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          icon TEXT DEFAULT '📁',
          color TEXT DEFAULT 'default',
          category TEXT NOT NULL,
          is_public BOOLEAN DEFAULT false,
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Criar tabela de páginas
    console.log('📝 Criando tabela pages...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content JSONB DEFAULT '{}',
          slug TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          is_published BOOLEAN DEFAULT false,
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(notebook_id, slug)
      );
    `);

    // 4. Criar tabela de projetos
    console.log('📝 Criando tabela projects...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          due_date DATE,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Criar tabela de tarefas
    console.log('📝 Criando tabela tasks...');
    await executeSql(`
      CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
          due_date DATE,
          estimated_hours INTEGER,
          actual_hours INTEGER DEFAULT 0,
          order_index INTEGER DEFAULT 0,
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ Schema aplicado com sucesso!');
    console.log('🎉 Banco de dados do Manus Fisio configurado!');

  } catch (error) {
    console.error('❌ Erro ao aplicar schema:', error.message);
  }
}

applySchema(); 