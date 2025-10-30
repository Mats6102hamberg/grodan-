
# 🐸 Grodan — Multi-tenant AI Headmaster (Vercel + Supabase + Prisma)

A starter to deploy on Vercel with:
- Next.js (App Router)
- NextAuth (email or Google)
- Supabase Postgres (with `pgvector`) via Prisma
- RAG cache with general (public) and personal memories
- Headmaster that routes to 4 agent tiers based on complexity
- Daily reminder cron
- Simple handsfree chat using the Web Speech API

## Quick start

1) Create a Supabase project → enable `pgvector` extension.
2) Copy `.env.example` to `.env.local` and fill values (DB, OpenAI, NextAuth secret, optional Google OAuth).
3) `npm i`
4) `npx prisma migrate dev`
5) `npm run dev`
6) Push to GitHub and import to Vercel. Vercel will use envs and the cron in `vercel.json`.

## Notes
- Vector columns require `pgvector`. In Supabase: SQL → `create extension if not exists vector;`
- The chat API caches Q&A in `PublicQA` (org/public) and `Memory` (per-user) with embeddings.
- The headmaster uses a simple scoring function to decide agent tier (1..4); adjust in `src/lib/headmaster.ts`.
