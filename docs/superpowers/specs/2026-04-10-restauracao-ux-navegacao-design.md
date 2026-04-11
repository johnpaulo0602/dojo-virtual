# Design Spec: Reestruturação de Navegação e UX do Projeto

## 1. Introdução
Este documento detalha as mudanças na arquitetura de informação e navegação do sistema de gestão do Projeto Social Jiu-Jitsu. O objetivo é melhorar a semântica dos menus e agrupar funcionalidades de forma mais intuitiva para o usuário.

## 2. Reestruturação do Sidebar (`src/config/navigation.ts`)

### 2.1 Renomeação de Itens
- **Origem:** "Jiu-Jitsu" (Página de faixas e graus).
- **Destino:** "Graduações".
- **Motivo:** Termo mais preciso para o conteúdo da página (Sistema de Graduação).

### 2.2 Reorganização do Grupo "Configurações"
- O item pai "Configurações" continuará sendo um grupo expansível (sem rota própria).
- Adição de um novo sub-item: **"Projeto"**.
- **Rota:** `/configuracoes`.
- **Papel:** `admin`.
- **Ordem:** Primeiro item do grupo.

## 3. Refatoração de Páginas e Lógica

### 3.1 Página "Projeto" (`src/pages/Configuracoes.tsx`)
- **Título da Página:** Renomear de "Configurações" para "Configurações do Projeto".
- **Remoção de Seção:** A seção "Notificações" (Card, switches e estados) será removida integralmente desta página.
- **Conteúdo Mantido:** Informações do Projeto, Redes Sociais, Gestores e Padrões do Sistema.

### 3.2 Página "Minha Conta" (`src/pages/Conta.tsx`)
- **Adição de Seção:** Inclusão da seção "Notificações" (Card de preferências de alerta).
- **Lógica:** Implementar os estados `useState` para gerenciar os switches de notificação transferidos.
- **Motivo:** Notificações são preferências individuais do usuário/conta, não do projeto global.

## 4. Ajustes no Sidebar (`src/components/dashboard/app-sidebar.tsx`)
- O link no menu de perfil (footer) para "Configurações" será mantido, mas o usuário agora terá o feedback visual de estar na seção "Configurações > Projeto" do sidebar.

## 5. Verificação e Sucesso
- [ ] Sidebar exibe "Graduações" no lugar de "Jiu-Jitsu".
- [ ] Sidebar exibe "Projeto" dentro de "Configurações".
- [ ] Página `/configuracoes` não contém mais o card de Notificações.
- [ ] Página `/conta` contém o card de Notificações funcional.
