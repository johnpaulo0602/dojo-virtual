# Contribuindo

Obrigado por contribuir com este projeto.

## Antes de começar

- Use Node.js 18+ e `npm install` para preparar o ambiente.
- Rode a aplicação com `npm run dev`.
- Leia [AGENTS.md](./AGENTS.md) para regras específicas do repositório.

## Fluxo recomendado

1. Crie uma branch curta e descritiva.
2. Faça mudanças pequenas e focadas.
3. Valide localmente com:

```sh
npm run lint
npm test
npm run build
```

4. Abra um Pull Request usando o template do repositório.

## Padrões de código

- Use TypeScript e componentes funcionais React.
- Prefira o alias `@/` para imports internos.
- Mantenha o estilo já presente no projeto: aspas duplas, ponto e vírgula e indentação de 2 espaços.
- Não edite `dist/` manualmente.

## Pull Requests

- Explique o problema e a solução.
- Liste como a mudança foi validada.
- Inclua screenshots ou gravações curtas quando houver impacto visual.
- Se houver mudança de comportamento, descreva o risco e o impacto esperado.

## Issues

- Use os templates para reportar bugs ou sugerir melhorias.
- Inclua passos para reproduzir, resultado esperado e contexto suficiente para análise.
