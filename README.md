# Catálogo Online de Atacado — Vitrine de Exposição

Vitrine de produtos + painel admin + contato direto via WhatsApp. **Não é um e-commerce**: não há carrinho, pedido nem pagamento — o comprador vê a peça e clica em "Comprar no WhatsApp", que abre a conversa com a loja com uma mensagem pré-formatada. A venda acontece 100% no WhatsApp.

Desenvolvido por **BarvoxIA**.

## Stack

| Camada       | Tecnologia                           |
| ------------ | ------------------------------------ |
| Framework    | Next.js 16 (App Router, Turbopack)   |
| UI           | Tailwind CSS v4 + shadcn/ui          |
| Banco        | Supabase (PostgreSQL)                |
| ORM          | Prisma 7 (driver adapter pg)         |
| Imagens      | Supabase Storage (bucket `products`) |
| Auth (admin) | Supabase Auth (e-mail/senha)         |
| Hospedagem   | Vercel                               |
| WhatsApp     | Link direto `wa.me` (sem API)        |

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npx prisma migrate dev # cria as tabelas
node scripts/apply-rls.mjs  # aplica as policies de segurança (RLS)
npx prisma db seed     # (opcional) dados de exemplo
npm run dev            # http://localhost:3000
```

### Variáveis de ambiente (`.env`)

| Variável                        | Onde pegar                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                  | Supabase → Connect → ORM/Prisma → **Transaction pooler** (porta 6543) + `?pgbouncer=true`                    |
| `DIRECT_URL`                    | Mesmo lugar → **Session pooler** (porta 5432) — usada pelo Prisma CLI                                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project Settings → API → Project URL                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → chave `anon public`                                                                 |
| `NEXT_PUBLIC_SITE_URL`          | URL pública do site (ex: `https://sualoja.vercel.app`) — usada nos links da mensagem WhatsApp e no OpenGraph |

> Use os hosts do **pooler** (`*.pooler.supabase.com`) — a conexão direta (`db.*.supabase.co`) é IPv6-only e falha em redes sem IPv6.

### Storage

Crie um bucket **público** chamado `products` (Storage → New bucket). As policies de escrita/leitura são aplicadas pelo `scripts/apply-rls.mjs`.

### Criando o primeiro admin

1. Supabase Dashboard → **Authentication → Users → Add user** (marque _Auto Confirm User_)
2. Rode:

```bash
node scripts/create-admin.mjs email@exemplo.com "Nome do Admin"
```

3. Faça login em `/admin/login`

## Scripts

| Comando                                                 | O que faz                                        |
| ------------------------------------------------------- | ------------------------------------------------ |
| `npm run dev`                                           | Servidor de desenvolvimento                      |
| `npm run build` / `npm start`                           | Build e servidor de produção                     |
| `npm run lint` / `npm run typecheck` / `npm run format` | Qualidade de código                              |
| `npm run prisma:migrate`                                | Cria/aplica migrations                           |
| `npm run prisma:seed`                                   | Dados de exemplo                                 |
| `node scripts/apply-rls.mjs`                            | (Re)aplica as policies RLS de `supabase/rls.sql` |
| `node scripts/create-admin.mjs <email> [nome]`          | Registra um usuário do Supabase Auth como admin  |

## Deploy na Vercel

1. Suba o repositório para o GitHub
2. Vercel → **Add New Project** → importe o repositório (Next.js é detectado automaticamente)
3. Em **Environment Variables**, adicione as 5 variáveis do `.env` — com `NEXT_PUBLIC_SITE_URL` apontando para a URL final (ex: `https://sualoja.vercel.app`)
4. Deploy. Depois, teste compartilhar um link de peça no WhatsApp — deve aparecer o preview com foto + nome + preço (OpenGraph)

## Estrutura

```
app/
  (public)/            # Vitrine: grade, filtro por categoria, detalhe da peça
  admin/
    login/             # Login (Supabase Auth + tabela admins)
    (painel)/          # Dashboard, Loja, Categorias, Peças (protegidos)
  api/health/          # Health check (app + banco)
components/
  ui/                  # shadcn/ui
  admin/  vitrine/     # Componentes específicos
lib/
  actions/             # Server Actions (loja, categorias, peças, fotos, cores)
  queries/             # Consultas da vitrine
  supabase/            # Clients server/browser
  whatsapp.ts          # Mensagem pré-formatada + link wa.me
proxy.ts               # Proteção de /admin/* (ex-middleware)
prisma/                # Schema, migrations e seed
supabase/rls.sql       # Policies de Row Level Security
```

## Manual rápido do lojista

- **Cadastrar peça**: Admin → Peças → Nova peça. Depois de salvar, adicione até 5 fotos (a primeira é a capa) e as cores.
- **Peça esgotou?** Na listagem, clique no badge "Disponível" — vira "Esgotado" na hora. O comprador ainda pode perguntar sobre reposição.
- **Destacar peça**: selecione "Novidade" ou "Mais vendida" direto na listagem.
- **Tirar peça do ar sem excluir**: desligue o switch "Publicada".
- **Observação de preço** (ex: _a partir de 6 peças: 31,99 a und._): campo opcional no cadastro da peça, aparece junto do preço na vitrine.
- **Trocar o WhatsApp**: Admin → Loja. Formato: `5511999999999` (país + DDD + número, só dígitos).

## Problemas comuns

| Sintoma                                           | Causa provável / solução                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| `prisma migrate` trava                            | Está usando a porta 6543 — confira se `DIRECT_URL` usa a porta **5432**   |
| "E-mail ou senha inválidos" com senha certa       | Usuário não confirmado no Supabase (recrie com _Auto Confirm User_)       |
| "Acesso negado: este usuário não é administrador" | Falta registrar na tabela `admins`: `node scripts/create-admin.mjs email` |
| Botão do WhatsApp não aparece                     | `whatsappNumber` vazio — configure em Admin → Loja                        |
| Upload de foto falha                              | Bucket `products` não existe / não é público, ou RLS não aplicada         |
| Preview do link sem foto no WhatsApp              | Só funciona com o site publicado (o WhatsApp não acessa localhost)        |
