# Guia de Deploy

Este guia detalha o processo de deploy da aplicação na Vercel.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com/) conectada ao seu repositório GitHub.
- Projeto Vercel criado e linkado a este repositório.

## Deploy Automático

Qualquer `push` para a branch `master` irá acionar um novo deploy de produção automaticamente na Vercel.

## Deploy Manual

Para forçar um deploy manual, use o CLI da Vercel:

```bash
# Instalar o CLI (se ainda não tiver)
npm i -g vercel

# Fazer o deploy para produção
vercel --prod
```

## Variáveis de Ambiente

As seguintes variáveis de ambiente precisam ser configuradas no dashboard do seu projeto na Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Estas chaves são encontradas no seu dashboard do Supabase em `Project Settings > API`. 