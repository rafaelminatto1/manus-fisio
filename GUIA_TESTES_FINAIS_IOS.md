# ✅ Guia de Testes Finais em Dispositivos iOS

**Versão:** 1.0  
**Data:** 28 de junho de 2025

## 1. Objetivo

Este guia tem como objetivo validar a funcionalidade, performance e experiência de usuário (UX) do PWA (Progressive Web App) do Sistema Manus Fisio em dispositivos Apple (iPhone e iPad) antes do lançamento oficial para toda a equipe.

## 2. Dispositivos Recomendados

Para garantir uma cobertura adequada, recomenda-se realizar os testes em pelo menos:
- Um iPhone com notch/Dynamic Island (Ex: iPhone 12 ou mais recente).
- Um iPhone com botão Home (Ex: iPhone SE, iPhone 8).
- Um iPad (qualquer modelo recente).

## 3. Checklist de Testes

Marque cada item ao ser concluído com sucesso em cada um dos dispositivos testados.

### 3.1 Instalação e Acesso (PWA)

- [ ] **Adicionar à Tela de Início:**
    - Abrir o sistema no Safari.
    - Usar a opção "Compartilhar" > "Adicionar à Tela de Início".
    - Verificar se o ícone do app aparece corretamente.
- [ ] **Lançamento:**
    - Abrir o app pelo ícone na tela de início.
    - Confirmar que ele abre em sua própria janela (modo standalone), sem a barra de endereço do navegador.
- [ ] **Tela de Abertura (Splash Screen):**
    - Verificar se a tela de abertura personalizada é exibida enquanto o app carrega.
- [ ] **Login e Sessão:**
    - Realizar o login com sucesso.
    - Fechar e reabrir o app para garantir que a sessão do usuário permaneça ativa.

### 3.2 Interface e Experiência do Usuário (UX)

- [ ] **Responsividade e Layout:**
    - Navegar por todas as telas principais (Dashboard, Projetos, Notebooks, Calendário).
    - Verificar se não há elementos quebrados ou sobrepostos nas orientações retrato e paisagem.
- [ ] **Áreas Seguras (Safe Areas):**
    - Confirmar que os elementos da interface (botões, menus) não estão obstruídos pelo notch, Dynamic Island ou pela barra de gestos na parte inferior da tela.
- [ ] **Gestos Nativos:**
    - Testar o gesto de "puxar para atualizar" nas listas (se aplicável).
    - Verificar se a rolagem (scroll) é suave e responsiva.
- [ ] **Feedback Tátil:**
    - Sentir se ações importantes (como completar uma tarefa ou criar um evento) fornecem um retorno de vibração sutil.

### 3.3 Funcionalidades Core

- [ ] **Criação de Conteúdo:**
    - Criar um novo Notebook.
    - Dentro dele, criar uma nova Página e adicionar alguns blocos de texto no Editor Rico.
    - Salvar e verificar se o conteúdo persiste.
- [ ] **Gestão de Projetos:**
    - Criar um novo Projeto.
    - Adicionar uma Tarefa ao Kanban.
    - Mover a tarefa entre as colunas ("A Fazer", "Em Progresso", "Concluído").
- [ ] **Colaboração:**
    - Deixar um comentário em uma tarefa.
    - Mencionar outro usuário (`@nome`) e verificar se a notificação (se já ativa) é recebida.

### 3.4 Modo Offline

1.  Navegue por algumas páginas de um Notebook para que elas sejam cacheadas.
2.  Ative o **Modo Avião** no dispositivo.
3.  Abra o PWA novamente.

- [ ] **Acesso Offline:**
    - Verificar se é possível ler o conteúdo das páginas que foram visitadas anteriormente.
- [ ] **Sincronização Automática:**
    - Desative o Modo Avião.
    - Verificar se o aplicativo se reconecta e sincroniza quaisquer dados (se houver ações pendentes).

### 3.5 Performance

- [ ] **Tempo de Carregamento:**
    - Avaliar o tempo que o app leva para carregar inicialmente.
- [ ] **Navegação:**
    - Medir a fluidez da navegação entre as diferentes seções do sistema.
- [ ] **Uso de Bateria:**
    - Usar o app por 10-15 minutos e observar se há um consumo anormal de bateria (indicativo de processos pesados em segundo plano).

## 4. Relatório de Bugs e Feedback

Para cada problema encontrado, por favor, registre as seguintes informações no Notebook "Feedback e Melhorias" dentro do próprio sistema:

- **Dispositivo:** (Ex: iPhone 14 Pro, iPad Air 5)
- **Versão do iOS:** (Ex: iOS 17.5)
- **Descrição do Problema:** (O que aconteceu?)
- **Passos para Reproduzir:** (Como podemos ver o erro acontecer?)
- **Captura de Tela (Screenshot):** (Se possível, anexe uma imagem do problema).
