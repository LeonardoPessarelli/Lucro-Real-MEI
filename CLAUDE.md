# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

Projeto **Lucro Real MEI** — PWA mobile-first para MEIs dividirem faturamento em 3 potes (Custos, Reserva, Salário).

Leia `architecture.md` antes de qualquer tarefa. O projeto principal fica em `lucro-real-mei/`.

## Stack

Next.js 16 (App Router) · React 19 · Supabase (Postgres + Auth) · Tailwind v4 · Vitest · Vercel · Asaas · Resend

## Comandos

```bash
cd lucro-real-mei
npm run dev      # servidor local
npm test         # 8 testes unitários (Vitest)
npx tsc --noEmit # verificar TypeScript
```

## Permissions

Git commands are pre-approved (`Bash(git *)`). TypeScript check pre-approved (`Bash(npx tsc *)`). Other shell commands will prompt for user confirmation.
