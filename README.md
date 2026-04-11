# Dojo Virtual - Frontend

[![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-green.svg?style=flat-square)](./LICENSE)
[![Repositório](https://img.shields.io/badge/GitHub-dojo--virtual-181717?style=flat-square&logo=github)](https://github.com/johnpaulo0602/dojo-virtual)

Aplicação web para apoiar a gestão do **Dojo Virtual**, uma operação de jiu-jitsu, centralizando rotinas administrativas, pedagógicas e financeiras em uma única interface. O sistema foi pensado para dar visibilidade ao dia a dia da equipe e reduzir controles dispersos em planilhas, mensagens e processos manuais.

## Sobre o projeto

O objetivo deste frontend é oferecer uma experiência clara para acompanhamento da operação, com foco em organização, consulta rápida e registro de informações importantes. A aplicação atende fluxos como:

- visão geral da operação no dashboard;
- gestão de alunos e perfis individuais;
- organização de turmas, aulas e presenças;
- acompanhamento da equipe técnica e das escolas;
- controle financeiro, incluindo receitas, despesas, doações e relatórios;
- áreas de configuração para manter cadastros e regras do sistema.

Em termos práticos, o projeto busca facilitar tomada de decisão, melhorar rastreabilidade das informações e dar mais consistência ao trabalho diário da equipe.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- React Hook Form + Zod
- Vitest + Testing Library

## Como rodar localmente

Pré-requisitos:

- Node.js 18+
- npm

### 1. Configuração de Ambiente
O projeto precisa saber onde a API FastAPI está rodando para o backend funcionar em modo de produção/deploy. O arquivo `src/lib/api.ts` tem um fallback padrão para `http://localhost:8000`, mas em ambientes reais você deve criar um `.env`:
```bash
cp .env.example .env
```
*(Edite o arquivo `.env` com a `VITE_API_URL` correta se a sua API estiver em outra porta ou domínio).*

### 2. Inicie o servidor

Instale as dependências e inicie o servidor de desenvolvimento:

```sh
npm install
npm run dev
```

O servidor do Vite roda em `http://localhost:8080`.

## Scripts disponíveis

```sh
npm run dev         # desenvolvimento local
npm run build       # build de produção em dist/
npm run build:dev   # build em modo development
npm run preview     # preview da aplicação buildada
npm run lint        # validação com ESLint
npm test            # execução única dos testes
npm run test:watch  # testes em modo watch
```

## Estrutura do projeto

```text
src/
  components/       # componentes compartilhados e por domínio
  config/           # configurações da aplicação
  contexts/         # providers React
  data/             # dados mockados
  hooks/            # hooks reutilizáveis
  pages/            # telas de rota
  schemas/          # schemas Zod e validações
  test/             # setup e testes
```

Assets públicos ficam em `public/`. Configurações de build e ferramentas estão em arquivos como `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js` e `vitest.config.ts`.

## Testes

Os testes rodam em `jsdom` e usam `src/test/setup.ts` como configuração global. Novos testes devem seguir o padrão `*.test.ts` ou `*.test.tsx`, preferencialmente próximos da funcionalidade validada.

## Contribuição

Prefira o alias `@/` em vez de imports relativos longos. Siga o estilo já existente: componentes funcionais, TypeScript como padrão, aspas duplas, ponto e vírgula e indentação de 2 espaços. Antes de abrir um PR, execute `npm run lint` e `npm test`.

Este repositório usa a licença MIT. Para fluxo de contribuição e padrões de colaboração, consulte [CONTRIBUTING.md](./CONTRIBUTING.md) e [AGENTS.md](./AGENTS.md).
