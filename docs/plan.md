# Plano de Deploy — Lucro Real MEI

Passos que ainda precisam ser feitos antes de o app funcionar em produção.

---

## 1. Configurar variáveis de ambiente (`lucro-real-mei/.env.local`)

Crie o arquivo `lucro-real-mei/.env.local` com o seguinte conteúdo e preencha cada valor:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Dashboard → Settings → API → service_role

# Resend (e-mails)
RESEND_API_KEY=re_...                     # resend.com → API Keys

# Asaas (pagamentos)
ASAAS_API_KEY=$aact_...                   # Asaas → Integrações → API Key
ASAAS_WEBHOOK_TOKEN=TOKEN_QUE_VOCE_INVENTAR  # qualquer string secreta, ex: "meu-token-123"

# URL do app
NEXT_PUBLIC_APP_URL=https://SEU-DOMINIO.vercel.app
```

> **Segurança:** `.env.local` já está no `.gitignore`. NUNCA commite esse arquivo.

---

## 2. Migração do banco de dados (Supabase)

1. Acesse [supabase.com](https://supabase.com) → seu projeto → **SQL Editor**
2. Cole e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Verifique no **Table Editor** que as tabelas `profiles`, `transactions` e `subscriptions` foram criadas

---

## 3. Template de e-mail de confirmação (Supabase)

1. Supabase Dashboard → **Authentication** → **Email Templates** → **Confirm signup**
2. Altere o assunto para: `Confirme seu e-mail — Lucro Real MEI`
3. Cole este HTML no corpo:

```html
<h2>Confirme seu e-mail</h2>
<p>Olá! Clique no botão abaixo para ativar sua conta no Lucro Real MEI.</p>
<a href="{{ .ConfirmationURL }}"
   style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;
          border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
  Confirmar e-mail
</a>
<p style="color:#888;font-size:12px;margin-top:24px">
  Se você não criou uma conta, ignore este e-mail.
</p>
```

---

## 4. Configurar domínio no Resend (e-mails)

**Opção A — Domínio próprio (recomendado para produção):**
1. [resend.com](https://resend.com) → **Domains** → Add Domain → `lucrorelmei.com.br`
2. Adicione os registros DNS que o Resend mostrar (TXT + MX) no seu provedor
3. Aguarde verificação (pode levar alguns minutos)

**Opção B — Rápido para testar:**
- Altere a linha `FROM` em `lucro-real-mei/src/lib/resend.ts`:
  ```ts
  const FROM = 'Lucro Real MEI <onboarding@resend.dev>'
  ```
- Funciona imediatamente, mas só envia para o seu próprio e-mail

---

## 5. Configurar webhook no Asaas

1. Acesse [Asaas](https://www.asaas.com) → **Integrações** → **Webhooks** → Adicionar
2. URL: `https://SEU-DOMINIO.vercel.app/api/webhooks/asaas`
3. Token (campo "Token de autenticação"): o mesmo valor que você colocou em `ASAAS_WEBHOOK_TOKEN`
4. Eventos para ativar:
   - `PAYMENT_RECEIVED`
   - `PAYMENT_CONFIRMED`
   - `PAYMENT_OVERDUE`
   - `SUBSCRIPTION_DELETED`

---

## 6. Deploy no Vercel

```bash
cd lucro-real-mei
npx vercel --prod
```

Durante o primeiro deploy o Vercel vai perguntar sobre o projeto. Responda:
- "Link to existing project?" → **No**
- "Project name" → `lucro-real-mei`
- "Directory" → `./` (você já está dentro de `lucro-real-mei/`)

Depois do deploy, copie a URL gerada (ex: `https://lucro-real-mei.vercel.app`) e:
1. Atualize `NEXT_PUBLIC_APP_URL` no Vercel Dashboard → **Settings** → **Environment Variables**
2. Atualize o webhook do Asaas com a URL real

---

## 7. Variáveis de ambiente no Vercel

Para que o app funcione em produção, adicione no Vercel Dashboard → **Settings** → **Environment Variables** todas as variáveis do `.env.local` (as mesmas do passo 1).

---

## Checklist final

- [x] `.env.local` criado e preenchido (feat/supabase-core)
- [x] Migração SQL executada no Supabase (tabelas profiles, transactions, subscriptions com RLS)
- [x] Migrations de RLS hardening aplicadas (002_rls_hardening, 20260428_rls_improvements, 20260429_rls_perf_fixes)
- [x] Trigger `on_auth_user_created` ativo — cria profile automaticamente no cadastro
- [x] Auth conectado ao Supabase (Google OAuth + e-mail/senha + cadastro)
- [x] Middleware de proteção de rotas (`middleware.ts`) — redireciona não-autenticados e trial expirado
- [x] Callback OAuth (`/api/auth/callback`) — troca code, cria subscription trial, e-mail de boas-vindas
- [x] Logout (`/api/auth/logout`) + `LogoutButton`
- [x] RLS policies auditadas e otimizadas com `(select auth.uid())` em todas as tabelas
- [x] `handle_new_user()` com REVOKE de PUBLIC — não exposta via `/rpc`
- [x] BottomNav corrigido (itens duplicados removidos)
- [x] Webhook Asaas — detecta plano do evento e salva campo `plan` na subscription
- [ ] Leaked password protection ativar: Supabase Dashboard → Auth → Settings → Enable leaked password protection
- [ ] Template de e-mail configurado no Supabase
- [ ] Resend configurado (domínio verificado ou `onboarding@resend.dev`)
- [ ] Webhook configurado no Asaas
- [ ] Deploy feito no Vercel
- [ ] Variáveis de ambiente adicionadas no Vercel Dashboard
- [ ] `NEXT_PUBLIC_APP_URL` atualizado com a URL real de produção
