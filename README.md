<div align="center">

<img src="public/escudo.svg" width="120" alt="Amambaí F.C."/>

# Amambaí F.C. — Bolão Copa do Mundo

**O bolão que as pessoas não largam até o apito final.**

Três competições paralelas. Atualização automática. Custo zero.
Em homenagem ao Praça Amambaí Futebol Clube — Meier, Rio de Janeiro — 1993.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marcuspbq/amambai-fc)

</div>

---

## ⚽ As 3 Competições

### 🏆 Campeão Geral
Bolão tradicional com palpites de placares. Pontuação automática:
| Acerto | Pontos |
|---|---|
| Vencedor correto | +3 |
| Empate correto | +3 |
| Placar exato | +7 |
| Classificado no mata-mata | +2 |
| Campeão correto (bônus) | +10 |

### 👑 Rei dos Artilheiros
Draft de 3 jogadores antes da Copa. Os gols deles são seus gols. Quem tiver mais gols ao final vence.

### 📈 Trader da Copa
Escolha 1 seleção favorita (×1), 1 intermediária (×1.5) e 1 zebra (×2). Pontos por avanço no torneio multiplicados pela categoria escolhida.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)
- Chave da [API-Football](https://api-sports.io) (plano grátis: 100 req/dia)

### 1. Clone o repositório
```bash
git clone https://github.com/marcuspbq/amambai-fc.git
cd amambai-fc
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase e API-Football
```

### 3. Configure o banco de dados
Abra o [SQL Editor do Supabase](https://supabase.com/dashboard) e execute o arquivo:
```
supabase-schema.sql
```

### 4. Rode em desenvolvimento
```bash
npm run dev
# Abre em http://localhost:3000
```

### 5. Deploy na Vercel (gratuito)
```bash
npx vercel
# Siga o wizard e adicione as variáveis de ambiente
```

---

## 💰 Custo Total

| Serviço | Plano | Custo |
|---|---|---|
| Vercel | Hobby (gratuito) | R$ 0 |
| Supabase | Free tier | R$ 0 |
| API-Football | Free (100 req/dia) | R$ 0 |
| API-Football | Pro (durante a Copa) | ~R$ 65 |
| **Total** | | **R$ 0 a R$ 65** |

> Para 20 participantes, o plano gratuito da API-Football pode ser suficiente.
> O plano pago ($12/mês) é recomendado nos dias com muitos jogos simultâneos.

---

## 🏗️ Arquitetura

```
Next.js 14 (App Router)
├── PWA — instala como app no celular
├── Supabase — PostgreSQL + Auth + Realtime
├── Vercel Cron — sincroniza resultados a cada 5 min
└── API-Football — placares e artilheiros em tempo real
```

---

## 📱 Funcionalidades

- ✅ PWA — funciona como app no celular sem App Store
- ✅ Palpites com deadline automático (30min antes do jogo)
- ✅ Draft ao vivo com timer por participante
- ✅ Ranking em tempo real (WebSocket)
- ✅ Notificações push para gols e mudanças no ranking
- ✅ Atualização automática de resultados via API
- ✅ Dark mode com identidade visual do clube
- ✅ Custo zero para grupos de até 20 pessoas

---

## 📁 Estrutura do Projeto

```
amambai-fc/
├── app/
│   ├── page.tsx              # Home / Dashboard
│   ├── palpites/page.tsx     # Tela de palpites
│   ├── ranking/page.tsx      # Rankings (3 tabs)
│   ├── perfil/page.tsx       # Perfil do participante
│   └── api/
│       └── sync/route.ts     # Worker de sincronização
├── lib/
│   ├── supabase.ts           # Client Supabase
│   ├── football-api.ts       # Integração API-Football
│   └── scoring.ts            # Lógica de pontuação
├── types/index.ts            # Tipos TypeScript
├── supabase-schema.sql       # Schema completo do banco
├── public/
│   ├── escudo.svg            # Escudo Amambaí F.C.
│   └── manifest.json         # PWA manifest
└── .env.example              # Template de variáveis
```

---

## 🔧 Configuração do Cron (Vercel)

O arquivo `vercel.json` já configura o cron para sincronizar a cada 5 minutos:
```json
{
  "crons": [{ "path": "/api/sync", "schedule": "*/5 * * * *" }]
}
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin do Supabase (só server) |
| `FOOTBALL_API_KEY` | Chave da API-Football |
| `WORLD_CUP_LEAGUE_ID` | ID da Copa na API (buscar via /leagues) |
| `WORLD_CUP_SEASON` | Ano da Copa (ex: 2026) |
| `API_SECRET` | Segredo para proteger a rota /api/sync |

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Abra uma issue primeiro para discutir o que você gostaria de mudar.

---

## 📜 Licença

MIT © [Marcus Paulo](https://github.com/marcuspbq)

---

<div align="center">

Feito com 💚 e saudade dos tempos de pelada na Praça Amambaí — Meier, Rio de Janeiro

**⚽ 1993 · Camisa 10 · Sempre**

</div>
